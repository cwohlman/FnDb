import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";

import { Bucket, Iterable } from "./Interfaces.ts";
import { unwrap, load } from "./utils.ts";

export async function listOfStrings(
  factory: (input: string[]) => Iterable<[number], string>
) {
  const input = ["a", "b", "c", "A", "B", "C"];
  const subject = factory(input);

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

  // TODO
  // const map = local.map();
  // assertEquals(map, new Map(input.map((value, key) => [key, value])));
}

// Test Matrix: Bucket | Stream
//      Bucket
//      ------
//      Stream

// export async function bucket(
//   factory: <Key extends CollectionKey, Value>() => Bucket<Key, Value>
// ) {

// }
