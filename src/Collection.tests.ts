import { assertEquals } from "../deps.ts";
import { Stream, Iterable, CollectionKey, Bucket } from "./Interfaces.ts";
import LocalBucket from "./LocalBucket.ts";
import LocalCollection from "./LocalCollection.ts";

import LocalStream from "./LocalStream.ts";
import { load, unwrap } from "./utils.ts";

export const streams: [string, <T>(values: T[]) => Stream<T>][] = [
  ["LocalStream", <T>(values: T[]) => new LocalStream<T>(values)],
];

export const collections: [
  string,
  <Key extends CollectionKey, Value>(
    pairs: [Key, Value][],
    keySize: Key["length"]
  ) => Iterable<Key, Value>
][] = [
  [
    "LocalCollection",
    <Key extends CollectionKey, Value>(
      pairs: [Key, Value][],
      keySize: Key["length"]
    ) => new LocalCollection<Key, Value>(pairs, keySize),
  ],
];

export const buckets: [
  string,
  <Key extends CollectionKey, Value>(
    pairs: [Key, Value][],
    keySize: Key["length"]
  ) => Bucket<Key, Value>
][] = [
  [
    "LocalBucket",
    <Key extends CollectionKey, Value>(
      pairs: [Key, Value][],
      keySize: Key["length"]
    ) => new LocalBucket<Key, Value>(pairs, keySize),
  ],
];

collections.concat(buckets).forEach(([name, factory]) => {
  Deno.test({
    name: `${name} - Standard Collection Ops`,
    fn: async () => {
      const input = ["a", "b", "c", "A", "B", "C"];
      const subject = factory<[number], string>(
        input.map((a, i) => [[i], a]),
        1
      );

      const upperCase = await unwrap(
        subject.iter((_key, value, memo) => {
          if (value.toLocaleUpperCase() == value) memo.push(value);
        }, [] as string[])
      );
      assertEquals(upperCase, ["A", "B", "C"]);

      const slice = (await load(subject.slice([0], [1]))).values();
      assertEquals(slice, input.slice(0, 1));

      const local = await load(subject);

      const first = local.get(0);
      assertEquals(first, input[0]);

      const last = local.get(5);
      assertEquals(last, input[5]);

      const values = local.values();
      assertEquals(values, input);

      const keys = local.keys();
      assertEquals(
        keys,
        Object.keys(input).map((a) => [+a])
      );

      const pairs = local.pairs();
      assertEquals(
        pairs,
        Object.keys(input).map((a) => [[+a], input[+a]])
      );
    },
  });

  // collections.forEach(([innerName, innerFactory]) => {

  // })
  streams.forEach(([innerName, innerFactory]) => {
    Deno.test({
      name: `${name} - Collect Values - ${innerName}`,
      fn: async () => {
        const collection = factory<[string], string>(
          [
            [["hello"], "world"],
            [["foo"], "bar"],
            [["fiz"], "buz"],
          ],
          1
        );
        const memo = innerFactory<string>([]);

        const values = await load(
          collection.iter((_key, value, memo) => {
            memo.append(value);
          }, memo)
        );

        assertEquals(values.values(), ["world", "bar", "buz"]);
      },
    });
  });
});

buckets.forEach(([name, factory]) => {
  Deno.test({
    name: `${name} - Mutate and Redact`,
    fn: async () => {
      const subject = factory<[string, string], string>(
        [
          [["a", "a"], "aa"],
          [["a", "b"], "ab"],
          [["b", "a"], "ba"],
          [["b", "b"], "bb"],
        ],
        2
      );

      const local = await load(subject);
      assertEquals(local.get("a", "a"), "aa");

      await subject.put(["a", "a"], "aa-new");
      const mutatedLocal = await load(subject);
      assertEquals(mutatedLocal.get("a", "a"), "aa-new");

      await subject.redact(["b", "b"]);
      const redactedLocal = await load(subject);
      assertEquals(redactedLocal.get("b", "b"), undefined);
    },
  });
});

streams.forEach(([name, factory]) => {
  Deno.test({
    name: `${name} - Standard Collection Ops`,
    fn: async () => {
      const input = ["a", "b", "c", "A", "B", "C"];
      const subject = factory<string>(input);

      const upperCase = await unwrap(
        subject.iter((_key, value, memo) => {
          if (value.toLocaleUpperCase() == value) memo.push(value);
        }, [] as string[])
      );
      assertEquals(upperCase, ["A", "B", "C"]);

      const slice = (await load(subject.slice([0], [1]))).values();
      assertEquals(slice, input.slice(0, 1));

      const local = await load(subject);

      const first = local.get(0);
      assertEquals(first, input[0]);

      const last = local.get(5);
      assertEquals(last, input[5]);

      const values = local.values();
      assertEquals(values, input);

      const keys = local.keys();
      assertEquals(
        keys,
        Object.keys(input).map((a) => [+a])
      );

      const pairs = local.pairs();
      assertEquals(
        pairs,
        Object.keys(input).map((a) => [[+a], input[+a]])
      );
    },
  });

  Deno.test({
    name: `${name} - Append and Redact`,
    fn: async () => {
      const input = ["a", "b", "c", "A", "B", "C"];
      const subject = factory<string>(input);

      await subject.append("foo");
      const local = await load(subject);
      assertEquals(local.get(6), "foo");

      await subject.redact([0]);
      const redactedLocal = await load(subject);
      assertEquals(redactedLocal.get(0), undefined);
    },
  });

  streams.forEach(([innerName, innerFactory]) => {
    Deno.test({
      name: `${name} - Collect Values - ${innerName}`,
      fn: async () => {
        const collection = factory<string>(["world", "bar", "buz"]);
        const memo = innerFactory<string>([]);

        const values = await load(
          collection.iter((_key, value, memo) => {
            memo.append(value);
          }, memo)
        );

        assertEquals(values.values(), ["world", "bar", "buz"]);
      },
    });
  });
});
