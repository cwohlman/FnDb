import { LocalAppendable, LocalRedactable, PartialKey } from "./Interfaces.ts";

import LocalCollection from "./LocalCollection.ts";
import { keyMatch } from "./utils.ts";

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

  redact(key: PartialKey<[number]>): number {
    const keys = this.keys();

    let didRemove = 0;
    keys.forEach((entryKey) => {
      if (keyMatch(key, entryKey.slice(0, key.length))) {
        const index = this.underlying.findIndex(([k]) => k == entryKey);
        this.underlying.splice(index, 1);
        didRemove++;
      }
    });

    return didRemove;
  }
  append(value: Value): number {
    const index = this.underlying.length;
    this.underlying.push([[index], value]);
    return index;
  }
}
