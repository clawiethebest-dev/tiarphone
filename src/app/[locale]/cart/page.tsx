'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  TrashIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  TruckIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { formatPrice } from '@/lib/utils';
import type { Locale, Product } from '@/types';

interface CartItem {
  product: Product;
  quantity: number;
}

interface Wilaya {
  id: number;
  name: string;
  home_fee: number;
  desk_fee: number;
  is_deliverable: boolean;
}

interface Commune {
  id: number;
  name: string;
  wilaya_id: number;
  has_stop_desk: boolean;
  is_deliverable: boolean;
}

const translations: Record<string, Record<string, string>> = {
  ar: {
    cart: 'سلة التسوق',
    emptyCart: 'سلة التسوق فارغة',
    continueShopping: 'مواصلة التسوق',
    checkout: 'إتمام الطلب',
    orderSummary: 'ملخص الطلب',
    subtotal: 'المجموع الفرعي',
    delivery: 'التوصيل',
    total: 'المجموع',
    remove: 'حذف',
    fullName: 'الاسم الكامل',
    phone: 'رقم الهاتف',
    phonePlaceholder: '05 xx xx xx xx',
    wilaya: 'الولاية',
    selectWilaya: 'اختر الولاية',
    commune: 'البلدية',
    selectCommune: 'اختر البلدية',
    address: 'العنوان',
    addressPlaceholder: 'الحي، الشارع، رقم المنزل',
    notes: 'ملاحظات إضافية',
    cashOnDelivery: 'الدفع عند الاستلام',
    codDescription: 'ادفع نقداً عند استلام طلبك',
    placeOrder: 'تأكيد الطلب',
    orderSuccess: 'تم تأكيد طلبك بنجاح!',
    orderSuccessDetail: 'سيتصل بك فريقنا للتأكيد',
    backToHome: 'العودة للرئيسية',
    required: 'مطلوب',
    dzd: 'د.ج',
    homeDelivery: 'توصيل للمنزل',
    deskDelivery: 'استلام من المكتب',
    calculating: 'جاري حساب التوصيل...',
    loadingWilayas: 'جاري تحميل الولايات...',
    loadingCommunes: 'جاري تحميل البلديات...',
    deliveryNote: 'سيتم التوصيل خلال 2-5 أيام عمل',
  },
  fr: {
    cart: 'Panier',
    emptyCart: 'Votre panier est vide',
    continueShopping: 'Continuer vos achats',
    checkout: 'Commander',
    orderSummary: 'Résumé de la commande',
    subtotal: 'Sous-total',
    delivery: 'Livraison',
    total: 'Total',
    remove: 'Supprimer',
    fullName: 'Nom complet',
    phone: 'Téléphone',
    phonePlaceholder: '05 xx xx xx xx',
    wilaya: 'Wilaya',
    selectWilaya: 'Sélectionner la wilaya',
    commune: 'Commune',
    selectCommune: 'Sélectionner la commune',
    address: 'Adresse',
    addressPlaceholder: 'Quartier, rue, numéro',
    notes: 'Notes',
    cashOnDelivery: 'Paiement à la livraison',
    codDescription: 'Payez en espèces à la réception',
    placeOrder: 'Confirmer la commande',
    orderSuccess: 'Votre commande a été confirmée!',
    orderSuccessDetail: 'Nous vous contacterons bientôt',
    backToHome: "Retour à l'accueil",
    required: 'Requis',
    dzd: 'DA',
    homeDelivery: 'Livraison à domicile',
    deskDelivery: 'Retrait au bureau',
    calculating: 'Calcul de la livraison...',
    loadingWilayas: 'Chargement des wilayas...',
    loadingCommunes: 'Chargement des communes...',
    deliveryNote: 'Livraison en 2-5 jours ouvrables',
  },
  en: {
    cart: 'Cart',
    emptyCart: 'Your cart is empty',
    continueShopping: 'Continue Shopping',
    checkout: 'Checkout',
    orderSummary: 'Order Summary',
    subtotal: 'Subtotal',
    delivery: 'Delivery',
    total: 'Total',
    remove: 'Remove',
    fullName: 'Full Name',
    phone: 'Phone',
    phonePlaceholder: '05 xx xx xx xx',
    wilaya: 'Wilaya',
    selectWilaya: 'Select wilaya',
    commune: 'Commune',
    selectCommune: 'Select commune',
    address: 'Address',
    addressPlaceholder: 'Neighborhood, street, house number',
    notes: 'Notes',
    cashOnDelivery: 'Cash on Delivery',
    codDescription: 'Pay cash when you receive your order',
    placeOrder: 'Place Order',
    orderSuccess: 'Your order has been confirmed!',
    orderSuccessDetail: 'We will contact you soon',
    backToHome: 'Back to Home',
    required: 'Required',
    dzd: 'DZD',
    homeDelivery: 'Home Delivery',
    deskDelivery: 'Pickup from Desk',
    calculating: 'Calculating delivery...',
    loadingWilayas: 'Loading wilayas...',
    loadingCommunes: 'Loading communes...',
    deliveryNote: 'Delivery in 2-5 business days',
  },
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function CartPage({ params }: PageProps) {
  const router = useRouter();
  const [lang, setLang] = useState<Locale>('ar');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [loading, setLoading] = useState(false);
  
  // Delivery data
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingWilayas, setLoadingWilayas] = useState(true);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    wilayaId: 0,
    communeId: 0,
    address: '',
    notes: '',
    deliveryType: 'home' as 'home' | 'desk',
  });

  const t = translations[lang] || translations.ar;

  useEffect(() => {
    params.then(p => setLang(p.locale as Locale));
  }, [params]);

  // Load cart from localStorage (check both old and new keys)
  useEffect(() => {
    // Try Zustand cart first (tiar-cart)
    const zustandCart = localStorage.getItem('tiar-cart');
    if (zustandCart) {
      try {
        const parsed = JSON.parse(zustandCart);
        // Zustand persist stores data in .state.items
        if (parsed.state && parsed.state.items) {
          setCart(parsed.state.items);
          return;
        }
      } catch (e) {
        console.error('Error loading Zustand cart:', e);
      }
    }
    
    // Fallback to legacy key
    const savedCart = localStorage.getItem('tiarphone_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error loading cart:', e);
      }
    }
  }, []);

  // Fetch wilayas on load
  useEffect(() => {
    async function fetchWilayas() {
      try {
        const response = await fetch('/api/delivery/wilayas');
        const data = await response.json();
        if (data.success) {
          setWilayas(data.data);
        }
      } catch (error) {
        console.error('Error fetching wilayas:', error);
      } finally {
        setLoadingWilayas(false);
      }
    }
    fetchWilayas();
  }, []);

  // Fetch communes when wilaya changes
  useEffect(() => {
    async function fetchCommunes() {
      if (!formData.wilayaId) {
        setCommunes([]);
        return;
      }
      
      setLoadingCommunes(true);
      try {
        const response = await fetch(`/api/delivery/communes?wilaya_id=${formData.wilayaId}`);
        const data = await response.json();
        if (data.success) {
          setCommunes(data.data);
        }
      } catch (error) {
        console.error('Error fetching communes:', error);
      } finally {
        setLoadingCommunes(false);
      }
    }
    fetchCommunes();
  }, [formData.wilayaId]);

  // Save cart to localStorage (both formats for compatibility)
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    // Save to Zustand format
    localStorage.setItem('tiar-cart', JSON.stringify({ state: { items: newCart }, version: 0 }));
    // Also save to legacy format
    localStorage.setItem('tiarphone_cart', JSON.stringify(newCart));
  };

  const updateQuantity = (productId: string, delta: number) => {
    const newCart = cart.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    saveCart(newCart);
  };

  const removeItem = (productId: string) => {
    const newCart = cart.filter(item => item.product.id !== productId);
    saveCart(newCart);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  const selectedWilaya = wilayas.find(w => w.id === formData.wilayaId);
  const deliveryFee = selectedWilaya
    ? formData.deliveryType === 'home'
      ? selectedWilaya.home_fee
      : selectedWilaya.desk_fee
    : 0;
  
  const total = subtotal + deliveryFee;

  const [orderId, setOrderId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get wilaya and commune names
      const wilayaName = wilayas.find(w => w.id === formData.wilayaId)?.name || '';
      const communeName = communes.find(c => c.id === formData.communeId)?.name || '';

      // Send order to API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          wilayaId: formData.wilayaId,
          wilayaName,
          communeId: formData.communeId,
          communeName,
          address: formData.address,
          notes: formData.notes,
          deliveryType: formData.deliveryType,
          items: cart,
          subtotal,
          deliveryFee,
          total,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOrderId(data.data.id);
        // Clear cart
        saveCart([]);
        setStep('success');
      } else {
        alert('حدث خطأ في إرسال الطلب. حاول مرة أخرى.');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('حدث خطأ في إرسال الطلب. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.orderSuccess}</h1>
          {orderId && (
            <p className="text-brand-600 font-bold mb-2">رقم الطلب: {orderId}</p>
          )}
          <p className="text-gray-500 mb-6">{t.orderSuccessDetail}</p>
          <Link
            href={`/${lang}`}
            className="inline-block px-6 py-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition font-medium"
          >
            {t.backToHome}
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && step === 'cart') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingBagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">{t.emptyCart}</h1>
          <Link
            href={`/${lang}/products`}
            className="inline-block mt-4 px-6 py-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition"
          >
            {t.continueShopping}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {step === 'cart' ? t.cart : t.checkout}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items / Checkout Form */}
          <div className="lg:col-span-2">
            {step === 'cart' ? (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {cart.map(item => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-0"
                  >
                    <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={item.product.images[0] || '/placeholder.png'}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                      <p className="text-brand-600 font-bold">
                        {formatPrice(item.product.price, lang)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.fullName} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.phone} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder={t.phonePlaceholder}
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.wilaya} <span className="text-red-500">*</span>
                    </label>
                    {loadingWilayas ? (
                      <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500">
                        {t.loadingWilayas}
                      </div>
                    ) : (
                      <select
                        required
                        value={formData.wilayaId}
                        onChange={e => setFormData({ ...formData, wilayaId: parseInt(e.target.value), communeId: 0 })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500"
                      >
                        <option value={0}>{t.selectWilaya}</option>
                        {wilayas.filter(w => w.is_deliverable).map(wilaya => (
                          <option key={wilaya.id} value={wilaya.id}>
                            {wilaya.id.toString().padStart(2, '0')} - {wilaya.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.commune} <span className="text-red-500">*</span>
                    </label>
                    {loadingCommunes ? (
                      <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500">
                        {t.loadingCommunes}
                      </div>
                    ) : (
                      <select
                        required
                        value={formData.communeId}
                        onChange={e => setFormData({ ...formData, communeId: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500"
                        disabled={!formData.wilayaId}
                      >
                        <option value={0}>{t.selectCommune}</option>
                        {communes.filter(c => c.is_deliverable).map(commune => (
                          <option key={commune.id} value={commune.id}>
                            {commune.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.address} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t.addressPlaceholder}
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.notes}
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* Delivery Type */}
                {selectedWilaya && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع التوصيل
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, deliveryType: 'home' })}
                        className={`p-3 rounded-lg border-2 text-center transition ${
                          formData.deliveryType === 'home'
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <TruckIcon className="w-6 h-6 mx-auto mb-1" />
                        <p className="font-medium">{t.homeDelivery}</p>
                        <p className="text-sm text-brand-600 font-bold">
                          {selectedWilaya.home_fee} {t.dzd}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, deliveryType: 'desk' })}
                        className={`p-3 rounded-lg border-2 text-center transition ${
                          formData.deliveryType === 'desk'
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <ShoppingBagIcon className="w-6 h-6 mx-auto mb-1" />
                        <p className="font-medium">{t.deskDelivery}</p>
                        <p className="text-sm text-brand-600 font-bold">
                          {selectedWilaya.desk_fee} {t.dzd}
                        </p>
                      </button>
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <input type="radio" checked readOnly className="w-4 h-4 text-brand-500" />
                    <div>
                      <p className="font-medium">{t.cashOnDelivery}</p>
                      <p className="text-sm text-gray-500">{t.codDescription}</p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 py-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition disabled:opacity-50"
                >
                  {loading ? '⏳' : t.placeOrder}
                </button>
              </form>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h2 className="font-bold text-gray-900 mb-4">{t.orderSummary}</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.subtotal}</span>
                  <span className="font-medium">{formatPrice(subtotal, lang)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.delivery}</span>
                  <span className="font-medium">
                    {formData.wilayaId ? formatPrice(deliveryFee, lang) : '-'}
                  </span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>{t.total}</span>
                  <span className="text-brand-600">{formatPrice(total, lang)}</span>
                </div>
              </div>

              {step === 'cart' && (
                <button
                  onClick={() => setStep('checkout')}
                  className="w-full mt-6 py-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition"
                >
                  {t.checkout}
                </button>
              )}

              <p className="mt-4 text-xs text-gray-500 text-center">
                {t.deliveryNote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
