import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { Collection } from "./Collection.ts";

Deno.test("Collection - get - returns the item", () => {
  const collection = new Collection<[string], string>(new Map([["a", "a"]]), 1);

  assertEquals(collection.get("a"), "a");
});


Deno.test("Collection - iter - iterates over every item", () => {
  const collection = new Collection<[string], string>(new Map([["a", "a"], ["b", "b"]]), 1);
  const results: string[] = [];

  collection.iter((_, value) => {results.push(value)}, undefined);

  assertEquals(results, ["a", "b"]);
});