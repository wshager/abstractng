export interface Deferred<T> extends Promise<T> {
  resolve: (v: T) => void;
  reject: (err: any) => void;
}

export const createDeferred = <T>() => {
  let resolve, reject;
  const deferred = new Promise<T>((rs, rj) => {
    resolve = rs;
    reject = rj;
  }) as Deferred<T>;
  deferred.resolve = resolve;
  deferred.reject = reject;
  return deferred;
};
