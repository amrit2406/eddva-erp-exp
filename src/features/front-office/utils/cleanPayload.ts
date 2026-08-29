/**
 * Strips undefined and empty-string values from a payload before sending to the API.
 * Needed because class-validator's @IsOptional() only skips undefined/null, not ''
 * — an empty string still hits validators like @IsEmail() and gets rejected.
 */
export function cleanPayload<T extends object>(payload: T): Partial<T> {
  const result: Partial<T> = {};
  (Object.keys(payload) as (keyof T)[]).forEach((key) => {
    const value = payload[key];
    if (value !== undefined && value !== '') {
      result[key] = value;
    }
  });
  return result;
}
