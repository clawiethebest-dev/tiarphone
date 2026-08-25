import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ALGERIA_WILAYAS } from '@/data/wilayas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.trim() || '';

    if (!query) {
      return NextResponse.json({ success: false, error: 'يرجى إدخال رقم الهاتف أو رقم الطلب' }, { status: 400 });
    }

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ success: false, error: 'قاعدة البيانات غير متصلة' }, { status: 500 });
    }

    // Clean phone query if applicable
    const cleanPhone = query.replace(/\D/g, '');
    let dbQuery = supabase.from('orders').select('*');

    if (query.toUpperCase().startsWith('TBQ-') || query.toUpperCase().startsWith('ORD-')) {
      dbQuery = dbQuery.or(`id.ilike.%${query}%,order_number.ilike.%${query}%`);
    } else if (cleanPhone.length >= 8) {
      const p9 = cleanPhone.slice(-9);
      dbQuery = dbQuery.or(`phone.ilike.%${p9}%,phone2.ilike.%${p9}%`);
    } else {
      dbQuery = dbQuery.or(`id.ilike.%${query}%,customer_name.ilike.%${query}%`);
    }

    const { data: orders, error } = await dbQuery
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Track order error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ 
        success: false, 
        notFound: true,
        error: 'لم نتمكن من العثور على أي طلب بهذا الرقم. يرجى التحقق من الرقم والمحاولة مجدداً.' 
      }, { status: 404 });
    }

    // Sanitize and format orders
    const sanitizedOrders = orders.map(order => {
      let wilayaName = order.wilaya || '';
      const wId = order.wilaya_id;
      if (wId) {
        const found = ALGERIA_WILAYAS.find(w => w.id === wId);
        if (found) wilayaName = `${found.code} - ${found.name_ar} (${found.name_fr})`;
      }

      return {
        id: order.id,
        order_number: order.order_number || order.id,
        customer_name: order.customer_name,
        phone_masked: order.phone ? order.phone.slice(0, 4) + '****' + order.phone.slice(-2) : '',
        wilaya: wilayaName || order.wilaya,
        commune: order.commune,
        address: order.address,
        products_text: order.products_text || order.notes || 'طلب منتجات',
        total: order.total,
        status: order.status || 'new',
        tracking: order.tracking,
        created_at: order.created_at,
      };
    });

    return NextResponse.json({ success: true, orders: sanitizedOrders });
  } catch (error: any) {
    console.error('Track order exception:', error);
    return NextResponse.json({ success: false, error: error.message || 'حدث خطأ في البحث' }, { status: 500 });
  }
}
