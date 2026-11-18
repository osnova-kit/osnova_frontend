export type Fits<Real, Off> = [Real] extends [Off] ? true : false;

export type StateOf<Store extends { getState: () => unknown }> = ReturnType<Store['getState']>;
