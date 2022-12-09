import {
  BucketKey,
  CollectionKey,
  LocalAppendable,
  LocalRedactable,
  Scalar,
} from "./Interfaces.ts";

import LocalCollection from "./LocalCollection.ts";
import { keyMatch } from "./utils.ts";

export default class LocalStreamBucket<
    Key extends [...CollectionKey, number],
    Value
  >
  extends LocalCollection<Key, Value>
  implements LocalAppendable<Value, Key>, LocalRedactable<[Key]>
{
  redact(key: Scalar[]): number {
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
  append(value: Value, key: BucketKey<Key>): number {
    const count = this.count(...key);

    this.underlying.push([[...key, count] as any, value]);

    return count;
  }
}
