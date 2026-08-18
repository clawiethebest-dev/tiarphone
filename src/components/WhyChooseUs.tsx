'use client';

interface WhyChooseUsProps {
  t: Record<string, string>;
}

export default function WhyChooseUs({ t }: WhyChooseUsProps) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t.whyChooseUs}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t.footerAbout}
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 text-sm">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 rounded-full">
            🇩🇿 {t.onlyAlgeria} — {t.currency}
          </span>
        </div>
      </div>
    </section>
  );
}
