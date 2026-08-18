import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["ar", "fr", "en"],

  // Used when no locale matches
  defaultLocale: "ar",

  // The prefix strategy for URLs
  localePrefix: "as-needed"
});

export type Locale = (typeof routing.locales)[number];

export const defaultLocale: Locale = routing.defaultLocale;

export const localeNames: Record<Locale, string> = {
  ar: "العربية",
  fr: "Français",
  en: "English"
};

export const localeDirections: Record<Locale, "rtl" | "ltr"> = {
  ar: "rtl",
  fr: "ltr",
  en: "ltr"
};
