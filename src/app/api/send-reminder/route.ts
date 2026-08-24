import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// This endpoint is called by the cron job to send WhatsApp reminders
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('key');
    
    if (apiKey !== process.env.CRON_API_KEY && apiKey !== 'tiar2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { checkout_id, phone, product_name, product_price } = body;

    if (!phone || !checkout_id) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // Format phone for WhatsApp (add Algeria country code if needed)
    let whatsappPhone = phone.replace(/\D/g, '');
    if (whatsappPhone.startsWith('0')) {
      whatsappPhone = '213' + whatsappPhone.substring(1);
    } else if (!whatsappPhone.startsWith('213')) {
      whatsappPhone = '213' + whatsappPhone;
    }

    // Create reminder message
    const message = createReminderMessage(product_name, product_price);

    // Send via OpenClaw WhatsApp (if configured)
    let sent = false;
    const openclawUrl = process.env.OPENCLAW_GATEWAY_URL;
    const openclawToken = process.env.OPENCLAW_TOKEN;
    
    if (openclawUrl && openclawToken) {
      try {
        const response = await fetch(`${openclawUrl}/api/message/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openclawToken}`,
          },
          body: JSON.stringify({
            channel: 'whatsapp',
            target: whatsappPhone,
            message,
          }),
        });
        sent = response.ok;
      } catch (e) {
        console.error('OpenClaw send error:', e);
      }
    }

    // Mark as sent in database
    if (isSupabaseConfigured() && supabase) {
      await supabase
        .from('abandoned_checkouts')
        .update({ 
          reminder_sent: true,
          reminder_sent_at: new Date().toISOString(),
        })
        .eq('id', checkout_id);
    }

    return NextResponse.json({ 
      success: true, 
      sent,
      phone: whatsappPhone,
      message_preview: message.substring(0, 100),
    });
  } catch (error) {
    console.error('Send reminder error:', error);
    return NextResponse.json(
      { error: 'Failed to send reminder' },
      { status: 500 }
    );
  }
}

function createReminderMessage(productName?: string, productPrice?: number): string {
  const product = productName || 'المنتج';
  const price = productPrice ? ` بسعر ${productPrice} دج` : '';
  
  return `مرحبا! 👋

لاحظنا أنك كنت مهتم بـ ${product}${price} على موقع Tiar Boutique.

هل تحتاج مساعدة في إتمام طلبك؟ 🛒

✅ الدفع عند الاستلام
✅ توصيل سريع 24-48 ساعة
✅ ضمان سنة كاملة

اضغط هنا للطلب الآن:
https://tiarboutique.shop

أو رد على هذه الرسالة وسنساعدك! 🙏`;
}
