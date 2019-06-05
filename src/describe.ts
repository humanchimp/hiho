import { SuiteClosure, SuiteParams } from "./interfaces";
import { Suite } from "./Suite";

export function describe(
  description: string | null,
  closure?: SuiteClosure,
  options?: SuiteParams,
): Suite {
  const suite = new Suite(description, options);

  if (closure != null) {
    closure(suite);
  }
  return suite;
}
