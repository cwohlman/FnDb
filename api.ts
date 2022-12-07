export interface Bucket<T> {
  map<Result>(fn: (input: T) => Result): List<Result>

}
