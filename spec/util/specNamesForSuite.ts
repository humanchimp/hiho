import { accumulate } from "./accumulate";
import { Suite } from "../../src/interfaces";

export async function specNamesForSuite(suite: Suite): Promise<string[]> {
  return (await accumulate(suite.reports(it => it))).map(it => it.description);
}
