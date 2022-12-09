import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { collections, buckets, streams } from "./Collection.tests.ts";

import { map } from "./Query.ts";
import { load } from "./utils.ts";

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
});
