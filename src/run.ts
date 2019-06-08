import {
  ISuite,
  RunParams,
  Sorter,
  Plan,
  Report,
  Summary,
  JobPredicate,
} from "./interfaces";
import { Suite } from "./Suite";
import { shuffle } from "./shuffle";

export async function run(suite: ISuite): Promise<void>;
export async function run(suites: ISuite[]): Promise<void>;
export async function run(suite: ISuite, params: RunParams): Promise<void>;
export async function run(suites: ISuite[], params: RunParams): Promise<void>;
export async function run(
  suites: ISuite | ISuite[],
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
  suite: ISuite,
): AsyncIterableIterator<Plan | Report | Summary>;
export function generator(
  suites: ISuite[],
): AsyncIterableIterator<Plan | Report | Summary>;
export function generator(
  suite: ISuite,
  sort: Sorter,
): AsyncIterableIterator<Plan | Report | Summary>;
export function generator(
  suites: ISuite[],
  sort: Sorter,
): AsyncIterableIterator<Plan | Report | Summary>;
export function generator(
  suite: ISuite,
  sort: Sorter,
  predicate: JobPredicate,
): AsyncIterableIterator<Plan | Report | Summary>;
export function generator(
  suites: ISuite[],
  sort: Sorter,
  predicate: JobPredicate,
): AsyncIterableIterator<Plan | Report | Summary>;
export async function* generator(
  suites: ISuite | ISuite[],
  sort: Sorter = shuffle,
  predicate: JobPredicate = Boolean,
): AsyncIterableIterator<Plan | Report | Summary> {
  yield* Suite.from([].concat(suites)).run(sort, predicate);
}
