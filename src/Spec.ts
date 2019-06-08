import {
  ISpec,
  SpecMeta,
  SpecParams,
  ISuite,
  Report,
} from "./interfaces";
import { Hook } from "./Hook";

export class Spec extends Hook implements ISpec {
  description: string;

  focused: boolean;

  skipped: boolean;

  meta: SpecMeta = {};

  parent: ISuite;

  constructor({
    description,
    parent,
    hook,
    focused = false,
    skipped = false,
  }: SpecParams) {
    super("spec", parent, hook);
    this.description = description;
    this.focused = focused;
    this.skipped = skipped;
  }

  run(): AsyncIterableIterator<Report> {
    return this.parent.runSpec(this);
  }
}
