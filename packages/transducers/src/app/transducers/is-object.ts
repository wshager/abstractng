export const isObject = (object: unknown): object is Record<string, unknown> =>
  !!object && (typeof object === 'object' || typeof object === 'function');
