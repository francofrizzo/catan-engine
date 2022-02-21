export type CheckResult =
  | { allowed: true }
  | { allowed: false; reason: string };

export default CheckResult;
