import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// POST - Track event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get IP from headers
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';

    const event = {
      event_type: body.type,
      visitor_id: body.visitorId,
      session_id: body.sessionId,
      page: body.page || body.url,
      url: body.url,
      referrer: body.referrer,
      product_id: body.productId,
      product_name: body.productName,
      product_price: body.productPrice,
      quantity: body.quantity,
      cart_total: body.cartTotal,
      search_query: body.searchQuery,
      button_id: body.buttonId,
      // UTM params
      utm_source: body.utm_source,
      utm_medium: body.utm_medium,
      utm_campaign: body.utm_campaign,
      utm_term: body.utm_term,
      utm_content: body.utm_content,
      // Ad click IDs
      fbclid: body.fbclid,
      gclid: body.gclid,
      ttclid: body.ttclid,
      // Device info
      device: body.device,
      language: body.language,
      screen_width: body.screenWidth ? parseInt(body.screenWidth) : null,
      screen_height: body.screenHeight ? parseInt(body.screenHeight) : null,
      ip_address: ip,
      // Metadata
      metadata: body.metadata ? JSON.stringify(body.metadata) : null,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('analytics_events')
      .insert([event]);

    if (error) {
      console.error('Analytics insert error:', error);
      // Don't throw - we don't want to break the user experience
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Analytics error:', error);
    return NextResponse.json({ success: false }, { status: 200 }); // Still return 200 to not block client
  }
}

// GET - Fetch analytics data (for dashboard)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 1d, 7d, 30d, all
    const type = searchParams.get('type') || 'summary'; // summary, events, sources, products, funnel

    // Calculate date range
    let startDate: Date;
    const now = new Date();

    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    if (type === 'summary') {
      // Get summary stats
      const [pageViews, uniqueVisitors, productViews, addToCarts, checkouts, orders, topSources, topProducts] = await Promise.all([
        // Total page views
        supabase
          .from('analytics_events')
          .select('id', { count: 'exact' })
          .eq('event_type', 'page_view')
          .gte('created_at', startDate.toISOString()),

        // Unique visitors
        supabase
          .from('analytics_events')
          .select('visitor_id')
          .gte('created_at', startDate.toISOString()),

        // Product views
        supabase
          .from('analytics_events')
          .select('id', { count: 'exact' })
          .eq('event_type', 'product_view')
          .gte('created_at', startDate.toISOString()),

        // Add to carts
        supabase
          .from('analytics_events')
          .select('id', { count: 'exact' })
          .eq('event_type', 'add_to_cart')
          .gte('created_at', startDate.toISOString()),

        // Checkout starts
        supabase
          .from('analytics_events')
          .select('id', { count: 'exact' })
          .eq('event_type', 'checkout_start')
          .gte('created_at', startDate.toISOString()),

        // Completed orders
        supabase
          .from('analytics_events')
          .select('id, cart_total', { count: 'exact' })
          .eq('event_type', 'order_complete')
          .gte('created_at', startDate.toISOString()),

        // Top traffic sources
        supabase
          .from('analytics_events')
          .select('utm_source, visitor_id')
          .gte('created_at', startDate.toISOString())
          .not('utm_source', 'is', null),

        // Top products viewed
        supabase
          .from('analytics_events')
          .select('product_id, product_name')
          .eq('event_type', 'product_view')
          .gte('created_at', startDate.toISOString())
          .not('product_id', 'is', null),
      ]);

      // Count unique visitors
      const uniqueVisitorIds = new Set(uniqueVisitors.data?.map(e => e.visitor_id) || []);

      // Count sources
      const sourceCounts: Record<string, number> = {};
      topSources.data?.forEach(e => {
        const source = e.utm_source || 'direct';
        sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      });

      // Count products
      const productCounts: Record<string, { name: string; count: number }> = {};
      topProducts.data?.forEach(e => {
        if (e.product_id) {
          if (!productCounts[e.product_id]) {
            productCounts[e.product_id] = { name: e.product_name || e.product_id, count: 0 };
          }
          productCounts[e.product_id].count++;
        }
      });

      // Calculate conversion funnel
      const funnel = {
        pageViews: pageViews.count || 0,
        productViews: productViews.count || 0,
        addToCarts: addToCarts.count || 0,
        checkouts: checkouts.count || 0,
        orders: orders.count || 0,
      };

      // Calculate revenue
      const revenue = orders.data?.reduce((sum, e) => sum + (e.cart_total || 0), 0) || 0;

      return NextResponse.json({
        success: true,
        data: {
          period,
          summary: {
            pageViews: pageViews.count || 0,
            uniqueVisitors: uniqueVisitorIds.size,
            productViews: productViews.count || 0,
            addToCarts: addToCarts.count || 0,
            orders: orders.count || 0,
            revenue,
            conversionRate: funnel.pageViews > 0
              ? ((funnel.orders / funnel.pageViews) * 100).toFixed(2) + '%'
              : '0%',
          },
          funnel,
          topSources: Object.entries(sourceCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([source, count]) => ({ source, count })),
          topProducts: Object.entries(productCounts)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5)
            .map(([id, data]) => ({ id, name: data.name, views: data.count })),
        },
      });
    }

    if (type === 'events') {
      // Get recent events
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
