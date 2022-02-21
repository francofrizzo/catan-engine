import GameplayError from "../Dynamics/GameplayError";

type BaseCheck = { check: () => boolean; elseReason: string };
export type CheckResult = { value: true } | { value: false; reason: string };
export type Check = BaseCheck | (() => CheckResult);
const isBaseCheck = (check: Check): check is BaseCheck => Object.hasOwnProperty.call(check, "check");

export const runChecks = (checks: Check[]): CheckResult => {
  let checkResult: CheckResult = { value: true };
  for (let check of checks) {
    if (isBaseCheck(check)) {
      if (!check.check()) {
        checkResult = { value: false, reason: check.elseReason };
        break;
      }
    } else {
      const thisCheckResult = check();
      if (!thisCheckResult.value) {
        checkResult = thisCheckResult;
        break;
      }
    }
  }
  return checkResult;
};

export const check =
  <T, A extends unknown[]>(check: (target: T, ...args: A) => CheckResult) =>
  (target: T, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<(...args: A) => any>) => {
    const originalImplementation = descriptor.value!;
    descriptor.value = function (this: T, ...args: A) {
      const checkResult = check(this, ...args);
      if (checkResult.value) {
        return originalImplementation.apply(this, args);
      } else {
        throw new GameplayError(checkResult.reason);
      }
    };
  };

export class Checker {
  private checks: Check[] = [];

  public addCheck(check: Check): this {
    this.checks.push(check);
    return this;
  }

  public addChecks(checks: Check[]): this {
    this.checks.push(...checks);
    return this;
  }

  public run(): CheckResult {
    return runChecks(this.checks);
  }
}
