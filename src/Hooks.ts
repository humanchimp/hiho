import { Hooks as HooksInterface, Effect, Hook } from "./interfaces";

export class Hooks implements HooksInterface {
  beforeAll: Effect[] = [];

  afterAll: Effect[] = [];

  beforeEach: Effect[] = [];

  afterEach: Effect[] = [];

  *run(hookName: string): IterableIterator<Hook> {
    for (const effect of this[hookName]) {
      yield {
        name: hookName,
        effect,
      };
    }
  }
}
