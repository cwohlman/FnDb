import { CollectionKey, Scalar } from "./Interfaces.ts";

interface Walkable<Key extends Scalar[], Value> {
  walk<Args extends any[]>(
    fn: (key: Key, value: Value, ...args: Args) => void,
    ...args: Args
  ): void;
}

function map<Key extends CollectionKey, Input, Output>(
  source: Walkable<Key, Input>,
  mapper: (a: Input) => Output
): Walkable<Key, Output> {
  return {
    walk<Args extends any[]>(
      fn: (key: Key, value: Output, ...args: Args) => void,
      ...args: Args
    ): void {
      source.walk(
        (key, value, mapper, fn) => {
          fn(key, mapper(value), ...args);
        },
        mapper,
        fn
      );
    },
  };
}
