import type { NextFunction, Request, Response } from "express";

/** Result of a validator: the cleaned value, or a message for a 400 reply. */
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export type Validator<T> = (input: unknown) => Result<T>;

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function fail<T = never>(error: string): Result<T> {
  return { ok: false, error };
}

export function isPlainObject(input: unknown): input is Record<string, unknown> {
  return input !== null && typeof input === "object" && !Array.isArray(input);
}

export type StringRule = { min?: number; max?: number; trim?: boolean };

/** Read a required string field, trimmed by default, with optional length bounds. */
export function requireString(
  body: Record<string, unknown>,
  key: string,
  rule: StringRule = {},
): Result<string> {
  const raw = body[key];
  if (typeof raw !== "string") return fail(`${key} must be a string`);
  const value = rule.trim === false ? raw : raw.trim();
  const min = rule.min ?? 1;
  if (value.length < min) return fail(`${key} must be at least ${min} characters`);
  if (rule.max !== undefined && value.length > rule.max) {
    return fail(`${key} must be at most ${rule.max} characters`);
  }
  return ok(value);
}

/**
 * Express middleware: run a validator on req.body. On failure reply 400
 * `{ error }`; on success put the cleaned value on res.locals.body.
 */
export function validateBody<T>(validator: Validator<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = validator(req.body);
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.locals.body = result.value;
    next();
  };
}
