import { Check, CheckResult, isBaseCheck } from "./Checks";

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
    let checkResult: CheckResult = { value: true };
    for (let check of this.checks) {
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
  }
}

export default Checker;
