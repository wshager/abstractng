# Abstractng

✨ **Knowlegde sharing tools** ✨

## Purpose

- Why is the current JS landscape the way it is?
- What kind of patterns and abstractions are underlying functional frameworks like RxJS and Transducers?
- How do these patterns and abstractions relate to each other?
- Can we reduce the number of frameworks in our stack and if (not) so, why?

## Relevant links

- https://medium.com/javascript-scene/transducers-efficient-data-processing-pipelines-in-javascript-7985330fe73d
- https://benlesh.com/posts/rxjs-operators-in-depth-part-1/
- https://benlesh.com/posts/learning-observable-by-building-observable/
- https://xgrommx.github.io/rx-book/content/getting_started_with_rxjs/creating_and_querying_observable_sequences/transducers.html
- https://staltz.com/why-we-need-callbags.html
- https://www.youtube.com/watch?v=sTSQlYX5DU0

## Covered so far

### Day 1

#### The God pattern?

Sometimes you have an array that you need filter before you can transform the items. We usually do this with the built-in methods of `filter` and `map`.

```js
const input = [1, 2, 3, 4, 5, 6];
const result = input.filter(c => c % 2 === 0).map(c => c * 2);
console.log(result); // [4, 8, 12]
```

However, when dealing with large arrays chaining multiple methods can become a performance bottleneck: each method applied means another loop.

To improve the performance there we could of course stop using `filter` and `map`. There are imperative ways to prevent the additional iterations. However, it's also possible to use a single built-in array method: `reduce`. Moreover, `reduce` can be seen as underlying all other operations that can be done on an array or any "container" type, as we'll see later on.

> 🦉 Using functional instead of imperative programming has many benefits, such as predictability and transparent typing. See for instance [this article on Coding Dojo](https://www.codingdojo.com/blog/what-is-functional-programming).

How does `reduce` work again? It takes an operator function and an initial value. The operator function takes an accumulated value, the current item in the array and the index of that item.

> 🦉 In the case of transforming from array to array that initial value is always an empty array.

```js
const input = [1, 2, 3, 4, 5, 6];
const result = input.reduce((a, c) => c % 2 === 0 ? a.concat([c * 2]) : a, []);
console.log(result); // [4, 8, 12]
```

#### Robots are coming

The above example shows how `reduce` can be used to both filter and transform items in an array. The downside of this code is that it's harder to read, because it doesn't distinguish between the `filter` part and the `map` part of the operation.

Is there a way to improve that? It turns out there is. A pattern was introduced in Clojure that was called [transducers](https://cognitect.com/blog/2014/8/6/transducers-are-coming) and soon found its way into JavaScript.

In transducers, function composition is used to create a single operation that can be passed to a `reduce` function. See the below code snipped from [Eric Elliot's nice writeup on transducers](https://medium.com/javascript-scene/transducers-efficient-data-processing-pipelines-in-javascript-7985330fe73d).

```js
const compose = (...fns) => x => fns.reduceRight((y, f) => f(y), x);
const map = f => step => (a, c) => step(a, f(c));
const filter = predicate => step => (a, c) => predicate(c) ? step(a, c) : a;
const isEven = n => n % 2 === 0;
const double = n => n * 2;
const doubleEvens = compose(filter(isEven), map(double));
const arrayConcat = (a, c) => a.concat([c]);
const xform = doubleEvens(arrayConcat);
const input = [1, 2, 3, 4, 5, 6];
const result = input.reduce(xform, []);
console.log(result); // [4, 8, 12]
```

> 🦉 Note that new code snippets may use functions already defined.

#### Mechanically pulled 🐥

The above example applies to arrays, but what if we want to extend it to other types at some point? We need a way to get values from the array that is generic enough as to apply it to container types. One such pattern is the [generator function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*). To write a generator function for any array is straightforward enough. Only, when we want to add types we need to use generics, since the array can contain any type.

> 🦉 Generics is a way to create an interface that can work with a variety of types, while still constraining it more that with using `any`. Instead one or more "type parameters" are expected. See [the page on Generics in the TypeScript handbook](https://www.typescriptlang.org/docs/handbook/2/generics.html).

```js
function* arrayGenerator<T>(arr: T[]) {
  for(const x of arr) yield x;
}
```

Then we create a `transduce` function that is similar to `reduce`, but takes the generator as input. A `reduce` function iterates over some container and applies the function with the initial value and the current value. The initial value will be accumulated with each iteration and returned at the end.

```js
function transduce(input, fn, generator, init) {
  const source = generator(input);
  let cur = source.next();
  do {
    init = fn(init, cur.value);
    cur = source.next();
  } while (!cur.done);
  return init;
};
```

Finally we pass the arguments to the `transduce` function. There are of course other ways to achieve the same and this is just a first step in a process to get to a more generic function.

```js
const xform = doubleEvens(arrayConcat);
const input = [1, 2, 3, 4, 5, 6];
const result = transduce(input, xform, arrayGenerator, []);
console.log(result); // [4, 8, 12]
```

This concludes the first day 😎

### Day 2

That's all good and nice, but wait just one moment! I'm already using [RxJS](https://rxjs.dev/) (or [Lodash](https://lodash.com/) or your framework here) and it already provides composable operator functions!

#### You Ain't Gonna Need It?

You would be right of course, and getting invested in yet another new framework for that extra bit of performance might not be worth it. However, do you need separate frameworks if there would be a single one to do all you need? Does it even exist? At first glance [transducers-js](https://github.com/cognitect-labs/transducers-js) looks great, but the first thing you might notice is that it hasn't been updated recently and doesn't use TypeScript. And of course we want typed functions.

A nice typed functional framework is [fp-ts](https://gcanti.github.io/fp-ts/). It's also quite complex, due to its abstract nature (if not its scarce documentation). Let's see if we can familiarize ourselves with it by implementing transducers for `Either`.

#### `Right` is right but `Left` is wrong

`Either` is a union type that indicates either failure or success in the most general sense. When successfull the type is an instance of `Right` containing an arbitrary value. In case there was a failure for whatever reason it's an instance of `Left`.

> 🦉 `Either` can be used to shortcut operation in an operation pipeline: as soon as there is a `Left` in the pipeline there are no more operations possible and processing will stop. The value in `Left` may contain useful information about what went wrong. In JavaScript it may represent a runtime error, but that's an imperative construct and has no equivalent in math or logic.

We need to come up with similar procedures we created for the array version. The generator needs to yield the value in `Right`. There's a function `fold` we can use that is like `reduce`. It takes two arguments, a function that operates on the `Left` value and one that operates on the `Right`. Since we just want to get the value unmodified we can use `identity`, which simply returns whatever was passed in. We don't care about the `Left` value here since it will never be operated on.

> 🦉 The [`identity` function](https://en.wikipedia.org/wiki/Identity_function) is at the bases of functional programming as it expresses a relationship between things mathematically. It's used to prove several laws in e.g. logic and set theory.

```js
function* eitherGenerator<E, A>(input: Either<E, A>) {
  yield fold(identity, identity)(input);
}
```

The `concat` function might look a bit more tricky, but we only need to replace the current `Right` with the updated value. To achieve this we can use `map` to substitute the `Right`. We just ignore the original value, since it will be operated on in the main pipeline.

By this time you may realise this is a bit of a silly and contrived example. Oh well, as long as it helps to understand both `Either` and `transduce` better, right? Left 🤓

```js
const eitherConcat = <E, A>(a: Either<E, A>, c: A) => map(() => c)(a);
```

#### No beginning no end

Something tricky comes up when dealing with the initial `Either` to pass in. We only need to operate on `Right`, but when `Left` is passed as initial value and the input is `Right` we always end up with `Left`. However, if the initial value is `Right` and the input is `Left` then the initial value is never updated and we end up with `Right`, which is wrong. Hmm.

And what if we *don't* pass an initial value? Then `Right` is taken as the initial value and is never operated on. Hmm hmm. Fixed by passing the input as the initial value. Nice.

Finally let's appreciate just how silly this exercise is.

```js
const prependHello = (a: string) => `hello ${a}`;
const isWorld = (a: string) => a === 'world';
const hello = compose(filter(isWorld), map(prependHello));
const xform = hello(eitherConcat);
const input = right('world');
const result = transduce(input, xform, eitherGenerator, input);
console.log(isRight(result)); // true
console.log(toUnion(result)); // hello world
```

### Day 3

Perhaps it's good to look at what was created so far and see if there's anything to improve. The code in the repo was written in a test-driven way from a data perspective, but operators and helpers remain untested at [this point](./commit/cf0305d266ff17a101bff397101f1c2431455f64). Also, not all code is typed. This might become a concern if this would be a open source library with actual users, but it isn't, so just consider adding more tests and types a good exercise at generics 😀

#### I don't like to use alien terms but 👽

It isn't easy for me either, but we have to talk about polymorphism. We've created implementations for transducing arrays and eithers, but we're not anywhere close to dealing with observables, which is one of the aims of this project.

> 🦉 Polymorphism means there's a single interface that can be used for different types. In functional programming, functions that accept different types have a generic type signature. For instance, the `identity` function above has the TypeScript type `<A>(input: A) => A`, where `A` is any type. Also note that operators in JavaScript are often polymorphic: the `+` operator can be used on both numbers and strings. This is known as operator overloading.

Generics in TypeScript can become hard to read at some point and it also has some limitations for annotating the kind of functions we'll be using. This is resolved by using the `fp-ts` library, but coming from JavaScript means we'll need to build a small spaceship to be able to travel to that remote planet...

So, before we go down the rabbit hole of async or fly to planet Abstract we'll need to get a better grasp of polymorphism. Let's first look at another sync type. Below is an example to `transduce` a string. While usually considered as a primitive type, we can of course consider a string as a "container" of characters 🤨

```js
const isW = (a: string) => a === 'w';
const hello = compose(filter(isW), map(prependHello));
function* stringGenerator(s: string) {
  for(const c of s) yield s;
}
const stringConcat = (a, c) => a + c;
const result = transduce(input, stringConcat, stringGenerator, '');
console.log(result); // hello w
```

#### Seeing double? 😵

Wasn't that easy? All you need is to translate the generator and concat function to string equivalents. But, wait a minute:

```js
function* arrayGenerator<T>(arr: T[]) {
  for(const x of arr) yield x;
}
function* stringGenerator(s: string) {
  for(const c of s) yield s;
}
```

Yes, the generator functions are identical. That's because in JavaScript the `for...of` statement operates on [iterable objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols). So, for any object that implements the iterable protocol we can instead retrieve the iterator:

```js
function iterator<T>(iterable: Iterable<T>) {
  return iterable[Symbol.iterator]();
}
```

> 🦉 In some functional languages, such as Haskell, polymorphism is expressed through type classes. Type classes are like generic interfaces that define behaviour which is shared between types. In JavaScript the built-in `Iterable` can also be considered a type class: it defines the iterator behaviour for iterable objects. See the TypeScript definition below.

```js
interface Iterable<T> {
  [Symbol.iterator](): Iterator<T>;
}
```

We can pass a generic function to `transduce`, getting one step closer to making a function that can handle a pretty wide range of types: any type that implements the iterator protocol can make use of a single function to loop over its inner values. This isn't limited to the built-in types, as we can extend or create any class in JavaScript.

```js
transduce(input, someConcat, iterator, someInit);
```

At this point we could make the iterator part of the `transduce` internals and thus have it only accept types that implement the iterable interface. However, we would still need to pass the `concat` and `init` arguments. As we will see later there is a way to generalise this, but there's a bit more ground to cover. Instead we first move on to async.

#### Worried about the future? 🙀

How to get from the present to the asynchronous? When dealing with [promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) you could be tempted by the fact that we now have [async generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncGenerator) in JavaScript. However, when we allow async generators in the `transduce` function it means that we would need to `await` every iteration. This would seriously impact the performance of the synchronous usecase, which is not desirable.

What can we do instead of awaiting when dealing with promises? Since the arrival of [async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) in 2017 we use it a lot less, but a promise is still an object with a `then` method, which receives a *callback*. Callbacks used to be the main way of dealing with async for a long time, and we'll need to get reacquainted with them here.

To `transduce` a promise without a generator we'll have to adapt the original function:

```js
function transduce(input, fn, onNext, init) {
  onNext(input, (cur) => {
    init = fn(init, cur);
  });
  return init;
};
```

Instead of working with a generator we just call a function that will kick off processing the value(s) which are gathered from the input. In the case of a promise that is the resolved value (we'll deal with rejection later). The function to pass in becomes:

```js
function promiseOnNext<T>(p: Promise<T>, callback: (val: T) => void) {
  return p.then(callback);
}
```

When the callback happens the function call will update `init`, which will be used for the sync case: when the overwrite of `init` happens asynchronously, it will be ignored (and garbage collected). We have a working solution for getting the resolved value, but how do we "update" the initial value (like `concat`), which is again a promise? We would need to be able to resolve a promise "from the outside". Luckily there exists a pattern that allows for just that: `Deferred`.

> 🦉 A deferred promise exposes a `resolve` (and `reject`) method in addition to `then` (and `catch`). It was a popular pattern before promises were standardised in JavaScript, but is now considered an anti-pattern.

```js
interface Deferred<T> extends Promise<T> {
  resolve: (v: T) => void;
  reject: (err: any) => void;
}

function createDeferred<T>() {
  let resolve, reject;
  const deferred = new Promise<T>((rs, rj) => {
    resolve = rs;
    reject = rj;
  }) as Deferred<T>;
  deferred.resolve = resolve;
  deferred.reject = reject;
  return deferred;
}
```

We pass the deferred as initial value to `transduce` and update it by simply calling its `resolve` method with the received value:

```js
function promiseConcat<T>(a: Promise<T>, c: T) {
  a.resolve(c);
  return a;
}
const xform = hello(promiseConcat);
const result = transduce(Promise.resolve('world'), xform, promiseOnNext, createDeferred());
console.log(await result); // hello world
```

What if we pass an rejection? Then the deferred should also be rejected. We need another callback for handling the error case, but we can combine it in the same function. We just need another function to dispatch on the initial value. Let's call it `onError`.

```js
function transduce(input, fn, onNext, onError, init) {
  onNext(input, (cur) => {
    init = fn(init, cur);
  }, (error) => {
    onError(init, error);
  });
  return init;
};
```

Now to transduce a rejected promise:

```js
function promiseOnNext<T>(p: Promise<T>, nextCallback: (val: T) => void, errorCallback: (err: any) => void) {
  return p.then(nextCallback).catch(errorCallback);
}
function promiseOnError<T>(a: Promise<T>, error: any) {
  a.reject(error);
}
const xform = hello(promiseConcat);
const result = transduce(Promise.reject('boom!'), xform, promiseOnNext, promiseOnError, createDeferred());
result.catch(console.log); // boom!
```

Promises also have a `finally` method that always gets called after it's either resolved or rejected. However, there isn't any method to be called, so let's just pass a function that does nothing (`noop`).

```js
function transduce(input, fn, onNext, onError, onComplete, init) {
  onNext(input, (cur) => {
    init = fn(init, cur);
  }, (error) => {
    onError(init, error);
  }, () => {
    onComplete(init);
  });
  return init;
};

function promiseOnNext<T>(
  p: Promise<T>,
  nextCallback: (val: T) => void,
  errorCallback: (err: any) => void,
  completeCallback: () => void
) {
  return p.then(nextCallback).reject(errorCallback).finally(completeCallback);
}
function noop() {}
const xform = hello(promiseConcat);
const result = transduce(
  Promise.resolve('world'),
  xform,
  promiseOnNext,
  promiseOnError,
  noop,
  createDeferred()
);

result.finally(() => {
  console.log('finally!');
}); // finally!
```

#### Say, have we met before?

Does the `onNext` pattern resemble anything you've seen before? Of course! Observables have identical methods and callbacks. Where promises have `resolve`, `reject` and `finally` observables have `next`, `error` and `complete`. It's the same concept, with of course the difference that observables "resolve" to multiple values. However, as soon as you are able to transduce async input, you get handling observables for free 👻

Next up: observables!

### Day 4

Now we have modified `transduce` to handle async it's time to figure out how it can handle observables.

#### Kickoff 🏈

First we need to pass the `onNext` function which kicks off the callback chain. In `RxJs` this is called `subscribe` instead, so let's rename the parameter and the callbacks to be more in line with `RxJs`:

```js
function transduce(input, fn, subscribe, onError, onComplete, init) {
  subscribe(input, {
    next: (cur) => {
      init = fn(init, cur);
    },
    error: (err) => {
      onError(init, err);
    },
    complete: () => {
      onComplete(init);
    }
  });
  return init;
};
```

> 🦉 Observables are considered a push-style of dealing with many values, while generators are pull-based. In `RxJS` there are ways to handle this "stream" of values in a more sophisticated way, as they're always coming in. Even in async generators the code needs to get and await the next value, evaluating it when it's resolved. On the flipside, it means that the consumer is in charge: you don't need to think about functionally transforming streams, you can get a single value on demand and operate on it, just like with any imperative construct. What is called "backpressure" is handled in a natural way, where with observables you would need to buffer or even drop values altogether. You can convert between generators and observables, but they generally exist in different [paradigms](https://en.wikipedia.org/wiki/Programming_paradigm), so the choice is up to you I guess 🙃

The `subscribe` function for `Observable` is simply a way to dispatch the `subscribe` method on the object (perhaps it would have been nicer if `RxJs` would already expose this function, but it doesn't seem so). Note that this function returns `void`. At some point we might need to come back to the return value, because we may have to unsubscribe from the observable.

```js
function observableSubscribe<T>(o: Observable<T>, s: Observer<T>) {
  o.subscribe(s);
}
```

#### Subject

Just like the `Promise` case needed a `Deferred`, the `Observable` case needs an initial value that allows for "updates from the outside". In `RxJS` this typically is a `Subject`, which exposes methods `next`, `error`, parallel to `resolve` and `reject`. It also has a `complete` method, because since an observable "resolve" many values it can complete at any time. When a `Subject` is passed as initial value, the handlers can simply dispatch on it:

```js
function observableConcat<T>(a: Observable<T>, c: T) {
  a.next(c);
  return a;
}
function observableOnError<T>(a: Observable<T>, error: any) {
  a.error(error);
}
function observableOnComplete<T>(a: Observable<T>) {
  a.complete();
}
```

Finally we can transduce observables.

```js
const xform = doubleEvens(observableConcat);
const result = transduceObservable(
  from([1, 2, 3, 4, 5, 6]),
  xform,
  observableSubscribe,
  observableOnError,
  observableOnComplete,
  new Subject()
);
result.subscribe(console.log); // 4 8 12
```

#### Ready for takeoff 🧑‍🚀

Now that most of our usecases are covered (though not yet all operations) the time has come to make the transducer function handle them all. It's possible to get rid of all the specific arguments related to different types, but before that let's look at the common characteristics.

First it seems that all these type-specific functions are really different, but just like the `Iterable` interface is available JS (or, rather, TS), the `fp-ts` library has a collection of type classes ready for use. At first the names look seriously alien: Monad, Functor, Semigroup... These names are coming from [category theory](https://en.wikipedia.org/wiki/Category_theory), a field in math, and not from any practical application (also, not all modules in `fp-ts` expose type classes).

However, this road was created as a gentle introduction into higher and higher levels of abstraction, by focusing on what is concretely usable. So let's dive in and look at the `Monoid` type class.

> 🦉 `Semigroup` defines the behaviour of types that allow for concatenation, in whatever form that takes. JS types like arrays, strings and numbers all display some form of concatenation, so these types can be considered to belong to this category. `Monoid` extends this behaviour with an "empty" or initial value of a type. The empty array, the empty string, and the number zero were chosen respectively. See the relevant modules in the `fp-ts` documentation.

Not all implementations in `fp-ts` are similar (e.g. there is no `Monoid` for `Array<unknown>`), so this repo re-exposes `Monoid` to be readily used in the transducer functions. We already implemented `Monoid` behaviour for promises and observables, but we'll expose it using correct type.

```js
function transduceArray<T>(input: T[], fn) {
  return transduce(
    input,
    fn(array.getMonoid<T>().concat),
    iteratorSubscribe,
    noop,
    noop,
    array.getMonoid<T>().empty
  );
}

function transduceString(input: string, fn) {
  return transduce(
    input,
    fn(string.getMonoid().concat),
    iteratorSubscribe,
    noop,
    noop,
    string.getMonoid().empty
  );
}

function transducePromise<T>(input: Promise<T>, fn) {
  return transduce(
    input,
    fn(promise.getMonoid<T>().concat),
    promiseSubscribe,
    promiseOnError,
    noop,
    promise.getMonoid<T>().empty
  );
}


function transduceObservable<T>(input: Observable<T>, fn) {
  return transduce(
    input,
    fn(observable.getMonoid<T>().concat),
    observableSubscribe,
    observableOnError,
    observableOnComplete,
    observable.getMonoid<T>().empty
  );
}
```

All that is needed now is a type class that expresses the `subscribe`, `onError` and `onComplete` behaviour (if any) and we can have a stab at creating the input type for `transduce`:

```js
interface Semigroup<A> {
  readonly concat: (x: A, y: A) => A
}

interface Monoid<A> extends Semigroup<A> {
  readonly empty: A
}

interface Subscribable<A> {
  subscribe: <T>(a: A, o: Observer<T>) => void,
}

interface Transducable<A> = Monoid<A> & Subscribable<A>;
```

There are some things to iron out, but Rome wasn't built in four days.