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
      // Support both old and new field names
      customer_name,
      name,
      customer_phone,
      phone1,
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

    // Handle field name variations from frontend
    const finalCustomerName = customer_name || name;
    const finalCustomerPhone = customer_phone || phone1;

    // Validate required fields
    if (!finalCustomerName || !finalCustomerPhone || !wilaya_id || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = `TBQ-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Build order data with only columns that exist in the database
    // Based on actual orders table: id, created_at, customer_name, phone, wilaya, commune, address, delivery_type, total, status, notes
    const orderData = {
      id: orderNumber,
      order_number: orderNumber,
      customer_name: finalCustomerName,
      phone: finalCustomerPhone,
      wilaya: wilaya_name || `wilaya_${wilaya_id}`,
      commune: commune_name || '',
      address,
      delivery_type: delivery_type || 'home',
      total,
      status: 'pending',
      notes: notes || `${product_name} x${quantity || 1}`,
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

// Update order status
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status, tracking } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing orderId or status' },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ success: false, error: 'Database not configured' });
    }

    const updateData: Record<string, string> = { status };
    if (tracking) {
      updateData.tracking = tracking;
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Supabase PATCH error:', error);
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// Delete order
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Missing orderId' },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ success: false, error: 'Database not configured' });
    }

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error('Supabase DELETE error:', error);
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({ success: true, message: 'Order deleted' });
  } catch (error) {
    console.error('Delete order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
