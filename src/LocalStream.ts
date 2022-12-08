import { LocalAppendable, LocalRedactable } from "./Interfaces.ts";

import LocalCollection from "./LocalCollection.ts";

export default class LocalStream<Value>
  extends LocalCollection<[number], Value>
  implements LocalAppendable<Value>, LocalRedactable<[number]>
{
  constructor(initialValues: Value[] = []) {
    super(
      initialValues.map((a, i) => [[i], a]),
      1
    );
  }

  redact(key: [number] | []): true {
    throw new Error("Method not implemented.");
  }
  append(value: Value): number {
    const index = this.underlying.length;
    this.underlying.push([[index], value]);
    return index;
  }
}
