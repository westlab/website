import type { Lang } from '../i18n/ui';

// YAML の短いフィールドは <key>_ja / <key>_en を同一レコードに持つ。
// ja と en の両方がある key だけを受け付け、lang に合う方の値を返す。
type LocalizedKey<T> = {
  [P in keyof T & string]: P extends `${infer K}_ja` ? (`${K}_en` extends keyof T ? K : never) : never;
}[keyof T & string];

export function localize<T, K extends LocalizedKey<T>>(obj: T, key: K, lang: Lang): T[`${K}_${Lang}` & keyof T] {
  return obj[`${key}_${lang}` as keyof T & string] as T[`${K}_${Lang}` & keyof T];
}
