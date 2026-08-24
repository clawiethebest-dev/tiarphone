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
  // Customer data for recovery
  customer_name?: string;
  customer_phone?: string;
  customer_phone2?: string;
  customer_wilaya?: string;
  customer_commune?: string;
  customer_address?: string;
  product_name?: string;
  product_quantity?: number;
  order_total?: number;
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
    
    // Customer data extraction
    let customerName: string | undefined;
    let customerPhone: string | undefined;
    let customerPhone2: string | undefined;
    let customerWilaya: string | undefined;
    let customerCommune: string | undefined;
    let customerAddress: string | undefined;
    let productName: string | undefined;
    let productQuantity: number | undefined;
    let orderTotal: number | undefined;

    for (const log of sessionLogs) {
      const data = log.data || {};
      
      switch (log.action) {
        case 'click':
          totalClicks++;
          if (log.element_text?.includes('اشتر') || log.element_text?.includes('شراء') ||
              log.element_text?.includes('تأكيد') || log.element_text?.includes('طلب')) {
            checkoutStarted = true;
          }
          break;

        case 'product_view':
          if (data.productSlug) productsViewed.push(data.productSlug as string);
          if (data.productName) productName = data.productName as string;
          break;

        case 'add_to_cart':
          if (data.productSlug) addedToCart.push(data.productSlug as string);
          if (data.productName) productName = data.productName as string;
          if (data.quantity) productQuantity = data.quantity as number;
          break;

        case 'checkout_start':
        case 'popup_open':
          checkoutStarted = true;
          if (data.productName) productName = data.productName as string;
          if (data.total) orderTotal = data.total as number;
          break;

        case 'checkout_button_click':
          checkoutStarted = true;
          // Extract form data from checkout click
          const formDataClick = data.formData as Record<string, unknown> || {};
          if (formDataClick.name) customerName = formDataClick.name as string;
          if (formDataClick.phone) customerPhone = formDataClick.phone as string;
          if (formDataClick.phone2) customerPhone2 = formDataClick.phone2 as string;
          if (formDataClick.wilaya) customerWilaya = formDataClick.wilaya as string;
          if (formDataClick.commune) customerCommune = formDataClick.commune as string;
          if (formDataClick.address) customerAddress = formDataClick.address as string;
          if (formDataClick.product) productName = formDataClick.product as string;
          if (formDataClick.total) orderTotal = formDataClick.total as number;
          break;

        case 'field_input':
          // Extract individual field values
          if (data.field === 'name' && data.value) customerName = data.value as string;
          if (data.field === 'wilaya' && data.value) customerWilaya = data.value as string;
          if (data.field === 'commune' && data.value) customerCommune = data.value as string;
          if (data.field === 'address' && data.value) customerAddress = data.value as string;
          if (data.field === 'phone2' && data.value) customerPhone2 = data.value as string;
          break;

        case 'phone_entered':
          phoneEntered = true;
          if (data.phone) customerPhone = data.phone as string;
          break;

        case 'form_snapshot':
        case 'popup_close':
        case 'page_exit':
          // Extract all form data from snapshots
          const snapshotData = data as Record<string, unknown>;
          if (snapshotData.name) customerName = snapshotData.name as string;
          if (snapshotData.phone) customerPhone = snapshotData.phone as string;
          if (snapshotData.phone2) customerPhone2 = snapshotData.phone2 as string;
          if (snapshotData.wilaya) customerWilaya = snapshotData.wilaya as string;
          if (snapshotData.commune) customerCommune = snapshotData.commune as string;
          if (snapshotData.address) customerAddress = snapshotData.address as string;
          if (snapshotData.product) productName = snapshotData.product as string;
          if (snapshotData.quantity) productQuantity = snapshotData.quantity as number;
          if (snapshotData.total) orderTotal = snapshotData.total as number;
          
          // Also check formData nested object
          const formDataSnap = snapshotData.formData as Record<string, unknown> || {};
          if (formDataSnap.name) customerName = formDataSnap.name as string;
          if (formDataSnap.phone) customerPhone = formDataSnap.phone as string;
          if (formDataSnap.phone2) customerPhone2 = formDataSnap.phone2 as string;
          if (formDataSnap.wilaya) customerWilaya = formDataSnap.wilaya as string;
          if (formDataSnap.commune) customerCommune = formDataSnap.commune as string;
          if (formDataSnap.address) customerAddress = formDataSnap.address as string;
          if (formDataSnap.product) productName = formDataSnap.product as string;
          if (formDataSnap.total) orderTotal = formDataSnap.total as number;
          break;

        case 'order_attempt':
          orderAttempted = true;
          // Extract all order data
          if (data.name) customerName = data.name as string;
          if (data.phone) customerPhone = data.phone as string;
          if (data.phone2) customerPhone2 = data.phone2 as string;
          if (data.wilaya) customerWilaya = data.wilaya as string;
          if (data.commune) customerCommune = data.commune as string;
          if (data.address) customerAddress = data.address as string;
          if (data.product) productName = data.product as string;
          if (data.quantity) productQuantity = data.quantity as number;
          if (data.total) orderTotal = data.total as number;
          
          const formDataAttempt = data.formData as Record<string, unknown> || {};
          if (formDataAttempt.name) customerName = formDataAttempt.name as string;
          if (formDataAttempt.phone) customerPhone = formDataAttempt.phone as string;
          break;

        case 'order_success':
          orderCompleted = true;
          break;

        case 'order_error':
          orderError = log.error_message || data.error as string;
          break;

        case 'error':
        case 'promise_error':
          if (log.error_message) errors.push(log.error_message);
          break;

        case 'scroll':
          const depth = data.depth as number;
          if (depth > maxScrollDepth) maxScrollDepth = depth;
          break;
      }
    }

    // Detect device type
    const ua = firstLog.user_agent?.toLowerCase() || '';
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (ua.includes('mobile') || (ua.includes('android') && !ua.includes('tablet'))) {
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
      // Customer data
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_phone2: customerPhone2,
      customer_wilaya: customerWilaya,
      customer_commune: customerCommune,
      customer_address: customerAddress,
      product_name: productName,
      product_quantity: productQuantity,
      order_total: orderTotal,
    });
  }

  return analyzed;
}

// POST: Run analysis
export async function POST() {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' });
    }

    // Get unanalyzed logs from the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: logs, error: fetchError } = await supabase
      .from('raw_logs')
      .select('*')
      .gte('timestamp', oneDayAgo)
      .order('timestamp', { ascending: true })
      .limit(10000);

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
          // Customer data
          customer_name: session.customer_name,
          customer_phone: session.customer_phone,
          customer_phone2: session.customer_phone2,
          customer_wilaya: session.customer_wilaya,
          customer_commune: session.customer_commune,
          customer_address: session.customer_address,
          product_name: session.product_name,
          product_quantity: session.product_quantity,
          order_total: session.order_total,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'session_id',
        });

      if (upsertError) {
        console.error('Upsert session error:', upsertError);
      }
    }

    // Count lost orders with phone numbers
    const lostOrders = analyzed.filter(s => s.lost_order);
    const lostOrdersWithPhone = lostOrders.filter(s => s.customer_phone);

    return NextResponse.json({
      success: true,
      logs_analyzed: logs.length,
      sessions_created: analyzed.length,
      lost_orders: lostOrders.length,
      lost_orders_with_phone: lostOrdersWithPhone.length,
      lost_order_sessions: lostOrders.map(s => ({
        session_id: s.session_id,
        journey: s.journey_summary,
        products: s.products_viewed,
        customer_name: s.customer_name,
        customer_phone: s.customer_phone,
        customer_phone2: s.customer_phone2,
        customer_wilaya: s.customer_wilaya,
        customer_commune: s.customer_commune,
        customer_address: s.customer_address,
        product_name: s.product_name,
        order_total: s.order_total,
      })),
    });
  } catch (error) {
    console.error('Analyze logs error:', error);
    return NextResponse.json({ success: false, error: 'Analysis failed' }, { status: 500 });
  }
}

// GET: Get analysis summary and data for admin
export async function GET() {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ success: true, data: null, sessions: [], raw_logs: [] });
    }

    // Get all sessions
    const { data: sessions, error } = await supabase
      .from('analyzed_sessions')
      .select('*')
      .order('last_seen', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Get sessions error:', error);
    }

    // Get recent raw logs
    const { data: rawLogs, error: rawError } = await supabase
      .from('raw_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(500);

    if (rawError) {
      console.error('Get raw logs error:', rawError);
    }

    // Today's sessions for stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySessions = sessions?.filter(s => 
      new Date(s.first_seen) >= today
    ) || [];

    const summary = {
      total_sessions: todaySessions.length,
      unique_visitors: new Set(todaySessions.map(s => s.ip).filter(Boolean)).size,
      total_product_views: todaySessions.reduce((sum, s) => sum + (s.products_viewed?.length || 0), 0),
      checkout_started: todaySessions.filter(s => s.checkout_started).length,
      orders_attempted: todaySessions.filter(s => s.order_attempted).length,
      orders_completed: todaySessions.filter(s => s.order_completed).length,
      lost_orders: todaySessions.filter(s => s.lost_order).length,
      lost_orders_with_phone: todaySessions.filter(s => s.lost_order && s.customer_phone).length,
      by_device: {
        mobile: todaySessions.filter(s => s.device_type === 'mobile').length,
        tablet: todaySessions.filter(s => s.device_type === 'tablet').length,
        desktop: todaySessions.filter(s => s.device_type === 'desktop').length,
      },
      recent_lost_orders: todaySessions.filter(s => s.lost_order).slice(0, 10).map(s => ({
        session_id: s.session_id,
        time: s.last_seen,
        journey: s.journey_summary,
        products: s.products_viewed,
        customer_name: s.customer_name,
        customer_phone: s.customer_phone,
        customer_phone2: s.customer_phone2,
        customer_wilaya: s.customer_wilaya,
        customer_commune: s.customer_commune,
        customer_address: s.customer_address,
        product_name: s.product_name,
        order_total: s.order_total,
        error: s.order_error,
      })),
    };

    return NextResponse.json({ 
      success: true, 
      data: summary,
      sessions: sessions?.map(s => ({
        ...s,
        // Include customer data in response
        customer_name: s.customer_name,
        customer_phone: s.customer_phone,
        customer_phone2: s.customer_phone2,
        customer_wilaya: s.customer_wilaya,
        customer_commune: s.customer_commune,
        customer_address: s.customer_address,
        product_name: s.product_name,
        product_quantity: s.product_quantity,
        order_total: s.order_total,
      })) || [],
      raw_logs: rawLogs?.map(log => ({
        id: log.id,
        session_id: log.session_id,
        timestamp: log.timestamp,
        event_type: log.action,
        event_data: log.data,
        page_url: log.page,
        user_agent: log.user_agent,
      })) || [],
    });
  } catch (error) {
    console.error('Get analysis error:', error);
    return NextResponse.json({ success: false, error: 'Failed to get analysis', sessions: [], raw_logs: [] }, { status: 500 });
  }
}
