import { listOfStrings } from "./Contracts.ts";
import LocalCollection from "./LocalCollection.ts";

Deno.test({
  name: "LocalCollection - list of strings",
  fn: () => {
    listOfStrings(
      (pairs) =>
        new LocalCollection(
          pairs.map((a, i) => [[i], a]),
          1
        )
    );
  },
});
