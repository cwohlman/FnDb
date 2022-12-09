import { Scalar } from "./Interfaces.ts";
import { keyAtOrBefore, keyMatch } from "./utils.ts";

// TODO: args
// TODO: async

export interface Queryable<Key extends Scalar[], Value> {
  /****  These functions return queryables  ****/

  /**
   * Returns a new queryable using the specified walker
   * @param walker A function which generates mapped keys and values from the source keys and values
   */
  query<OutKey extends Scalar[], OutValue>(
    walker: Walker<Key, Value, OutKey, OutValue>,
    keyLength: OutKey["length"]
  ): Queryable<[...OutKey, ...Key], OutValue>;

  /****  These functions return data  ****/

  /**
   * Returns the value with the specified key
   */
  get(key: Key): Value | undefined;
  /**
   * Returns the most recent key which matches the specified prefix
   */
  keys(prefix: Scalar[], before?: Scalar[]): Key[];
  /**
   * Walks the collection without collecting results
   * @param fn A function which walks the collection
   */
  walk(fn: (key: Key, value: Value) => ControlMessage): void;
}

export type Walker<
  Key extends Scalar[],
  Value,
  OutKey extends Scalar[],
  OutValue
> = (
  key: Key,
  value: Value,
  collector: {
    push: (key: OutKey, value: OutValue) => void;
    /**
     * Key must preceed the currently processed item
     */
    get: (key: [...OutKey, ...Key]) => OutValue | undefined;
    /**
     * Returns the most recent key which matches the specified prefix
     */
    keys: (
      prefix: Scalar[],
      before?: Scalar[] | undefined
    ) => [...OutKey, ...Key][];
  }
) => ControlMessage;

export type ControlMessage = void | "break";

export class Collection<Key extends Scalar[], Value>
  implements Queryable<Key, Value>
{
  constructor(private underlying: [Key, Value][] = []) {}

  query<OutKey extends Scalar[], OutValue, Args extends Scalar[]>(
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

// TODO:
// export class Lazy<SourceKey extends Scalar[], Key extends Scalar[], Value>
//   implements Queryable<Key, Value>
// {
//   private constructor(
//     private source: Queryable<SourceKey, any> | undefined,
//     private pipeline: {
//       walker: Walker<any, any, any, any>;
//       keyLength: number;
//     }[],
//     private keyLength: SourceKey["length"]
//   ) {}

//   query<OutKey extends Scalar[], OutValue, Args extends Scalar[]>(
//     walker: Walker<Key, Value, OutKey, OutValue>,
//     keyLength: OutKey["length"]
//   ): Queryable<[...OutKey, ...Key], OutValue> {
//     return new Lazy<SourceKey, [...OutKey, ...Key], OutValue>(
//       this.source,
//       this.pipeline.concat({ walker, keyLength }),
//       this.keyLength
//     );
//   }
//   get(key: Key): Value | undefined {
//     // how to figure out the correct key length?
//     throw new Error("Not implemented");
//   }
//   keys(prefix: Scalar[], before: Scalar[] = []): Key[] {
//     throw new Error("Not implemented");
//   }
//   walk(fn: (key: Key, value: Value) => ControlMessage): void {
//     this.source?.walk((key, value) => {

//     })

//     function walk(value, stage, pipeline, out) {
//       stage(value, {})
//     }
//   }

//   to(factory: { from: Queryable<Key, Value> }) {
//     return factory.from(this);
//   }
// }
