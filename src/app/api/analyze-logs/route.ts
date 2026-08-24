import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface RawLog {
  id: string;
  session_id: string;
  timestamp: string;
  page: string;
  action: string;
  element?: string;
  element_text?: string;
  data?: Record<string, unknown>;
  error_message?: string;
  ip?: string;
  user_agent?: string;
}

interface AnalyzedSession {
  session_id: string;
  first_seen: string;
  last_seen: string;
  pages_viewed: string[];
  products_viewed: string[];
  added_to_cart: string[];
  checkout_started: boolean;
  phone_entered: boolean;
  order_attempted: boolean;
  order_completed: boolean;
  order_error?: string;
  total_clicks: number;
  max_scroll_depth: number;
  errors: string[];
  device_type: 'mobile' | 'tablet' | 'desktop';
  ip?: string;
  journey_summary: string;
  lost_order: boolean;
}

// Analyze raw logs and extract meaningful events
function analyzeLogs(logs: RawLog[]): AnalyzedSession[] {
  // Group by session
  const sessions = new Map<string, RawLog[]>();
  
  for (const log of logs) {
    const existing = sessions.get(log.session_id) || [];
    existing.push(log);
    sessions.set(log.session_id, existing);
  }

  const analyzed: AnalyzedSession[] = [];

  for (const [sessionId, sessionLogs] of sessions) {
    // Sort by timestamp
    sessionLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const firstLog = sessionLogs[0];
    const lastLog = sessionLogs[sessionLogs.length - 1];

    // Extract data
    const pagesViewed = [...new Set(sessionLogs.map(l => l.page).filter(Boolean))];
    const productsViewed: string[] = [];
    const addedToCart: string[] = [];
    const errors: string[] = [];
    let checkoutStarted = false;
    let phoneEntered = false;
    let orderAttempted = false;
    let orderCompleted = false;
    let orderError: string | undefined;
    let totalClicks = 0;
    let maxScrollDepth = 0;

    for (const log of sessionLogs) {
      switch (log.action) {
        case 'click':
          totalClicks++;
          // Check if click on "اشتر الآن" or similar
          if (log.element_text?.includes('اشتر') || log.element_text?.includes('شراء')) {
            checkoutStarted = true;
          }
          break;

        case 'product_view':
          if (log.data?.productSlug) {
            productsViewed.push(log.data.productSlug as string);
          }
          break;

        case 'add_to_cart':
          if (log.data?.productSlug) {
            addedToCart.push(log.data.productSlug as string);
          }
          break;

        case 'checkout_start':
          checkoutStarted = true;
          break;

        case 'phone_entered':
        case 'input':
          if (log.action === 'phone_entered' || log.data?.isPhone) {
            phoneEntered = true;
          }
          break;

        case 'order_attempt':
        case 'form_submit':
          orderAttempted = true;
          break;

        case 'order_success':
          orderCompleted = true;
          break;

        case 'order_error':
          orderError = log.error_message || log.data?.error as string;
          break;

        case 'error':
        case 'promise_error':
          if (log.error_message) {
            errors.push(log.error_message);
          }
          break;

        case 'scroll':
          const depth = log.data?.depth as number;
          if (depth > maxScrollDepth) maxScrollDepth = depth;
          break;
      }
    }

    // Detect device type
    const ua = firstLog.user_agent?.toLowerCase() || '';
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (ua.includes('mobile') || ua.includes('android') && !ua.includes('tablet')) {
      deviceType = 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      deviceType = 'tablet';
    }

    // Detect lost order: started checkout/entered phone but no completion
    const lostOrder = (checkoutStarted || phoneEntered || orderAttempted) && !orderCompleted;

    // Generate journey summary
    const journeyParts: string[] = [];
    if (pagesViewed.length > 0) journeyParts.push(`زار ${pagesViewed.length} صفحات`);
    if (productsViewed.length > 0) journeyParts.push(`شاهد ${productsViewed.length} منتجات`);
    if (addedToCart.length > 0) journeyParts.push(`أضاف للسلة`);
    if (checkoutStarted) journeyParts.push(`بدأ الشراء`);
    if (phoneEntered) journeyParts.push(`أدخل رقم الهاتف`);
    if (orderAttempted) journeyParts.push(`حاول الطلب`);
    if (orderCompleted) {
      journeyParts.push(`✅ أكمل الطلب`);
    } else if (orderError) {
      journeyParts.push(`❌ فشل الطلب: ${orderError}`);
    } else if (lostOrder) {
      journeyParts.push(`⚠️ غادر بدون إكمال الطلب`);
    }
    if (errors.length > 0) journeyParts.push(`${errors.length} أخطاء`);

    analyzed.push({
      session_id: sessionId,
      first_seen: firstLog.timestamp,
      last_seen: lastLog.timestamp,
      pages_viewed: pagesViewed,
      products_viewed: [...new Set(productsViewed)],
      added_to_cart: [...new Set(addedToCart)],
      checkout_started: checkoutStarted,
      phone_entered: phoneEntered,
      order_attempted: orderAttempted,
      order_completed: orderCompleted,
      order_error: orderError,
      total_clicks: totalClicks,
      max_scroll_depth: maxScrollDepth,
      errors: [...new Set(errors)],
      device_type: deviceType,
      ip: firstLog.ip,
      journey_summary: journeyParts.join(' → ') || 'زيارة سريعة',
      lost_order: lostOrder,
    });
  }

  return analyzed;
}

// POST: Run analysis
export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' });
    }

    // Get unanalyzed logs from the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: logs, error: fetchError } = await supabase
      .from('raw_logs')
      .select('*')
      .is('analyzed_at', null)
      .gte('timestamp', oneHourAgo)
      .order('timestamp', { ascending: true })
      .limit(5000);

    if (fetchError) {
      console.error('Fetch logs error:', fetchError);
      return NextResponse.json({ success: false, error: fetchError.message });
    }

    if (!logs || logs.length === 0) {
      return NextResponse.json({ success: true, message: 'No logs to analyze', sessions: 0 });
    }

    // Analyze logs
    const analyzed = analyzeLogs(logs);

    // Save analyzed sessions
    for (const session of analyzed) {
      const { error: upsertError } = await supabase
        .from('analyzed_sessions')
        .upsert({
          session_id: session.session_id,
          first_seen: session.first_seen,
          last_seen: session.last_seen,
          pages_viewed: session.pages_viewed,
          products_viewed: session.products_viewed,
          added_to_cart: session.added_to_cart,
          checkout_started: session.checkout_started,
          phone_entered: session.phone_entered,
          order_attempted: session.order_attempted,
          order_completed: session.order_completed,
          order_error: session.order_error,
          total_clicks: session.total_clicks,
          max_scroll_depth: session.max_scroll_depth,
          errors: session.errors,
          device_type: session.device_type,
          ip: session.ip,
          journey_summary: session.journey_summary,
          lost_order: session.lost_order,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'session_id',
        });

      if (upsertError) {
        console.error('Upsert session error:', upsertError);
      }
    }

    // Mark logs as analyzed
    const logIds = logs.map(l => l.id);
    const { error: updateError } = await supabase
      .from('raw_logs')
      .update({ analyzed_at: new Date().toISOString() })
      .in('id', logIds);

    if (updateError) {
      console.error('Update logs error:', updateError);
    }

    // Count lost orders
    const lostOrders = analyzed.filter(s => s.lost_order);

    return NextResponse.json({
      success: true,
      logs_analyzed: logs.length,
      sessions_created: analyzed.length,
      lost_orders: lostOrders.length,
      lost_order_sessions: lostOrders.map(s => ({
        session_id: s.session_id,
        journey: s.journey_summary,
        products: s.products_viewed,
      })),
    });
  } catch (error) {
    console.error('Analyze logs error:', error);
    return NextResponse.json({ success: false, error: 'Analysis failed' }, { status: 500 });
  }
}

// GET: Get analysis summary
export async function GET() {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ success: true, data: null });
    }

    // Get summary stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: sessions, error } = await supabase
      .from('analyzed_sessions')
      .select('*')
      .gte('first_seen', today.toISOString())
      .order('last_seen', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }

    const summary = {
      total_sessions: sessions?.length || 0,
      unique_visitors: new Set(sessions?.map(s => s.ip)).size,
      total_product_views: sessions?.reduce((sum, s) => sum + (s.products_viewed?.length || 0), 0) || 0,
      checkout_started: sessions?.filter(s => s.checkout_started).length || 0,
      orders_attempted: sessions?.filter(s => s.order_attempted).length || 0,
      orders_completed: sessions?.filter(s => s.order_completed).length || 0,
      lost_orders: sessions?.filter(s => s.lost_order).length || 0,
      by_device: {
        mobile: sessions?.filter(s => s.device_type === 'mobile').length || 0,
        tablet: sessions?.filter(s => s.device_type === 'tablet').length || 0,
        desktop: sessions?.filter(s => s.device_type === 'desktop').length || 0,
      },
      recent_lost_orders: sessions?.filter(s => s.lost_order).slice(0, 10).map(s => ({
        session_id: s.session_id,
        time: s.last_seen,
        journey: s.journey_summary,
        products: s.products_viewed,
        error: s.order_error,
      })),
    };

    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    console.error('Get analysis error:', error);
    return NextResponse.json({ success: false, error: 'Failed to get analysis' }, { status: 500 });
  }
}
