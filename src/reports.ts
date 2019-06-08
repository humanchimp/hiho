import { Report, Sorter, JobPredicate, ISuite } from "./interfaces";
import { Suite } from "./Suite";
import { shuffle } from "./shuffle";

export async function* reports(
  suites: ISuite | ISuite[],
  sort: Sorter = shuffle,
  predicate?: JobPredicate,
): AsyncIterableIterator<Report> {
  yield* Suite.from([].concat(suites)).reports(sort, predicate);
}
