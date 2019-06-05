type ThunkResult = Promise<any> | void;

interface Rescuer {
  (reason: any): void;
}

interface DoneCallback {
  (reason?: any): void;
}

interface Thunk {
  (done?: DoneCallback): ThunkResult;
}

interface TableThunk {
  (row: any): ThunkResult;
}

interface DslHook {
  (hook: Thunk): void;
}

interface DslSuite {
  (description: string, closure: Thunk): Suite;
}

interface DslTableSuite {
  (description: string, table: any[], closure: TableThunk): Suite;
}

interface Spec {
  timeout(ms: number): Spec;
  info(info: any): Spec;
}

interface Suite {
  info(info: any): Suite;
}

interface DslSpec {
  (description: string, closure?: Thunk): Spec;
}

interface DslInfo {
  (content: any): void;
}

declare var beforeAll: DslHook;
declare var beforeEach: DslHook;
declare var afterAll: DslHook;
declare var afterEach: DslHook;
declare var describe: DslSuite;
declare var xdescribe: DslSuite;
declare var fdescribe: DslSuite;
declare var describeEach: DslTableSuite;
declare var xdescribeEach: DslTableSuite;
declare var fdescribeEach: DslTableSuite;
declare var it: DslSpec;
declare var xit: DslSpec;
declare var fit: DslSpec;
declare var info: DslInfo;
