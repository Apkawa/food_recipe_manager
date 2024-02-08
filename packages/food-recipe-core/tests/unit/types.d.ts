export interface Case<Arg, Expected> {
  arg: Arg;
  expected: Expected;
}

export type Cases<Arg, Expected> = Case<Arg, Expected>[];
