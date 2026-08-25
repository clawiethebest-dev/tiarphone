import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import FALLBACK_COMMUNES from '@/data/communes.json';
import { ALGERIA_WILAYAS } from '@/data/wilayas';

const allCommunes = (FALLBACK_COMMUNES as any).communes || [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Extract customer details supporting multiple naming conventions
    const customerName = (body.customer_name || body.name || body.fullName || '').trim();
    const phone = (body.customer_phone || body.phone1 || body.phone || '').trim();
    
    let wilayaId = parseInt(body.wilaya_id || body.wilayaId || '0') || 0;
    let wilayaName = (body.wilaya_name || body.wilayaName || body.wilaya || '').trim();
    
    let communeId = parseInt(body.commune_id || body.communeId || '0') || 0;
    let communeName = (body.commune_name || body.communeName || body.commune || '').trim();
    
    const address = (body.address || '').trim();
    const deliveryType = body.delivery_type || body.deliveryType || 'home';
    const deliveryFee = parseInt(body.delivery_fee || body.deliveryFee || '0') || 0;
    const subtotal = parseInt(body.subtotal || body.product_price || '0') || 0;
    const total = parseInt(body.total || '0') || (subtotal + deliveryFee);
    const notes = (body.notes || '').trim();
    
    // If names are missing but IDs exist, lookup from static dataset
    if (communeId && (!communeName || !wilayaName)) {
      const foundCommune = allCommunes.find((c: any) => c.id === communeId);
      if (foundCommune) {
        if (!communeName) communeName = foundCommune.name;
        if (!wilayaName) wilayaName = foundCommune.wilaya_name;
        if (!wilayaId) wilayaId = foundCommune.wilaya_id;
      }
    }
    
    // Always resolve full standardized Arabic + Latin name for Wilaya if wilayaId is present
    if (wilayaId) {
      const wilayaInfo = ALGERIA_WILAYAS.find(w => w.id === wilayaId);
      if (wilayaInfo) {
        wilayaName = `${wilayaInfo.code} - ${wilayaInfo.name_ar} (${wilayaInfo.name_fr})`;
      }
    } else if (wilayaName) {
      const wilayaInfo = ALGERIA_WILAYAS.find(w => 
        w.name_ar === wilayaName || 
        w.name_fr.toLowerCase() === wilayaName.toLowerCase() ||
        wilayaName.includes(w.name_ar) ||
        wilayaName.toLowerCase().includes(w.name_fr.toLowerCase())
      );
      if (wilayaInfo) {
        wilayaId = wilayaInfo.id;
        wilayaName = `${wilayaInfo.code} - ${wilayaInfo.name_ar} (${wilayaInfo.name_fr})`;
      }
    }
    
    // Validate required fields
    if (!customerName || !phone || (!wilayaId && !wilayaName) || !address) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, phone, wilaya, or address' },
        { status: 400 }
      );
    }
    
    // Generate order number
    const orderNumber = `TBQ-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    // Build products text and items
    let productsText = '';
    let productsList: any[] = [];
    
    if (Array.isArray(body.items) && body.items.length > 0) {
      productsList = body.items;
      productsText = body.items.map((item: any) => {
        const name = item.product?.name || item.name || 'منتج';
        const qty = item.quantity || 1;
        return `${name} x${qty}`;
      }).join(' + ');
    } else if (body.product_name) {
      const qty = body.quantity || 1;
      productsText = `${body.product_name} x${qty}`;
      productsList = [{
        product_id: body.product_id,
        name: body.product_name,
        price: body.product_price,
        quantity: qty
      }];
    }
    
    if (!productsText) {
      productsText = notes || 'طلب منتجات';
    }
    
    const orderData = {
      id: orderNumber,
      customer_name: customerName,
      phone: phone,
      wilaya: wilayaName,
      wilaya_id: wilayaId,
      commune: communeName,
      commune_id: communeId,
      address: address,
      notes: notes || null,
      products: productsList.length > 0 ? productsList : null,
      products_text: productsText,
      subtotal: subtotal,
      delivery_fee: deliveryFee,
      delivery_type: deliveryType,
      total: total,
      status: 'new', // Status 'new' enables the EasyAndSpeed confirm button in the dashboard
      tracking: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Save to Supabase if configured
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .maybeSingle();
        
      if (error) {
        console.error('Supabase insert error:', error);
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        id: orderNumber,
        order_number: orderNumber,
      },
      orderNumber,
      message: 'Order placed successfully',
    });
  } catch (error: any) {
    console.error('Order processing error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process order' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { searchParams } = new URL(request.url);
    const trackQuery = (searchParams.get('track') || searchParams.get('query') || '').trim();

    let dbQuery = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    // If this is a customer tracking lookup
    if (trackQuery) {
      const cleanPhone = trackQuery.replace(/\D/g, '');
      if (trackQuery.toUpperCase().startsWith('TBQ-') || trackQuery.toUpperCase().startsWith('ORD-')) {
        dbQuery = dbQuery.or(`id.ilike.%${trackQuery}%,order_number.ilike.%${trackQuery}%`);
      } else if (cleanPhone.length >= 8) {
        const p9 = cleanPhone.slice(-9);
        dbQuery = dbQuery.or(`phone.ilike.%${p9}%,phone2.ilike.%${p9}%`);
      } else {
        dbQuery = dbQuery.or(`id.ilike.%${trackQuery}%,customer_name.ilike.%${trackQuery}%`);
      }
      dbQuery = dbQuery.limit(5);
    }

    const { data, error } = await dbQuery;

    if (error) {
      console.error('Supabase GET error:', error);
      return NextResponse.json({ success: false, data: [], error: error.message });
    }

    const enrichedOrders = (data || []).map((order: any) => {
      let wilayaName = order.wilaya || '';
      let wilayaId = order.wilaya_id || 0;
      
      // Extract numeric ID from "wilaya_31" or "31" or string name if wilayaId is missing
      if (!wilayaId && wilayaName) {
        const match = wilayaName.match(/\d+/);
        if (match) {
          wilayaId = parseInt(match[0]);
        } else {
          const found = ALGERIA_WILAYAS.find(w => 
            w.name_ar === wilayaName || 
            w.name_fr.toLowerCase() === wilayaName.toLowerCase() ||
            wilayaName.includes(w.name_ar) ||
            wilayaName.toLowerCase().includes(w.name_fr.toLowerCase())
          );
          if (found) wilayaId = found.id;
        }
      }
      
      if (wilayaId) {
        const wilayaInfo = ALGERIA_WILAYAS.find(w => w.id === wilayaId);
        if (wilayaInfo) {
          wilayaName = `${wilayaInfo.code} - ${wilayaInfo.name_ar} (${wilayaInfo.name_fr})`;
        }
      }
      
      const productsText = order.products_text || order.notes || 'طلب منتجات';
      
      return {
        ...order,
        order_number: order.order_number || order.id,
        wilaya: wilayaName || 'الجزائر',
        wilaya_id: wilayaId || 16,
        products_text: productsText,
      };
    });

    if (trackQuery) {
      return NextResponse.json({ success: true, orders: enrichedOrders });
    }

    return NextResponse.json({ success: true, data: enrichedOrders });
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
      .maybeSingle();

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
