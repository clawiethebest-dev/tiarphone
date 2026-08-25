import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ALL_PRODUCTS } from '@/data/products';

// GET all products
export async function GET() {
  try {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return NextResponse.json({ success: true, data });
      }
    }

    // Fallback to static products if DB table is empty or unconfigured
    const formatted = ALL_PRODUCTS.map(p => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      long_description: p.longDescription,
      price: p.price,
      original_price: p.originalPrice,
      category: p.category,
      images: p.images,
      specifications: p.specifications,
      in_stock: p.inStock,
      stock: p.stock || 50,
      featured: p.featured || false,
      deal: p.deal || false,
      rating: p.rating || 5,
      reviews_count: p.reviewsCount || 0,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json({ success: true, data: ALL_PRODUCTS });
  }
}

// CREATE new product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ success: false, error: 'Database not configured' });
    }

    const productData = {
      id: body.id || `prod-${Date.now()}`,
      slug: body.slug,
      name: body.name,
      description: body.description,
      long_description: body.longDescription || body.long_description,
      price: body.price,
      original_price: body.originalPrice || body.original_price,
      category: body.category || 'packets',
      images: body.images || [],
      specifications: body.specifications || {},
      in_stock: body.inStock !== false,
      stock: body.stock || 50,
      featured: body.featured || false,
      deal: body.deal || false,
      rating: body.rating || 5,
      reviews_count: body.reviewsCount || 0,
    };

    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase POST product error:', error);
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 });
  }
}

// UPDATE product
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { productId, ...updateData } = body;

    if (!productId) {
      return NextResponse.json({ success: false, error: 'Missing productId' }, { status: 400 });
    }

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ success: false, error: 'Database not configured' });
    }

    // Transform field names if needed
    const dbData: Record<string, any> = {};
    if (updateData.name) dbData.name = updateData.name;
    if (updateData.slug) dbData.slug = updateData.slug;
    if (updateData.description) dbData.description = updateData.description;
    if (updateData.longDescription) dbData.long_description = updateData.longDescription;
    if (updateData.price !== undefined) dbData.price = updateData.price;
    if (updateData.originalPrice !== undefined) dbData.original_price = updateData.originalPrice;
    if (updateData.category) dbData.category = updateData.category;
    if (updateData.images) dbData.images = updateData.images;
    if (updateData.specifications) dbData.specifications = updateData.specifications;
    if (updateData.inStock !== undefined) dbData.in_stock = updateData.inStock;
    if (updateData.stock !== undefined) dbData.stock = updateData.stock;
    if (updateData.featured !== undefined) dbData.featured = updateData.featured;
    if (updateData.deal !== undefined) dbData.deal = updateData.deal;

    const { data, error } = await supabase
      .from('products')
      .update(dbData)
      .eq('id', productId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase PATCH product error:', error);
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ success: false, error: 'Missing productId' }, { status: 400 });
    }

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ success: false, error: 'Database not configured' });
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Supabase DELETE product error:', error);
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}
