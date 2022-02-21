import { CheckFailedError, CheckFailedReason } from "./FailedChecks";

export type BaseCheck = { check: () => boolean; elseReason: CheckFailedReason };
export type CheckResult = { value: true } | { value: false; reason: CheckFailedReason };
export type Check = BaseCheck | (() => CheckResult);
export const isBaseCheck = (check: Check): check is BaseCheck => Object.hasOwnProperty.call(check, "check");

export const check =
  <T, A extends unknown[]>(check: (target: T, ...args: A) => CheckResult) =>
  (target: T, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<(...args: A) => any>) => {
    const originalImplementation = descriptor.value!;
    descriptor.value = function (this: T, ...args: A) {
      const checkResult = check(this, ...args);
      if (checkResult.value) {
        return originalImplementation.apply(this, args);
      } else {
        throw new CheckFailedError(checkResult.reason);
      }
    };
  };
