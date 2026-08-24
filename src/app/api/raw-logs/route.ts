import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { logs } = await request.json();

    if (!logs || !Array.isArray(logs) || logs.length === 0) {
      return NextResponse.json({ success: true, saved: 0 });
    }

    // Add server timestamp and IP
    const enrichedLogs = logs.map((log: Record<string, unknown>) => ({
      ...log,
      server_timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          'unknown',
    }));

    // Save to Supabase
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from('raw_logs')
        .insert(enrichedLogs.map((log: Record<string, unknown>) => ({
          session_id: log.sessionId,
          timestamp: log.timestamp,
          server_timestamp: log.server_timestamp,
          page: log.page,
          referrer: log.referrer,
          user_agent: log.userAgent,
          screen_size: log.screenSize,
          action: log.action,
          element: log.element,
          element_text: log.elementText,
          element_id: log.elementId,
          element_class: log.elementClass,
          data: log.data,
          error_message: log.error,
          error_stack: log.stack,
          ip: log.ip,
        })));

      if (error) {
        console.error('Raw logs insert error:', error);
        // Don't fail the request, just log
      }
    }

    return NextResponse.json({ success: true, saved: logs.length });
  } catch (error) {
    console.error('Raw logs error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save logs' }, { status: 500 });
  }
}

// Get raw logs for analysis
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const since = url.searchParams.get('since'); // ISO timestamp
    const limit = parseInt(url.searchParams.get('limit') || '1000');
    const analyzed = url.searchParams.get('analyzed'); // 'true' or 'false'

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ success: true, logs: [] });
    }

    let query = supabase
      .from('raw_logs')
      .select('*')
      .order('timestamp', { ascending: true })
      .limit(limit);

    if (since) {
      query = query.gte('timestamp', since);
    }

    if (analyzed === 'false') {
      query = query.is('analyzed_at', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Get raw logs error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, logs: data || [] });
  } catch (error) {
    console.error('Get raw logs error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch logs' }, { status: 500 });
  }
}
