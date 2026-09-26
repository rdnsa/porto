// Contract for POST /api/contact, shared by the Pages Function and the page.

/** Why a message was refused. The page shows each one in the visitor's language. */
export type ContactErrorCode = "missing_fields" | "invalid_email" | "rate_limited" | "generic";

export type ContactResponse = { ok: true } | { ok: false; code: ContactErrorCode; error: string };

const CONTACT_ERROR_CODES: readonly ContactErrorCode[] = ["missing_fields", "invalid_email", "rate_limited", "generic"];

export const isContactErrorCode = (value: unknown): value is ContactErrorCode =>
  CONTACT_ERROR_CODES.includes(value as ContactErrorCode);
