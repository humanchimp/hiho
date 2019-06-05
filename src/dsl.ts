import { DslParams, Suite } from "./interfaces";
import { blocks as names } from "./names";
import { dethunk } from "./dethunk";

const { keys, values } = Object;

export async function dsl({
  code,
  helpers = Object.create(null),
  /*description = null,*/
  listeners = {},
}: DslParams): Promise<Suite> {
  return dethunk(
    (...blocks) =>
      new Function(...names, ...keys(helpers), code)(
        ...blocks,
        ...values(helpers),
      ),
    {
      listeners,
    },
  );
}
