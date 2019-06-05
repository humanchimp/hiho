import {
  RunParams,
  Sorter,
  Plan,
  Report,
  Summary,
  JobPredicate,
} from "./interfaces";
import { Suite } from "./Suite";
import { shuffle } from "./shuffle";

export async function run(suite: Suite): Promise<void>;
export async function run(suites: Suite[]): Promise<void>;
export async function run(suite: Suite, params: RunParams): Promise<void>;
export async function run(suites: Suite[], params: RunParams): Promise<void>;
export async function run(
  suites: Suite | Suite[],
  {
    generate = generator,
    perform = console.log, // eslint-disable-line
    sort = shuffle,
    predicate = Boolean,
  }: RunParams = {},
): Promise<void> {
  for await (const report of generate([].concat(suites), sort, predicate)) {
    perform(report);
  }
}

export function generator(
  suite: Suite,
): AsyncIterableIterator<Plan | Report | Summary>;
export function generator(
  suites: Suite[],
): AsyncIterableIterator<Plan | Report | Summary>;
export function generator(
  suite: Suite,
  sort: Sorter,
): AsyncIterableIterator<Plan | Report | Summary>;
export function generator(
  suites: Suite[],
  sort: Sorter,
): AsyncIterableIterator<Plan | Report | Summary>;
export function generator(
  suite: Suite,
  sort: Sorter,
  predicate: JobPredicate,
): AsyncIterableIterator<Plan | Report | Summary>;
export function generator(
  suites: Suite[],
  sort: Sorter,
  predicate: JobPredicate,
): AsyncIterableIterator<Plan | Report | Summary>;
export async function* generator(
  suites: Suite | Suite[],
  sort: Sorter = shuffle,
  predicate: JobPredicate = Boolean,
): AsyncIterableIterator<Plan | Report | Summary> {
  yield* Suite.from([].concat(suites)).run(sort, predicate);
}
