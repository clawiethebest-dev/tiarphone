import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ALGERIA_WILAYAS, resolveWilayaFromGeo } from '@/data/wilayas';

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
      
      // Auto-extract customer fields from root data on every event
      if (data.name && !customerName) customerName = String(data.name);
      if (data.fullName && !customerName) customerName = String(data.fullName);
      if (data.customer_name && !customerName) customerName = String(data.customer_name);

      if (data.phone && !customerPhone) customerPhone = String(data.phone);
      if (data.phone1 && !customerPhone) customerPhone = String(data.phone1);
      if (data.contact_phone && !customerPhone) customerPhone = String(data.contact_phone);
      if (data.customer_phone && !customerPhone) customerPhone = String(data.customer_phone);

      if (data.phone2 && !customerPhone2) customerPhone2 = String(data.phone2);
      if (data.customer_phone2 && !customerPhone2) customerPhone2 = String(data.customer_phone2);

      if (data.wilaya && !customerWilaya) customerWilaya = String(data.wilaya);
      if (data.wilaya_name && !customerWilaya) customerWilaya = String(data.wilaya_name);
      if (data.customer_wilaya && !customerWilaya) customerWilaya = String(data.customer_wilaya);

      if (data.commune && !customerCommune) customerCommune = String(data.commune);
      if (data.commune_name && !customerCommune) customerCommune = String(data.commune_name);
      if (data.customer_commune && !customerCommune) customerCommune = String(data.customer_commune);

      if (data.address && !customerAddress) customerAddress = String(data.address);
      if (data.customer_address && !customerAddress) customerAddress = String(data.customer_address);

      if (data.product && !productName) productName = String(data.product);
      if (data.product_name && !productName) productName = String(data.product_name);
      if (data.productName && !productName) productName = String(data.productName);

      if (data.quantity && !productQuantity) productQuantity = Number(data.quantity);
      if (data.total && !orderTotal) orderTotal = Number(data.total);

      // Check nested formData
      if (data.formData && typeof data.formData === 'object') {
        const fd = data.formData as Record<string, unknown>;
        if (fd.name && !customerName) customerName = String(fd.name);
        if (fd.phone && !customerPhone) customerPhone = String(fd.phone);
        if (fd.phone1 && !customerPhone) customerPhone = String(fd.phone1);
        if (fd.phone2 && !customerPhone2) customerPhone2 = String(fd.phone2);
        if (fd.wilaya && !customerWilaya) customerWilaya = String(fd.wilaya);
        if (fd.commune && !customerCommune) customerCommune = String(fd.commune);
        if (fd.address && !customerAddress) customerAddress = String(fd.address);
        if (fd.product && !productName) productName = String(fd.product);
        if (fd.total && !orderTotal) orderTotal = Number(fd.total);
      }

      switch (log.action) {
        case 'page_view':
          if (log.page) {
            const pagePath = log.page.toLowerCase();
            if (pagePath.includes('/products/pack-') || (pagePath.includes('/products/') && pagePath.split('/products/')[1])) {
              const parts = log.page.split('/products/');
              if (parts[1]) {
                const slug = parts[1].split('?')[0].replace(/\/$/, '');
                if (slug && !productsViewed.includes(slug)) {
                  productsViewed.push(slug);
                }
              }
            }
          }
          break;

        case 'click':
          totalClicks++;
          if (log.element_text?.includes('اشتر') || log.element_text?.includes('شراء') ||
              log.element_text?.includes('تأكيد') || log.element_text?.includes('طلب')) {
            checkoutStarted = true;
          }
          break;

        case 'product_view':
          if (data.productSlug && !productsViewed.includes(data.productSlug as string)) {
            productsViewed.push(data.productSlug as string);
          }
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
          break;

        case 'field_input':
          // Extract individual field values
          if (data.field === 'name' && data.value) customerName = String(data.value);
          if (data.field === 'phone' && data.value) customerPhone = String(data.value);
          if (data.field === 'phone1' && data.value) customerPhone = String(data.value);
          if (data.field === 'phone2' && data.value) customerPhone2 = String(data.value);
          if (data.field === 'wilaya' && data.value) customerWilaya = String(data.value);
          if (data.field === 'commune' && data.value) customerCommune = String(data.value);
          if (data.field === 'address' && data.value) customerAddress = String(data.value);
          break;

        case 'phone_entered':
          phoneEntered = true;
          if (data.phone) customerPhone = String(data.phone);
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

// Helper to fetch all logs using range pagination to bypass 1000 row limits
async function fetchPaginatedRawLogs(sinceIso?: string, maxTotal = 50000): Promise<any[]> {
  if (!supabase) return [];
  const allLogs: any[] = [];
  const batchSize = 1000;
  let from = 0;

  while (from < maxTotal) {
    const to = from + batchSize - 1;
    let query = supabase
      .from('raw_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .range(from, to);

    if (sinceIso && sinceIso !== new Date(0).toISOString()) {
      query = query.gte('timestamp', sinceIso);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) break;

    allLogs.push(...data);
    if (data.length < batchSize) break;
    from += batchSize;
  }

  return allLogs;
}

// POST: Run analysis
export async function POST() {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' });
    }

    // Get logs from the last 90 days to analyze full history (fetching all rows in batches)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const logs = await fetchPaginatedRawLogs(ninetyDaysAgo, 50000);

    if (!logs || logs.length === 0) {
      return NextResponse.json({ success: true, message: 'No logs to analyze', sessions: 0, logs_analyzed: 0 });
    }

    // Analyze logs
    const analyzed = analyzeLogs(logs as RawLog[]);

    // Save analyzed sessions in batches
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
  } catch (error: any) {
    console.error('Analyze logs error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Analysis failed' }, { status: 500 });
  }
}

// GET: Get analysis summary and data for admin
export async function GET(request: Request) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ success: true, data: null, sessions: [], raw_logs: [] });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all';

    // Calculate cutoff date
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
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        startDate = new Date(0);
    }
    const isoStart = startDate.toISOString();

    // Fetch raw logs and orders concurrently with range pagination
    const [rawLogs, analyzedSessionsRes, ordersRes, totalRawLogsHeadRes] = await Promise.all([
      fetchPaginatedRawLogs(isoStart, 20000),
      supabase
        .from('analyzed_sessions')
        .select('*', { count: 'exact' })
        .gte('last_seen', isoStart)
        .order('last_seen', { ascending: false })
        .limit(2000),
      supabase
        .from('orders')
        .select('id, total, status, created_at, products_text, traffic_source, wilaya', { count: 'exact' })
        .gte('created_at', isoStart)
        .order('created_at', { ascending: false }),
      supabase
        .from('raw_logs')
        .select('*', { count: 'exact', head: true }),
    ]);

    const totalRawLogsCount = totalRawLogsHeadRes.count || rawLogs.length;
    let sessions = analyzedSessionsRes.data || [];
    const totalSessionsCount = analyzedSessionsRes.count || sessions.length;
    const orders = ordersRes.data || [];

    // Real-time analysis on raw logs
    if (rawLogs.length > 0) {
      const realTimeAnalyzed = analyzeLogs(rawLogs as RawLog[]);
      if (realTimeAnalyzed.length > 0) {
        const sessionMap = new Map<string, any>();
        for (const s of sessions) sessionMap.set(s.session_id, s);
        for (const s of realTimeAnalyzed) sessionMap.set(s.session_id, s);
        sessions = Array.from(sessionMap.values()).sort(
          (a, b) => new Date(b.last_seen || b.first_seen).getTime() - new Date(a.last_seen || a.first_seen).getTime()
        );
      }
    }

    // Calculate metrics
    const totalSessions = Math.max(totalSessionsCount, sessions.length, new Set(rawLogs.map(l => l.session_id).filter(Boolean)).size, 1);
    const uniqueVisitors = new Set([...sessions.map(s => s.ip).filter(Boolean), ...rawLogs.map(l => l.ip).filter(Boolean)]).size || totalSessions;
    
    // Page views
    const totalPageViews = rawLogs.filter(l => l.action === 'page_view' || l.action === 'pageview').length || 
                           sessions.reduce((sum, s) => sum + (s.pages_viewed?.length || 1), 0) || totalSessions;

    // Product views
    const totalProductViews = rawLogs.filter(l => 
      l.action === 'product_view' || 
      (l.action === 'page_view' && l.page && (l.page.includes('/products/pack-') || (l.page.includes('/products/') && l.page.split('/products/')[1])))
    ).length || sessions.reduce((sum, s) => sum + (s.products_viewed?.length || 0), 0);

    // Add to cart / Popup open
    const addToCartsCount = sessions.reduce((sum, s) => sum + (s.added_to_cart?.length || 0), 0) ||
                            rawLogs.filter(l => l.action === 'add_to_cart' || l.action === 'popup_open').length ||
                            sessions.filter(s => s.checkout_started).length;

    // Checkouts
    const checkoutsStarted = sessions.filter(s => s.checkout_started).length || 
                             rawLogs.filter(l => l.action === 'checkout_start' || l.action === 'checkout_button_click' || l.action === 'form_submit').length;

    // Orders completed
    const completedOrdersCount = orders.length || sessions.filter(s => s.order_completed).length;
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    // Lost orders
    const lostOrders = sessions.filter(s => s.lost_order || (s.checkout_started && !s.order_completed));
    const lostOrdersWithPhone = lostOrders.filter(s => s.customer_phone);

    // Top traffic sources
    const sourcesCount: Record<string, number> = {};
    for (const log of rawLogs) {
      const ref = (log.referrer || log.data?.referrer || '').toString().toLowerCase();
      const utm = (log.data?.utm_source || '').toString().toLowerCase();
      let src = 'direct';
      if (utm) src = utm;
      else if (ref.includes('facebook') || ref.includes('fb')) src = 'facebook';
      else if (ref.includes('instagram')) src = 'instagram';
      else if (ref.includes('tiktok')) src = 'tiktok';
      else if (ref.includes('google')) src = 'google';
      else if (ref && !ref.includes('localhost') && !ref.includes('tiarboutique')) src = 'referral';
      sourcesCount[src] = (sourcesCount[src] || 0) + 1;
    }
    for (const order of orders) {
      if (order.traffic_source) {
        const src = order.traffic_source.split('/')[0].trim().toLowerCase();
        sourcesCount[src] = (sourcesCount[src] || 0) + 1;
      }
    }
    const topSources = Object.entries(sourcesCount)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    // Top Wilayas (Geographic Distribution across Algeria)
    const wilayasCount: Record<string, { id: number; name: string; count: number }> = {};
    for (const log of rawLogs) {
      let wId = log.data?.detected_wilaya_id as number;
      let wName = log.data?.detected_wilaya as string;
      if (!wId && (log.data?.city || log.data?.region)) {
        const found = resolveWilayaFromGeo(String(log.data.city || ''), String(log.data.region || ''));
        if (found) {
          wId = found.id;
          wName = `${found.code} - ${found.name_ar} (${found.name_fr})`;
        }
      }
      if (wId && wName) {
        if (!wilayasCount[wId]) {
          wilayasCount[wId] = { id: wId, name: wName, count: 0 };
        }
        wilayasCount[wId].count++;
      }
    }

    for (const s of sessions) {
      if (s.customer_wilaya) {
        const found = ALGERIA_WILAYAS.find(w => 
          s.customer_wilaya?.includes(w.name_ar) || 
          s.customer_wilaya?.toLowerCase().includes(w.name_fr.toLowerCase())
        );
        if (found) {
          const wId = found.id;
          const wName = `${found.code} - ${found.name_ar} (${found.name_fr})`;
          if (!wilayasCount[wId]) {
            wilayasCount[wId] = { id: wId, name: wName, count: 0 };
          }
          wilayasCount[wId].count += 3;
        }
      }
    }

    for (const o of orders) {
      if (o.wilaya) {
        const found = ALGERIA_WILAYAS.find(w => 
          o.wilaya?.includes(w.name_ar) || 
          o.wilaya?.toLowerCase().includes(w.name_fr.toLowerCase())
        );
        if (found) {
          const wId = found.id;
          const wName = `${found.code} - ${found.name_ar} (${found.name_fr})`;
          if (!wilayasCount[wId]) {
            wilayasCount[wId] = { id: wId, name: wName, count: 0 };
          }
          wilayasCount[wId].count += 5;
        }
      }
    }

    const totalWilayaVisits = Object.values(wilayasCount).reduce((sum, w) => sum + w.count, 0) || 1;
    const topWilayas = Object.values(wilayasCount)
      .map(w => ({
        ...w,
        percentage: Math.round((w.count / totalWilayaVisits) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top products
    const productsCount: Record<string, number> = {};
    for (const log of rawLogs) {
      if (log.action === 'product_view' && log.data?.productName) {
        const pName = String(log.data.productName);
        productsCount[pName] = (productsCount[pName] || 0) + 1;
      }
    }
    for (const s of sessions) {
      if (s.product_name) {
        productsCount[s.product_name] = (productsCount[s.product_name] || 0) + 1;
      }
      if (Array.isArray(s.products_viewed)) {
        for (const p of s.products_viewed) {
          productsCount[p] = (productsCount[p] || 0) + 1;
        }
      }
    }
    const topProducts = Object.entries(productsCount)
      .map(([name, views], idx) => ({ id: String(idx + 1), name, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    const summary = {
      period,
      total_sessions: totalSessions,
      total_raw_logs: totalRawLogsCount,
      total_page_views: Math.max(totalPageViews, totalSessions),
      unique_visitors: Math.max(uniqueVisitors, 1),
      total_product_views: totalProductViews,
      add_to_cart: addToCartsCount,
      checkout_started: checkoutsStarted,
      orders_attempted: sessions.filter(s => s.order_attempted).length,
      orders_completed: completedOrdersCount,
      revenue: totalRevenue,
      lost_orders: lostOrders.length,
      lost_orders_with_phone: lostOrdersWithPhone.length,
      top_sources: topSources,
      top_products: topProducts,
      top_wilayas: topWilayas,
      by_device: {
        mobile: sessions.filter(s => s.device_type === 'mobile').length || 1,
        tablet: sessions.filter(s => s.device_type === 'tablet').length || 0,
        desktop: sessions.filter(s => s.device_type === 'desktop').length || 0,
      },
      recent_lost_orders: lostOrders.slice(0, 15).map(s => ({
        session_id: s.session_id,
        time: s.last_seen || s.first_seen,
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
      sessions: sessions.map(s => ({
        ...s,
        customer_name: s.customer_name,
        customer_phone: s.customer_phone,
        customer_phone2: s.customer_phone2,
        customer_wilaya: s.customer_wilaya,
        customer_commune: s.customer_commune,
        customer_address: s.customer_address,
        product_name: s.product_name,
        product_quantity: s.product_quantity,
        order_total: s.order_total,
      })),
      raw_logs: rawLogs.map(log => ({
        id: log.id,
        session_id: log.session_id,
        timestamp: log.timestamp,
        event_type: log.action,
        event_data: log.data,
        page_url: log.page,
        user_agent: log.user_agent,
      })),
    });
  } catch (error: any) {
    console.error('Get analysis error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to get analysis', sessions: [], raw_logs: [] }, { status: 500 });
  }
}
