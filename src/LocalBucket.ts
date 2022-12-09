import {
  LocalMutable,
  LocalRedactable,
  CollectionKey,
  PartialKey,
} from "./Interfaces.ts";
import LocalCollection from "./LocalCollection.ts";
import { keyMatch } from "./utils.ts";

export default class LocalBucket<Key extends CollectionKey, Value>
  extends LocalCollection<Key, Value>
  implements LocalMutable<Key, Value>, LocalRedactable<Key>
{
  redact(key: PartialKey<Key>): number {
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

  put(key: Key, value: Value): true {
    const index = this.underlying.findIndex(([entryKey]) =>
      keyMatch(key, entryKey)
    );
    if (index == -1) {
      this.underlying.push([key, value]);
      return true;
    }

    this.underlying[index] = [key, value];
    return true;
  }
}
