/** Kesalahan aturan bisnis; pesannya aman ditampilkan langsung ke pengguna. */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

/** Melempar DomainError. Tipe `never` membantu narrowing di pemanggil. */
export function fail(message: string): never {
  throw new DomainError(message);
}
