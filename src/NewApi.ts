import { ControlMessage } from "./Tree.ts";

export interface Walkable<Key, Value> {
  walk(fn: (key: Key, value: Value) => ControlMessage): void;
}
export interface RemoteWalkable<Key, Value, AllowedArgs extends any[]> {
  walk<Args extends AllowedArgs>(
    fn: (key: Key, value: Value, ...args: Args) => Promise<ControlMessage>,
    ...args: Args
  ): Promise<void>;
}
export interface Queryable<Key, Value, Api> extends Walkable<Key, Value> {
  query<OutKey, OutValue>(
    fn: (key: Key, value: Value, api: Api) => ControlMessage
  ): Queryable<OutKey, OutValue, Api>;
}
export interface RemoteQueryable<Key, Value, Api, AllowedArgs extends any[]>
  extends RemoteWalkable<Key, Value, AllowedArgs> {
  query<OutKey, OutValue, Args extends AllowedArgs>(
    fn: (
      key: Key,
      value: Value,
      api: Api,
      ...args: Args
    ) => Promise<ControlMessage>,
    ...args: Args
  ): Queryable<OutKey, OutValue, Api>;
}

export class Collection<Key extends string[], Value>
  implements Queryable<Key, Value, Collection<any, any>>
{
  constructor(private underlying: [Key, Value][] = []) {}

  query<OutKey extends string[], OutValue, Args extends Scalar[]>(
    walker: Walker<Key, Value, OutKey, OutValue>
  ): Queryable<[...OutKey, ...Key], OutValue> {
    const result = new Collection<[...OutKey, ...Key], OutValue>();

    this.walk((key, value) =>
      walker(key, value, {
        push: (outKey, value) => result.push([...outKey, ...key], value),
        get: (key) => result.get(key),
        keys: (key, before) => result.keys(key, before),
      })
    );

    return result;
  }
  push(key: Key, value: Value) {
    this.underlying.push([key, value]);
  }
  get(key: Key): Value | undefined {
    const result = this.underlying.find(([entryKey]) =>
      keyMatch(key, entryKey)
    );

    if (result) return result[1];

    return undefined;
  }
  keys(prefix: Scalar[], before: Scalar[] = []): Key[] {
    return this.underlying
      .map(([key]) => key)
      .filter(
        (key) =>
          keyMatch(prefix, key.slice(0, prefix.length)) &&
          keyAtOrBefore(key, before)
      );
  }
  walk(fn: (key: Key, value: Value) => ControlMessage): void {
    for (const [key, value] of this.underlying) {
      const control = fn(key, value);

      if (control == "break") break;
    }
  }

  static from<Key extends Scalar[], Value>(collection: Queryable<Key, Value>) {
    const pairs: [Key, Value][] = [];

    collection.walk((key, value) => {
      pairs.push([key, value]);
    });

    return new Collection(pairs);
  }
}
