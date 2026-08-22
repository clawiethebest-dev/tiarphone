import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const {
      product_id,
      product_name,
      product_price,
      quantity,
      customer_name,
      customer_phone,
      wilaya_id,
      wilaya_name,
      commune_id,
      commune_name,
      address,
      delivery_type,
      delivery_fee,
      total,
      notes,
      traffic_source,
      landing_page,
    } = body;

    // Validate required fields
    if (!customer_name || !customer_phone || !wilaya_id || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = `TBQ-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const orderData = {
      order_number: orderNumber,
      product_id,
      product_name,
      product_price,
      quantity: quantity || 1,
      customer_name,
      customer_phone,
      wilaya_id,
      wilaya_name,
      commune_id,
      commune_name,
      address,
      delivery_type: delivery_type || 'home',
      delivery_fee,
      total,
      notes,
      traffic_source,
      landing_page,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    // Save to Supabase if configured
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        // Continue even if Supabase fails
      }
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      message: 'Order placed successfully',
    });
  } catch (error) {
    console.error('Order error:', error);
    return NextResponse.json(
      { error: 'Failed to process order' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase GET error:', error);
      return NextResponse.json({ success: false, data: [], error: error.message });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { success: false, data: [], error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
