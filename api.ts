export function reduce<Element, Args extends any[], Result>(
  source: Set<Element> | Db<Element>,
  fn: (item: Element, ...args: Args) => Result,
  ...args: Args
):

  // TODO: convert this to the type "DeferedSet" or some such
  Result | null {
  let result: Result | null = null;
  if (source instanceof Set) {
    for (const element of source) {
      result = fn(element, ...args);
    }
  } else {
    // TODO: map over args and convert any Set or Map into a cached table etc.
    const cursor = source.getCursor();
    while (cursor.hasMore()) {
      result = fn(cursor.next(), ...args);
    }
  }
  return result;
}

export class Db<Element> {
  private documents: Element[] = []
  insert(document: Element) {
    this.documents.push(document);
  }
  getCursor() {
    let i = 0;
    return {
      next(): Element {
        const result = this.documents[i];
        i++;
        return result;
      },
      hasMore(): boolean {
        return i < this.documents.length;
      }
    }
  }
}