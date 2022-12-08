import { CollectionKey } from "./Collection.ts";
import { Source } from "./Source.ts";

export type OperationPipeline = Operation<any, any>[];

export type KeyOf<Input extends Source<any, any>> = Input extends Source<infer Key, any> ? Key : never
export type ValueOf<Input extends Source<any, any>> = Input extends Source<any, infer Value> ? Value : never

export type Operation<
  Input extends Source<any, any>,
  Output extends Source<any, any>
> = {
  iter(
    key: KeyOf<Input>,
    value: ValueOf<Input>,
    memo: Output
  ): void | null | undefined | "break";

  makeMemo(): Output;
};

export type Head<Pipeline extends OperationPipeline> = Pipeline extends [
  Operation<infer Head, any>,
  ...Operation<any, any>[]
]
  ? Head
  : never;
export type Tail<Pipeline extends any[]> = Pipeline extends [
  Operation<any, any>,
  Operation<any, infer Foot>
]
  ? Foot
  : Pipeline extends [
      Operation<any, any>,
      infer Foot extends Operation<any, any>[]
    ]
  ? Tail<Foot>
  : never;

export class Pipe<Pipeline extends OperationPipeline> {
  constructor(private pipeline: Pipeline) {}

  iter(source: Head<Pipeline>): Tail<Pipeline> {
    let prev = source;

    // TODO: we can optimize the pipeline in some cases by inlining things
    // for now we just want to be correct
    this.pipeline.forEach(stage => {
      const next = stage.makeMemo();
      prev.iter(stage.iter, next);
      prev = next;
    })

    return prev as Tail<Pipeline>;
  }
}

export function map<Key extends CollectionKey, Data, Result>(fn: (data: Data) => Result): Operation<Source<Key, Data>, Source<Key, Result>> {
  return {
    
  }
}
