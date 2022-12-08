import { LocalAppendable, LocalRedactable } from "./Interfaces.ts";

import LocalCollection from "./LocalCollection.ts";

export default class LocalStream<Value>
  extends LocalCollection<[number], Value>
  implements LocalAppendable<Value>, LocalRedactable<[number]>
{
  redact(key: [number] | []): true {
    throw new Error("Method not implemented.");
  }
  append(value: Value): number {
    throw new Error("Method not implemented.");
  }
}
