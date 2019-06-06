import { accumulate } from "./accumulate";
import { ISuite } from "../../src/interfaces";

export async function specNamesForSuite(suite: ISuite): Promise<string[]> {
  return (await accumulate(suite.reports(it => it))).map(it => it.description);
}
