import type { Locale } from "./i18n";

const dictionaries = {
  zh: () => import("@/messages/zh.json").then((mod) => mod.default),
  en: () => import("@/messages/en.json").then((mod) => mod.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["zh"]>>;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
