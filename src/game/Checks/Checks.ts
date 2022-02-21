import GameplayError from "../Dynamics/GameplayError";

export type Check = { check: boolean; elseReason: string } | CheckResult;

export type CheckResult = { value: true } | { value: false; reason: string };

const isCheckResult = (check: Check): check is CheckResult => Object.hasOwnProperty.call(check, "value");

export const runChecks = (checks: Check[]): CheckResult => {
  let checkResult: CheckResult = { value: true };
  for (let check of checks) {
    if (isCheckResult(check)) {
      if (!check.value) {
        checkResult = check;
        break;
      }
    } else {
      if (!check.check) {
        checkResult = { value: false, reason: check.elseReason };
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
