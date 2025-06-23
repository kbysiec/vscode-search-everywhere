import * as sinon from "sinon";

// source: https://github.com/sinonjs/sinon/issues/1963
// without it there is no possibility to mock getLastFromArray<T> and groupBy<T> methods

export type StubbedClass<T> = sinon.SinonStubbedInstance<T> & T;

export function createStubInstance<T>(
  constructor: sinon.StubbableType<T>,
  overrides?: { [K in keyof T]?: sinon.SinonStubbedMember<T[K]> }
): StubbedClass<T> {
  const stub = sinon.createStubInstance<T>(constructor, overrides);
  return (stub as unknown) as StubbedClass<T>;
}
