'use client';

interface FeaturesBannerProps {
  t: Record<string, string>;
}

const features = [
  { icon: '🚚', key: 'fastDelivery', delay: 0 },
  { icon: '🔒', key: 'secureCheckout', delay: 100 },
  { icon: '✅', key: 'qualityGuarantee', delay: 200 },
  { icon: '🎧', key: 'support', delay: 300 },
];

export default function FeaturesBanner({ t }: FeaturesBannerProps) {
  return (
    <section className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
          {features.map((feature) => (
            <div
              key={feature.key}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition animate-slide-up opacity-0"
              style={{
                animationDelay: `${feature.delay}ms`,
                animationFillMode: 'forwards'
              }}
            >
              <span className="text-2xl">{feature.icon}</span>
              <span className="font-semibold text-gray-800 text-sm">
                {t[feature.key]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
