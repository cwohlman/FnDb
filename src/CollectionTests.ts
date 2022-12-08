import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { Stream, Iterable, CollectionKey } from "./Interfaces.ts";
import LocalCollection from "./LocalCollection.ts";

import LocalStream from "./LocalStream.ts";
import { load, unwrap } from "./utils.ts";

const streams: [string, <T>(values: T[]) => Stream<T>][] = [
  ["LocalStream", <T>(values: T[]) => new LocalStream<T>(values)],
];

const collections: [
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

collections.forEach(([name, factory]) => {
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

  // collections.forEach(([innerName, innerFactory]) => {

  // })
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
