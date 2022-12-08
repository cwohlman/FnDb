import { Underlying } from "./Underlying.ts";

export class Collection<TKey extends (string | number)[], TValue> {
  constructor(
    underlying: Underlying<TKey, TValue>,
    protected keyLength: TKey["length"]
  ) {
    if (keyLength == 0) this.value = underlying as any;
    else this.underlying = underlying as any;
  }

  protected underlying: Map<any, any> = null as any;
  protected value: TValue | null = null;

  get(...key: TKey): TValue | null {
    this.ensureLength(key);

    if (this.keyLength == 0) return this.value;

    let prefix = key.slice(0, -1);
    let last = key.slice(-1)[0];
    let underlying = this.underlying;
    for (let part of prefix) {
      if (!underlying.has(part)) underlying.set(part, new Map());
      underlying = underlying.get(part);
    }

    return underlying.get(last);
  }

  iter<T>(
    iter: (
      key: TKey,
      value: TValue,
      memo: T
    ) => void | null | undefined | "break",
    memo: T
  ): T {
    if (this.keyLength == 0) {
      iter([] as any, this.value as any, memo);
    } else {
      this.walk([], this.underlying, (key, value) => iter(key, value, memo));
    }

    return memo;
  }

  walk(
    leftKey: (string | number)[],
    underlying: Map<string | number, Map<any, any> | TValue>,
    iter: (key: TKey, value: TValue) => void | undefined | null | "break"
  ): null | "break" {
    for (let pair of underlying.entries()) {
      const [rightKey, value] = pair;
      const key = [...leftKey, rightKey];

      if (key.length == this.keyLength) {
        const result = iter(key as any, value as TValue);
        if (result == "break") return result;
      } else {
        const result = this.walk(key, value as Map<any, any>, iter);
        if (result == "break") return result;
      }
    }

    return null;
  }

  protected ensureLength(key: TKey) {
    if (this.keyLength != key.length) {
      throw new Error("Invalid key length");
    }
  }
}
