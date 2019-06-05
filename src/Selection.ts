import {
  Selection as SelectionInterface,
  SelectionParams,
  JobPredicate,
  Job,
} from "./interfaces";
import { partitionRangeForTotal } from "./partititionRangeForTotal";

const { assign } = Object;

export class Selection implements SelectionInterface {
  grep: RegExp;

  filter: string;

  constructor(options?: SelectionParams) {
    assign(this, options);
    if (typeof this.grep === "string") {
      this.grep = new RegExp(this.grep); // no escaping
    }
  }

  predicate: JobPredicate = ({ suite, spec }: Job) => {
    const candidate = suite.prefixed(spec.description);

    if (this.grep != null && !this.grep.test(candidate)) {
      return false;
    }
    if (this.filter != null && !candidate.includes(this.filter)) {
      return false;
    }
    return true;
  };

  partition(
    total: number,
    partition: number,
    partitions: number,
  ): JobPredicate {
    if (partition >= partitions) {
      throw new RangeError("partition must be less than partitions");
    }
    const { start, end } = partitionRangeForTotal(total, partition, partitions);

    return job => {
      const { series: current } = job;

      if (current < start || current >= end) {
        return false;
      }
      return this.predicate(job);
    };
  }
}
