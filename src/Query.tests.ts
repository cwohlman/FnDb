import { assertEquals } from "../deps.ts";

import { collections, buckets, streams } from "./Collection.tests.ts";

import { filter, map, reduce, reduceGroups, take } from "./Query.ts";
import { load, unwrap } from "./utils.ts";

collections.concat(buckets).forEach(([name, factory]) => {
  Deno.test({
    name: `${name} - Queries - map`,
    fn: async () => {
      const collection = factory(
        [
          [["a", 1], "a1"],
          [["a", 2], "a2"],
          [["a", 3], "a3"],
        ],
        2
      );

      const appendNew = map(collection, (a) => a + "-new");
      assertEquals((await load(appendNew)).values(), [
        "a1-new",
        "a2-new",
        "a3-new",
      ]);

      const returnKeys = map(collection, (_a, key) => key);
      assertEquals((await load(returnKeys)).values(), [
        ["a", 1],
        ["a", 2],
        ["a", 3],
      ]);
    },
  });
  Deno.test({
    name: `${name} - Queries - filter`,
    fn: async () => {
      const collection = factory(
        [
          [["a", 1], "a1"],
          [["a", 2], "a2"],
          [["a", 3], "a3"],
        ],
        2
      );

      const appendNew = filter(collection, (a) => /1/.test(a));
      assertEquals((await load(appendNew)).values(), ["a1"]);

      const returnKeys = filter(collection, (_a, key) => key[1] == 2);
      assertEquals((await load(returnKeys)).values(), ["a2"]);
    },
  });
  Deno.test({
    name: `${name} - Queries - take`,
    fn: async () => {
      const collection = factory(
        [
          [["a", 1], "a1"],
          [["a", 2], "a2"],
          [["a", 3], "a3"],
        ],
        2
      );

      const appendNew = take(collection, 1);
      assertEquals((await load(appendNew)).values(), ["a1"]);

      const returnKeys = take(collection, 1, 1);
      assertEquals((await load(returnKeys)).values(), ["a2"]);
    },
  });
  Deno.test({
    name: `${name} - Queries - reduce`,
    fn: async () => {
      const collection = factory(
        [
          [["a", 1], 1],
          [["a", 2], 2],
          [["a", 3], 3],
        ],
        2
      );

      const appendNew = reduce(collection, (a, memo) => memo + a, 0);
      assertEquals(await unwrap(appendNew), 6);
    },
  });
  Deno.test({
    name: `${name} - Queries - reduceGroups`,
    fn: async () => {
      const collection = factory(
        [
          [["a", 1], 1],
          [["a", 2], 2],
          [["a", 3], 3],
        ],
        2
      );

      const appendNew = reduceGroups(collection, (a, memo) => memo + a, 0, 1);
      const local = await load(appendNew);

      assertEquals(local.get("a"), 6);
    },
  });
});

streams.forEach(([name, factory]) => {
  Deno.test({
    name: `${name} - Queries - map`,
    fn: async () => {
      const collection = factory(["a1", "a2", "a3"]);

      const appendNew = map(collection, (a) => a + "-new");
      assertEquals((await load(appendNew)).values(), [
        "a1-new",
        "a2-new",
        "a3-new",
      ]);

      const returnKeys = map(collection, (_a, key) => key);
      assertEquals((await load(returnKeys)).values(), [[0], [1], [2]]);
    },
  });
  Deno.test({
    name: `${name} - Queries - filter`,
    fn: async () => {
      const collection = factory(["a1", "a2", "a3"]);

      const appendNew = filter(collection, (a) => /1/.test(a));
      assertEquals((await load(appendNew)).values(), ["a1"]);

      const returnKeys = filter(collection, (_a, key) => key[0] == 1);
      assertEquals((await load(returnKeys)).values(), ["a2"]);
    },
  });
  Deno.test({
    name: `${name} - Queries - take`,
    fn: async () => {
      const collection = factory(["a1", "a2", "a3"]);

      const appendNew = take(collection, 1);
      assertEquals((await load(appendNew)).values(), ["a1"]);

      const returnKeys = take(collection, 1, 1);
      assertEquals((await load(returnKeys)).values(), ["a2"]);
    },
  });
  Deno.test({
    name: `${name} - Queries - reduce`,
    fn: async () => {
      const collection = factory([1, 2, 3]);

      const appendNew = reduce(collection, (a, m) => a + m, 0);
      assertEquals(await unwrap(appendNew), 6);
    },
  });
});
