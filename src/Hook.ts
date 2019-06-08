import { Effect, IHook, Report, ISuite, HookName, SpecMeta } from "./interfaces"

export class Hook implements IHook {
  parent: ISuite;

  effect: Effect;

  name: HookName;

  meta: SpecMeta = {};

  constructor(name: HookName, parent: ISuite, effect: Effect) {
    this.name = name;
    this.parent = parent;
    this.effect = effect;
    Object.defineProperty(this, "parent", {
      get(): ISuite {
        return parent;
      },
    });
  }

  timeout(ms: number): IHook {
    this.meta.timeout = ms;
    return this;
  }

  info(info: any) {
    if (this.meta.infos == null) {
      this.meta.infos = [];
    }
    this.meta.infos.push(info);
    return this;
  }

  async *run(): AsyncIterableIterator<Report> {
    return this.parent.runHook(this, this.parent);
  }
}
