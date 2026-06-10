export class DbUnavailableError extends Error {
  constructor() {
    super(
      "Database unavailable. Start Docker Desktop, then run `npm run db:up` in the web folder."
    );
    this.name = "DbUnavailableError";
  }
}

export function isDbConnectionError(err: unknown): boolean {
  if (err instanceof DbUnavailableError) return true;

  const codes = new Set(["ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT", "ECONNRESET"]);
  const check = (e: unknown): boolean => {
    if (!e || typeof e !== "object") return false;
    const code = "code" in e ? String(e.code) : "";
    if (codes.has(code)) return true;
    if ("errors" in e && Array.isArray(e.errors)) {
      return e.errors.some(check);
    }
    return false;
  };

  return check(err);
}

export function rethrowDbError(err: unknown): never {
  if (isDbConnectionError(err)) throw new DbUnavailableError();
  throw err;
}
