/** ID pendek acak dengan prefix, mis. `pt3k9x2`. Cukup untuk prototipe. */
export function uid(prefix: string): string {
  return prefix + Math.random().toString(36).slice(2, 8);
}

/** Token panjang untuk tautan koordinator (tidak boleh mudah ditebak). */
export function token(): string {
  return uid("") + uid("") + uid("");
}
