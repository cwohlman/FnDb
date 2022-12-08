import { listOfStrings } from "./Contracts.ts";
import LocalStream from "./LocalStream.ts";

Deno.test({
  name: "LocalStream - list of strings",
  fn: () => {
    listOfStrings(
      (pairs) =>
        new LocalStream(
          pairs.map((a, i) => [[i], a]),
          1
        )
    );
  },
});
