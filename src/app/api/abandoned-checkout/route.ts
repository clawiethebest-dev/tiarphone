import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Save phone when customer enters it (even if they don't complete order)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const {
      phone,
      name,
      product_id,
      product_name,
      product_price,
      wilaya_name,
      lang,
    } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Phone required' }, { status: 400 });
    }

    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 9) {
      return NextResponse.json({ error: 'Invalid phone' }, { status: 400 });
    }

    const checkoutData = {
      phone: cleanPhone,
      name: name || null,
      product_id: product_id || null,
      product_name: product_name || null,
      product_price: product_price || null,
      wilaya_name: wilaya_name || null,
      lang: lang || 'ar',
      created_at: new Date().toISOString(),
      completed: false,
      reminder_sent: false,
    };

    if (isSupabaseConfigured() && supabase) {
      // Check if this phone already has an uncompleted checkout
      const { data: existing } = await supabase
        .from('abandoned_checkouts')
        .select('id')
        .eq('phone', cleanPhone)
        .eq('completed', false)
        .maybeSingle();

      if (existing) {
        // Update existing record
        await supabase
          .from('abandoned_checkouts')
          .update({
            ...checkoutData,
            created_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        // Insert new record
        await supabase
          .from('abandoned_checkouts')
          .insert([checkoutData]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Abandoned checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to save checkout' },
      { status: 500 }
    );
  }
}

// Mark checkout as completed (called after successful order)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Phone required' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, '');

    if (isSupabaseConfigured() && supabase) {
      await supabase
        .from('abandoned_checkouts')
        .update({ completed: true })
        .eq('phone', cleanPhone)
        .eq('completed', false);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark completed error:', error);
    return NextResponse.json(
      { error: 'Failed to update' },
      { status: 500 }
    );
  }
}

// Get abandoned checkouts that need reminders (for cron job)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('key');
    
    // Simple API key check
    if (apiKey !== process.env.CRON_API_KEY && apiKey !== 'tiar2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ abandoned: [] });
    }

    // Get checkouts older than 10 minutes that haven't been reminded
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('abandoned_checkouts')
      .select('*')
      .eq('completed', false)
      .eq('reminder_sent', false)
      .lt('created_at', tenMinutesAgo)
      .order('created_at', { ascending: true })
      .limit(10);

    if (error) throw error;

    return NextResponse.json({ abandoned: data || [] });
  } catch (error) {
    console.error('Get abandoned error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch' },
      { status: 500 }
    );
  }
}
