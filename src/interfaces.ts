export interface ISuite {
  description: String;
  parent?: ISuite;
  skipped: boolean;
  focused: boolean;
  suites: ISuite[];
  specs: ISpec[];
  hooks: Hooks;
  meta: SpecMeta;
  listeners: Listeners;
  isFocusMode: boolean;
  isDeeplyFocused: boolean;
  orderedJobs(): IterableIterator<Job>;
  andParents(): IterableIterator<ISuite>;
  describe(
    description: string,
    closure: SuiteClosure,
    options?: SuiteParams,
  ): ISuite;
  xdescribe(
    description: string,
    closure: SuiteClosure,
    options?: SuiteParams,
  ): ISuite;
  fdescribe(
    description: string,
    closure: SuiteClosure,
    options?: SuiteParams,
  ): ISuite;
  describeEach(
    description: string,
    table: any[],
    closure: TableClosure,
    options?: SuiteParams,
  ): ISuite;
  xdescribeEach(
    description: string,
    table: any[],
    closure: TableClosure,
    options?: SuiteParams,
  ): ISuite;
  fdescribeEach(
    description: string,
    table: any[],
    closure: TableClosure,
    options?: SuiteParams,
  ): ISuite;
  it(description: string, test?: Effect, options?: SpecOptions): ISpec;
  xit(description: string, test?: Effect, options?: SpecOptions): ISpec;
  fit(description: string, test: Effect, options?: SpecOptions): ISpec;
  beforeAll(hook: Effect): IHook;
  beforeEach(hook: Effect): IHook;
  afterAll(hook: Effect): IHook;
  afterEach(hook: Effect): IHook;
  info(info: any): ISuite;
  prefixed(description: string): string;
  reports(
    sort?: Sorter,
    predicate?: JobPredicate,
  ): AsyncIterableIterator<Report>;
  run(
    sort?: Sorter,
    predicate?: JobPredicate,
  ): AsyncIterableIterator<Plan | Report | Summary>;
  open(): AsyncIterableIterator<Report>;
  close(): AsyncIterableIterator<Report>;
  runSpec(spec: ISpec): AsyncIterableIterator<Report>;
  runHook(hook: IHook, context: ISpec | ISuite): AsyncIterableIterator<Report>;
  concat(a: ISuite, b: ISuite): ISuite;
}

export interface SpecOptions {
  hook?: Effect;
  focused?: boolean;
  skipped?: boolean;
}

export interface SpecParams {
  hook?: Effect;
  focused?: boolean;
  skipped?: boolean;
  description: string;
  parent?: ISuite;
  timeout?: number;
}

export interface IHook {
  name: HookName;
  effect: Effect;
  meta: SpecMeta;
  parent: ISuite;
  timeout(ms: number): IHook;
  run(): AsyncIterableIterator<Report>;
}

export type HookName =
  | "beforeEach"
  | "afterEach"
  | "beforeAll"
  | "afterAll"
  | "spec";

export interface ISpec extends IHook {
  focused?: boolean;
  skipped?: boolean;
  description: string;
}

export interface SpecMeta {
  timeout?: number;
  infos?: any[];
}

export interface Job {
  spec: ISpec;
  suite: ISuite;
  series: number;
}

export interface Report extends SpecOptions {
  description: string;
  ok?: boolean;
  reason?: any;
  startedAt?: number;
  endedAt?: number;
  elapsed?: number;
  suite?: ISuite;
  [key: string]: any;
}

export interface Plan {
  total: number;
  planned: number;
  userAgent?: string;
}

export interface Summary {
  total: number;
  planned: number;
  completed: number;
  ok: number;
  skipped: number;
  userAgent?: string;
}

export interface CoverageMessage {
  __coverage__: any;
}

export interface EndSignal {
  __end__: boolean;
}

export interface ConsoleMessage {
  console: any;
}

export interface SuiteParams {
  parent?: ISuite;
  skipped?: boolean;
  focused?: boolean;
  listeners?: ListenersParam;
  timeout?: number;
}

export interface ISelection {
  filter?: string;
  grep?: RegExp;
  predicate: JobPredicate;
  partition(total: number, partition: number, partitions: number): JobPredicate;
}

export interface SelectionParams {
  filter?: string;
  grep?: RegExp;
}

export interface Listeners {
  pending: Listener[];
  complete: Listener[];
}

export interface Listener {
  (report: Report, continuation: Effect): void;
}

export interface Hooks {
  beforeAll: IHook[];
  afterAll: IHook[];
  beforeEach: IHook[];
  afterEach: IHook[];
  run(hookName: string): IterableIterator<IHook>;
}

export interface Effect {
  (reason?: any): void;
}

export interface SuiteClosure {
  (suite: ISuite): void;
}

export interface TableClosure {
  (suite: ISuite, table: any[]): void;
}

export interface SpecClosure {
  (): void;
}

export interface HookClosure {
  (): void;
}

export interface JobPredicate {
  (job: Job): boolean;
}

export interface Sorter {
  (array: any[]): any[];
}

export interface ListenersParam {
  pending?: Listener[];
  complete?: Listener[];
}

export interface Range {
  start: number;
  end: number;
}

export interface RunGenerator {
  (
    suites: ISuite | ISuite[],
    sort?: Sorter,
    predicate?: JobPredicate,
  ): AsyncIterableIterator<any>;
}

export interface RunParams {
  generate?: RunGenerator;
  sort?: Sorter;
  predicate?: JobPredicate;
  perform?(any): any;
}

export interface DslParams {
  code: string;
  description?: string;
  helpers?: DslHelpers;
  listeners?: ListenersParam;
}

export interface DslHelpers {
  [key: string]: any;
}

export interface DslThunk {
  (
    describe: DslDescribeBlock,
    xdescribe: DslDescribeBlock,
    fdescribe: DslDescribeBlock,
    describeEach: DslDescribeEachBlock,
    xdescribeEach: DslDescribeEachBlock,
    fdescribeEach: DslDescribeEachBlock,
    it: DslItBlock,
    xit: DslItBlock,
    fit: DslItBlock,
    beforeAll: DslHookBlock,
    afterAll: DslHookBlock,
    beforeEach: DslHookBlock,
    afterEach: DslHookBlock,
    info: DslInfoBlock,
  ): void;
}

export interface DslSuiteClosure {
  (): void;
}

export interface DslTableClosure {
  (table: any): void;
}

export interface DslDescribeBlock {
  (description: string, closure: DslSuiteClosure): ISuite;
  skip?: DslDescribeBlock;
  only?: DslDescribeBlock;
  each?: DslDescribeEachBlock;
}

export interface DslDescribeEachBlock {
  (description: string, table: any, closure: DslTableClosure): ISuite;
  skip?: DslDescribeEachBlock;
  only?: DslDescribeEachBlock;
}

export interface DslItBlock {
  (description: string, closure: SpecClosure): ISpec;
  skip?: DslItBlock;
  only?: DslItBlock;
}

export interface DslHookBlock {
  (closure: HookClosure): Promise<any> | void;
}

export interface DslInfoBlock {
  (...rest: any[]): void;
}
