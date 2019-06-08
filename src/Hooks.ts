import { Hooks as HooksInterface, IHook, HookName } from "./interfaces";

export class Hooks implements HooksInterface {
  beforeAll: IHook[] = [];

  afterAll: IHook[] = [];

  beforeEach: IHook[] = [];

  afterEach: IHook[] = [];

  *run(hookName: HookName): IterableIterator<IHook> {
    for (const hook of this[hookName]) {
      yield hook as IHook;
    }
  }
}
