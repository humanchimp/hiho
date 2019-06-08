import {
  ISuite,
  SuiteParams,
  SuiteClosure,
  ISpec,
  Job,
  Effect,
  Report,
  Plan,
  Summary,
  Hooks as HooksInterface,
  Listeners as ListenersInterface,
  TableClosure,
  JobPredicate,
  Sorter,
  IHook,
  SpecOptions,
  SpecParams,
  SpecMeta,
} from "./interfaces";
import { Spec } from "./Spec";
import { Hooks } from "./Hooks";
import { Listeners } from "./Listeners";
import { shuffle } from "./shuffle";
import { required } from "./required";
import { wrapTestCase } from "./wrapTestCase";
import { Hook } from "./Hook";

const { assign } = Object;

interface ComputedHooks {
  beforeEach: IHook[];

  afterEach: IHook[];
}

export class Suite implements ISuite {
  static empty = empty;

  static from = from;

  static of = of;

  static reducer = reducer;

  description: string;

  skipped: boolean;

  focused: boolean;

  suites: ISuite[] = [];

  parent?: ISuite;

  specs: ISpec[] = [];

  hooks: HooksInterface = new Hooks();

  listeners: ListenersInterface;

  meta: SpecMeta = {};

  private focusMode: boolean = false;

  private opened: boolean = false;

  private computedHooks: ComputedHooks;

  constructor(
    description: string = required(),
    {
      parent = undefined,
      skipped = false,
      focused = false,
      listeners = undefined,
    }: SuiteParams = {},
  ) {
    this.description = description;
    this.parent = parent;
    this.skipped = skipped;
    this.focused = focused;
    this.listeners = new Listeners(listeners);
  }

  get isFocusMode() {
    return this.focusMode;
  }

  set isFocusMode(value) {
    this.focusMode = value;
    if (value) {
      for (const suite of this.suites) {
        suite.isFocusMode = true;
      }
    }
  }

  get isDeeplyFocused() {
    if (this.specs.some(spec => spec.focused)) {
      return true;
    }
    return this.suites.some(suite => suite.focused || suite.isDeeplyFocused);
  }

  timeout(ms: number): ISuite {
    this.meta.timeout = ms;
    return this;
  }

  info(info: any): ISuite {
    if (this.meta.infos == null) {
      this.meta.infos = [];
    }
    this.meta.infos.push(info);
    return this;
  }

  beforeAll(effect: Effect = required()): IHook {
    const hook = new Hook("beforeAll", this, effect);

    this.hooks.beforeAll.push(hook);
    return hook;
  }

  afterAll(effect: Effect = required()): IHook {
    const hook = new Hook("afterAll", this, effect);

    this.hooks.afterAll.unshift(hook);
    return hook;
  }

  beforeEach(effect: Effect = required()): IHook {
    const hook = new Hook("beforeEach", this, effect);

    this.hooks.beforeEach.push(hook);
    return hook;
  }

  afterEach(effect: Effect = required()): IHook {
    const hook = new Hook("afterEach", this, effect);

    this.hooks.afterEach.unshift(hook);
    return hook;
  }

  it(
    description: string = required(),
    test?: Effect,
    options?: SpecOptions,
  ): ISpec {
    const params: SpecParams = {
      parent: this,
      skipped: test == null || this.skipped,
      focused: this.focused,
      ...options,
      description,
      hook: wrapTestCase(test),
    };
    if (params.focused) {
      this.isFocusMode = true;
    }

    const spec = new Spec(params);

    this.specs.push(spec);
    return spec;
  }

  fit(
    description: string,
    test: Effect = required(),
    options?: SpecOptions,
  ): ISpec {
    return this.it(description, test, { ...options, focused: true });
  }

  xit(
    description: string = required(),
    test?: Effect,
    options?: SpecOptions,
  ): ISpec {
    return this.it(description, test, { ...options, skipped: true });
  }

  defaultOptions(options?: SuiteParams): SuiteParams {
    return {
      ...options,
      ...(this.skipped && { skipped: true }),
      ...(this.focused && { focused: true }),
    };
  }

  describe(
    description: string,
    closure: SuiteClosure = required(),
    options?: SuiteParams,
  ): ISuite {
    const suite = new Suite(description, {
      ...this.defaultOptions(options),
      ...(this.listeners && { listeners: this.listeners }),
      parent: this,
    });

    closure(suite);
    this.suites.push(suite);
    return suite;
  }

  fdescribe(
    description: string,
    closure: SuiteClosure,
    options?: SuiteParams,
  ): ISuite {
    return this.describe(description, closure, { ...options, focused: true });
  }

  xdescribe(
    description: string,
    closure: SuiteClosure,
    options?: SuiteParams,
  ): ISuite {
    return this.describe(description, closure, { ...options, skipped: true });
  }

  describeEach(
    description: string,
    table: any[],
    closure: TableClosure = required(),
    options?: SuiteParams,
  ): ISuite {
    const baseOptions = {
      ...this.defaultOptions(options),
      ...(this.listeners && { listeners: this.listeners }),
    };
    const suite = new Suite(description, {
      ...baseOptions,
      parent: this,
    });

    for (const row of table) {
      suite.describe(
        descriptionForRow(description, row),
        s => closure(s, row),
        {
          ...baseOptions,
        },
      );
    }
    this.suites.push(suite);
    return suite;
  }

  fdescribeEach(
    description: string,
    table: any[],
    closure: TableClosure,
    options?: SuiteParams,
  ): ISuite {
    return this.describeEach(description, table, closure, {
      ...options,
      focused: true,
    });
  }

  xdescribeEach(
    description: string,
    table: any[],
    closure: TableClosure,
    options?: SuiteParams,
  ): ISuite {
    return this.describeEach(description, table, closure, {
      ...options,
      skipped: true,
    });
  }

  *orderedJobs(): IterableIterator<Job> {
    let series = 0;

    for (const spec of this.specs) {
      yield { suite: this, spec, series: series++ };
    }

    for (const suite of this.suites) {
      for (const tuple of suite.orderedJobs()) {
        yield { ...tuple, series: series++ };
      }
    }
  }

  *andParents(): IterableIterator<ISuite> {
    let suite: ISuite = this;

    do {
      yield suite;
    } while ((suite = suite.parent));
  }

  prefixed(description: string): string {
    const segments = [];

    for (const node of this.andParents()) {
      segments.unshift(node.description);
    }
    return [...segments, description].filter(Boolean).join(" ");
  }

  concat(...suites: Suite[]): Suite {
    return Suite.of(this, ...suites);
  }

  async *run(
    sort: Sorter = shuffle,
    predicate: JobPredicate = Boolean,
  ): AsyncIterableIterator<Plan | Report | Summary> {
    const jobs = [...this.orderedJobs()];
    const planned = jobs.filter(predicate);
    const counts = {
      total: jobs.length,
      planned: planned.length,
      completed: 0,
      ok: 0,
      skipped: 0,
    };

    yield {
      total: counts.total,
      planned: counts.planned,
    } as Plan;
    for await (const report of this.reportsForJobs(jobs, sort, predicate)) {
      if (report.ok) {
        counts.ok += 1;
      }
      if (report.skipped) {
        counts.skipped += 1;
      }
      counts.completed += 1;
      yield report;
    }
    yield {
      ...counts,
      failed: counts.completed - counts.ok,
    } as Summary;
  }

  async *reports(
    sort: Sorter = shuffle,
    predicate: JobPredicate = Boolean,
  ): AsyncIterableIterator<Report> {
    yield* this.reportsForJobs([...this.orderedJobs()], sort, predicate);
  }

  private async *reportsForJobs(
    jobs: Job[],
    sort: Sorter,
    predicate: JobPredicate,
  ) {
    const preparedJobs: Job[] = sort(jobs)
      .map((suite, index) => {
        suite.series = index;
        return suite;
      })
      .filter(predicate);
    const counted = this.countSpecsBySuite(preparedJobs);
    const poisoned = new Set();

    for (const { spec, suite } of preparedJobs) {
      const instance = suite as Suite;

      if (!poisoned.has(instance)) {
        try {
          yield* instance.runSpec(spec);
        } catch (_) {
          poisoned.add(instance);
        }
      }
      yield* this.countSpec(counted, suite);
    }
  }

  async *runHook(
    hook: IHook,
    context: ISpec | ISuite,
  ): AsyncIterableIterator<Report> {
    const reason = await runTest(hook.effect, context);

    if (reason != null) {
      yield {
        reason,
        description: `${hook.name}: ${context.description}`,
        ok: false,
      };
      throw reason;
    }
  }

  async *runSpec(spec: ISpec): AsyncIterableIterator<Report> {
    yield* this.open();
    if (!spec.skipped) {
      for (const hook of this.computedHooks.beforeEach) {
        yield* this.runHook(hook, spec);
      }
    }
    yield this.reportForSpec(spec);
    if (!spec.skipped) {
      for (const hook of this.computedHooks.afterEach) {
        yield* this.runHook(hook, spec);
      }
    }
  }

  async *open(): AsyncIterableIterator<Report> {
    if (this.opened) {
      return;
    }
    if (this.parent) {
      yield* this.parent.open();
    }
    for (const hook of this.hooks.run("beforeAll")) {
      yield* this.runHook(hook, this);
    }
    this.opened = true;
    this.computeHooks();
  }

  async *close(): AsyncIterableIterator<Report> {
    if (!this.opened) {
      return;
    }
    for (const hook of this.hooks.run("afterAll")) {
      yield* this.runHook(hook, this);
    }
    this.opened = false;
  }

  private async reportForSpec(spec: ISpec): Promise<Report> {
    const description = this.prefixed(spec.description);
    const { effect, focused, meta } = spec;
    let { skipped } = spec;

    if (skipped || (this.isFocusMode && !focused)) {
      return {
        description,
        ok: true,
        skipped: true,
        ...meta,
      };
    }
    const report: Report = { ...this.defaultOptions(), description };

    if (focused) {
      report.focused = true;
    }

    assign(report, meta);

    for (const notify of this.listeners.pending) {
      notify(report, skip);
    }
    if (!skipped) {
      const reason = await runTest(effect, spec);

      if (reason != null) {
        report.ok = false;
        report.reason = reason;
      } else {
        report.ok = true;
      }
    } else {
      report.skipped = true;
      if (report.ok == null) {
        report.ok = true;
      }
    }
    for (const notify of this.listeners.complete) {
      notify(report, fail);
    }

    return report;

    function skip() {
      skipped = true;
    }

    function fail(reason) {
      if (report.ok) {
        report.ok = false;
        report.reason = reason;
      }
    }
  }

  private computeHooks(): void {
    if (this.computedHooks != null) {
      return;
    }
    const suites = [...this.andParents()];
    const afterEach = suites.flatMap(suite => suite.hooks.afterEach);
    const beforeEach = suites
      .reverse()
      .flatMap(suite => suite.hooks.beforeEach);

    this.computedHooks = { beforeEach, afterEach };
  }

  private countSpecsBySuite(jobs: Job[]): Map<ISuite, number> {
    return jobs.reduce((memo, { suite }: Job) => {
      for (const s of suite.andParents()) {
        inc(memo, s, 1);
      }
      return memo;
    }, new Map<ISuite, number>());
  }

  private async *countSpec(counted: Map<ISuite, number>, suite: ISuite) {
    for (const s of suite.andParents()) {
      if (inc(counted, s, -1) === 0) {
        yield* s.close();
      }
    }
  }
}

async function runTest(test: Effect, context: any) {
  try {
    await test.call(context);
  } catch (reason) {
    return reason;
  }
}

function descriptionForRow(description, table) {
  return `${description} [table]`;
}

function inc(map, key, offset) {
  const [initial = 0] = [map.get(key)];
  const next = initial + offset;

  map.set(key, next);
  return next;
}

export function of(...suites: Suite[]): Suite {
  return Suite.from(suites);
}

export function from(suites: Suite[]): Suite {
  return suites.length === 1
    ? suites[0]
    : suites.reduce((memo, suite) => {
        memo.suites.push(suite);
        suite.parent = memo;
        return memo;
      }, Suite.empty());
}

export function empty(): Suite {
  return new Suite(null);
}

export function reducer(a: Suite, b: Suite): Suite {
  return a.concat(b);
}
