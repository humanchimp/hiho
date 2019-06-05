import {
  Spec as SpecInterface,
  SpecMeta,
  Effect,
  SpecParams,
  Suite,
  Report,
} from "./interfaces";

export class Spec implements SpecInterface {
  description: string;

  test: Effect;

  focused: boolean;

  skipped: boolean;

  meta: SpecMeta = {};

  parent: Suite;

  constructor({
    description,
    parent,
    test,
    focused = false,
    skipped = false,
  }: SpecParams) {
    this.description = description;
    this.test = test;
    this.focused = focused;
    this.skipped = skipped;
    Object.defineProperty(this, "parent", {
      get() {
        return parent;
      },
    });
  }

  timeout(ms: number): Spec {
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

  run(): AsyncIterableIterator<Report> {
    return this.parent.runSpec(this);
  }
}
