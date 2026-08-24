'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PhoneIcon, ShieldCheckIcon, TruckIcon, StarIcon } from '@heroicons/react/24/solid';
import { MinusIcon, PlusIcon, HomeIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { trackInitiateCheckout, trackPurchase, trackLead } from '@/lib/pixels';
import { getTrafficSourceForOrder } from '@/lib/traffic-source';
import type { Product, Locale } from '@/types';

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

interface OrderPopupProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  lang: Locale;
}

const translations: Record<string, Record<string, string>> = {
  ar: {
    orderNow: 'اطلب الآن',
    completeOrder: 'إتمام الطلب',
    fullName: 'الاسم الكامل',
    phone1: 'رقم الهاتف',
    phone2: 'رقم هاتف ثاني (احتياطي)',
    addPhone2: '+ إضافة رقم ثاني',
    wilaya: 'الولاية',
    commune: 'البلدية',
    address: 'العنوان بالتفصيل',
    deliveryType: 'نوع التوصيل',
    home: 'باب المنزل',
    desk: 'المكتب',
    subtotal: 'سعر المنتج',
    delivery: 'التوصيل',
    total: 'المجموع',
    confirmOrder: 'تأكيد الطلب',
    sending: 'جاري الإرسال...',
    selectWilaya: 'اختر الولاية',
    selectCommune: 'اختر البلدية',
    loading: 'جاري التحميل...',
    payOnDelivery: 'الدفع عند الاستلام - لا تدفع حتى تستلم!',
    warranty: 'ضمان سنة كاملة',
    fastDelivery: 'توصيل 24-48 ساعة',
    happyCustomers: '+100 عميل راضي',
    quantity: 'الكمية',
    phoneHint: 'سنتصل بك على هذا الرقم لتأكيد الطلب',
    phone2Hint: 'رقم احتياطي إذا لم نستطع الوصول للرقم الأول',
    orderSuccess: 'تم إرسال طلبك بنجاح!',
    orderSuccessMessage: 'سنتصل بك قريباً لتأكيد الطلب',
  },
  fr: {
    orderNow: 'Commander',
    completeOrder: 'Finaliser la commande',
    fullName: 'Nom complet',
    phone1: 'Téléphone',
    phone2: 'Téléphone secondaire',
    addPhone2: '+ Ajouter un 2ème numéro',
    wilaya: 'Wilaya',
    commune: 'Commune',
    address: 'Adresse complète',
    deliveryType: 'Type de livraison',
    home: 'À domicile',
    desk: 'Bureau',
    subtotal: 'Sous-total',
    delivery: 'Livraison',
    total: 'Total',
    confirmOrder: 'Confirmer la commande',
    sending: 'Envoi en cours...',
    selectWilaya: 'Sélectionnez une wilaya',
    selectCommune: 'Sélectionnez une commune',
    loading: 'Chargement...',
    payOnDelivery: 'Paiement à la livraison - Ne payez qu\'à la réception!',
    warranty: 'Garantie 1 an',
    fastDelivery: 'Livraison 24-48h',
    happyCustomers: '+100 clients satisfaits',
    quantity: 'Quantité',
    phoneHint: 'Nous vous appellerons pour confirmer',
    phone2Hint: 'Numéro de secours',
    orderSuccess: 'Commande envoyée avec succès!',
    orderSuccessMessage: 'Nous vous appellerons bientôt',
  },
  en: {
    orderNow: 'Order Now',
    completeOrder: 'Complete Order',
    fullName: 'Full Name',
    phone1: 'Phone Number',
    phone2: 'Secondary Phone',
    addPhone2: '+ Add second number',
    wilaya: 'Wilaya',
    commune: 'Commune',
    address: 'Full Address',
    deliveryType: 'Delivery Type',
    home: 'Home Delivery',
    desk: 'Stop Desk',
    subtotal: 'Subtotal',
    delivery: 'Delivery',
    total: 'Total',
    confirmOrder: 'Confirm Order',
    sending: 'Sending...',
    selectWilaya: 'Select a wilaya',
    selectCommune: 'Select a commune',
    loading: 'Loading...',
    payOnDelivery: 'Cash on Delivery - Pay only when you receive!',
    warranty: '1 Year Warranty',
    fastDelivery: '24-48h Delivery',
    happyCustomers: '+100 Happy Customers',
    quantity: 'Quantity',
    phoneHint: 'We will call you to confirm',
    phone2Hint: 'Backup number',
    orderSuccess: 'Order submitted successfully!',
    orderSuccessMessage: 'We will call you soon to confirm',
  },
};

export default function OrderPopup({ isOpen, onClose, product, lang }: OrderPopupProps) {
  const t = translations[lang] || translations.ar;
  
  const [formData, setFormData] = useState({
    name: '',
    phone1: '',
    phone2: '',
    wilaya_id: '',
    commune_id: '',
    address: '',
    delivery_type: 'home' as 'home' | 'desk',
  });
  
  const [quantity, setQuantity] = useState(1);
  const [showPhone2, setShowPhone2] = useState(false);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [phoneSaved, setPhoneSaved] = useState(false);

  // Load wilayas and communes from JSON
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/wilayas');
        const data = await response.json();
        setWilayas(data.wilayas || []);
        setCommunes([]);
      } catch (error) {
        console.error('Error loading location data:', error);
      }
      setIsLoading(false);
    };
    
    if (isOpen) {
      loadData();
      trackInitiateCheckout(product.price, 1);
    }
  }, [isOpen, product]);

  const filteredCommunes = communes.filter(
    (c) => c.wilaya_id === parseInt(formData.wilaya_id)
  );

  const selectedWilaya = wilayas.find(
    (w) => w.id === parseInt(formData.wilaya_id)
  );

  const deliveryFee = selectedWilaya
    ? formData.delivery_type === 'home'
      ? selectedWilaya.home_fee
      : selectedWilaya.desk_fee
    : 0;

  const productPrice = product.price * quantity;
  const total = productPrice + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const trafficSource = getTrafficSourceForOrder();
      
      const orderData = {
        ...formData,
        product_id: product.id,
        product_name: product.name,
        quantity,
        product_price: product.price,
        delivery_fee: deliveryFee,
        total,
        traffic_source: trafficSource,
        lang,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        // Mark checkout as completed
        try {
          await fetch('/api/abandoned-checkout', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: formData.phone1 }),
          });
        } catch (e) { /* ignore */ }
        
        trackPurchase({ content_ids: [product.id], value: total, currency: 'DZD', num_items: 1 });
        trackLead();
        setOrderSuccess(true);
      }
    } catch (error) {
      console.error('Order error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {t.orderSuccess}
                </h3>
                <p className="text-gray-600 mb-6">{t.orderSuccessMessage}</p>
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition"
                >
                  OK
                </button>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-brand-600 to-brand-700 text-white p-4">
                  <div className="flex items-center justify-between">
                    <Dialog.Title className="text-xl font-bold">
                      {t.completeOrder}
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-white/20 rounded-lg transition"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                  
                  {/* Trust badges */}
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="flex items-center gap-1">
                      <PhoneIcon className="w-4 h-4" />
                      {t.payOnDelivery}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4 border-b">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 relative rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={product.images[0] || '/placeholder.png'}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-brand-600 font-bold">{formatPrice(product.price)}</p>
                      
                      {/* Quantity */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-gray-600">{t.quantity}:</span>
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-gray-100"
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-gray-100"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.fullName} *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  {/* Phone 1 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.phone1} *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="05xxxxxxxx"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      value={formData.phone1}
                      onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
                      onBlur={async (e) => {
                        // Save phone for abandoned checkout recovery
                        const phone = e.target.value.replace(/\D/g, '');
                        if (phone.length >= 9 && !phoneSaved) {
                          setPhoneSaved(true);
                          try {
                            await fetch('/api/abandoned-checkout', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                phone,
                                name: formData.name,
                                product_id: product.id,
                                product_name: product.name,
                                product_price: product.price,
                                wilaya_name: selectedWilaya?.name,
                                lang,
                              }),
                            });
                          } catch (e) { /* ignore */ }
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">{t.phoneHint}</p>
                  </div>

                  {/* Phone 2 */}
                  {!showPhone2 ? (
                    <button
                      type="button"
                      onClick={() => setShowPhone2(true)}
                      className="text-brand-600 text-sm font-medium hover:underline"
                    >
                      {t.addPhone2}
                    </button>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t.phone2}
                      </label>
                      <input
                        type="tel"
                        placeholder="05xxxxxxxx"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        value={formData.phone2}
                        onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                      />
                      <p className="text-xs text-gray-500 mt-1">{t.phone2Hint}</p>
                    </div>
                  )}

                  {/* Wilaya */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.wilaya} *
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      value={formData.wilaya_id}
                      onChange={(e) => setFormData({ ...formData, wilaya_id: e.target.value, commune_id: '' })}
                    >
                      <option value="">{isLoading ? t.loading : t.selectWilaya}</option>
                      {wilayas.map((wilaya) => (
                        <option key={wilaya.id} value={wilaya.id}>
                          {wilaya.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Commune */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.commune} *
                    </label>
                    <select
                      required
                      disabled={!formData.wilaya_id}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:bg-gray-100"
                      value={formData.commune_id}
                      onChange={(e) => setFormData({ ...formData, commune_id: e.target.value })}
                    >
                      <option value="">{t.selectCommune}</option>
                      {filteredCommunes.map((commune) => (
                        <option key={commune.id} value={commune.id}>
                          {commune.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.address} *
                    </label>
                    <textarea
                      required
                      rows={2}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  {/* Delivery Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.deliveryType}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, delivery_type: 'home' })}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition ${
                          formData.delivery_type === 'home'
                            ? 'border-brand-600 bg-brand-50 text-brand-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <HomeIcon className="w-5 h-5" />
                        <span className="font-medium">{t.home}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, delivery_type: 'desk' })}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition ${
                          formData.delivery_type === 'desk'
                            ? 'border-brand-600 bg-brand-50 text-brand-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <BuildingOfficeIcon className="w-5 h-5" />
                        <span className="font-medium">{t.desk}</span>
                      </button>
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>{t.subtotal}</span>
                      <span>{formatPrice(productPrice)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>{t.delivery}</span>
                      <span>{formatPrice(deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                      <span>{t.total}</span>
                      <span className="text-brand-600">{formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl font-bold text-lg hover:from-brand-700 hover:to-brand-800 transition disabled:opacity-50"
                  >
                    {isSubmitting ? t.sending : t.confirmOrder}
                  </button>
                </form>

                {/* Trust badges */}
                <div className="px-4 pb-4">
                  <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                      {t.warranty}
                    </span>
                    <span className="flex items-center gap-1">
                      <TruckIcon className="w-4 h-4 text-blue-500" />
                      {t.fastDelivery}
                    </span>
                    <span className="flex items-center gap-1">
                      <StarIcon className="w-4 h-4 text-yellow-500" />
                      {t.happyCustomers}
                    </span>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
