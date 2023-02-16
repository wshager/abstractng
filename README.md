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

## Covered so far

### Day 1

#### The God pattern?

Sometimes you have an array that you need filter before you can transform the items. We usually do this with the built-in methods of `filter` and `map`.

```javascript
const input = [1, 2, 3, 4, 5, 6];
const result = input.filter(c => c % 2 === 0).map(c => c * 2);
console.log(result); // [4, 8, 12]
```

However, when dealing with large arrays chaining multiple methods can become a performance bottleneck: each method applied means another loop.

To improve the performance there we could of course stop using `filter` and `map`. There are imperative ways to prevent the additional iterations. However, it's also possible to use a single built-in array method: `reduce`. Moreover, `reduce` can be seen as underlying all other operations that can be done on an array or any "container" type, as we'll see later on.

> Using functional instead of imperative programming has many benefits, such as predictability and transparent typing.

How does `reduce` work again? It takes an operator function and an initial value. The operator function takes an accumulated value, the current item in the array and the index of that item.

> In the case of transforming from array to array that initial value is always an empty array.

```javascript
const input = [1, 2, 3, 4, 5, 6];
const result = input.reduce((a, c) => c % 2 === 0 ? a.concat([c * 2]) : a, []);
console.log(result); // [4, 8, 12]
```

#### Robots are coming

The above example shows how `reduce` can be used to both filter and transform items in an array. The downside of this code is that it's harder to read, because it doesn't distinguish between the `filter` part and the `map` part of the operation.

Is there a way to improve that? It turns out there is. A pattern was introduced in Clojure that was called [transducers](https://cognitect.com/blog/2014/8/6/transducers-are-coming) and soon found it's way into JavaScript.

In transducers, function composition is used to create a single operation that can be passed to a `reduce` function. See the below code snipped from [Eric Elliot's nice writeup on transducers](https://medium.com/javascript-scene/transducers-efficient-data-processing-pipelines-in-javascript-7985330fe73d).

```javascript
const compose = (...fns) => x => fns.reduceRight((y, f) => f(y), x);
const map = f => step =>
  (a, c) => step(a, f(c));
const filter = predicate => step =>
  (a, c) => predicate(c) ? step(a, c) : a;
const isEven = n => n % 2 === 0;
const double = n => n * 2;
const doubleEvens = compose(
  filter(isEven),
  map(double)
);
const arrayConcat = (a, c) => a.concat([c]);
const xform = doubleEvens(arrayConcat);
const input = [1, 2, 3, 4, 5, 6];
const result = input.reduce(xform, []);
console.log(result); // [4, 8, 12]
```

#### Mechanically pulled 🐥

The above example applies to arrays, but what if we want to extend it to other types at some point? We need a way to get values from the array that is generic enough as to apply it to container types. One such pattern is the [generator function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*). To write a generator function for any array is straightforward enough. Only when we want to add types we need to use generics, since the array can contain any type.

> Generics is a way to create an interface that can work with a variety of types, while still constraining it more that with using `any`. Instead one or more "type parameters" are expected. See [the page on Generics in the TypeScript handbook](https://www.typescriptlang.org/docs/handbook/2/generics.html).

```javascript
function* arrayGenerator<T>(arr: T[]) {
  for(const x of arr) yield x;
}
```

Then we create a `transduce` function that is similar to `reduce`, but takes the generator as input. A `reduce` function iterates over some container and applies the function with the initial value and the current value. The initial value will be accumulated with each iteration and returned at the end.

```javascript
function transduce(value, fn, generator, init) {
  const source = generator(value);
  let cur = source.next();
  do {
    init = fn(init, cur.value);
    cur = source.next();
  } while (!cur.done);
  return init;
};
```

Finally we pass the arguments to the `transduce` function. There are of course other ways to achieve the same and this is just a first step in a process to get to a more generic function.

```javascript
const isEven = (n) => n % 2 === 0;
const double = (n) => n * 2;
const doubleEvens = compose(filter(isEven), map(double));
const xform = doubleEvens(arrayConcat);
const input = [1, 2, 3, 4, 5, 6];
const result = transduce(input, xform, arrayGenerator, []);
console.log(result); // [4, 8, 12]
```

This concludes the first day 😎

### Day 2

That's all good and nice, but wait just one moment! I'm already using [RxJS](https://rxjs.dev/) (or [Lodash](https://lodash.com/) or your framework here) and I'm already using composable operator functions!

#### You Ain't Gonna Need It?

You would be right of course, and getting invested in yet another new framework for that extra bit of performance might not be worth it. However, do you need separate frameworks if there would be a single one to do all you need? Does it even exist? At first glance [transducers-js](https://github.com/cognitect-labs/transducers-js) looks great, but the first thing you might notice is that it's pretty old and doesn't use TypeScript. And of course we want typed functions.

A nice typed functional framework is [fp-ts](https://gcanti.github.io/fp-ts/). It's also quite complex, due to its abstract nature (if not its scarce documentation). Let's see if we can familiarize ourselves with it by implementing transducers for `Either`.

#### `Right` is right but `Left` is wrong

`Either` is a union type that indicates either failure or success in the most general sense. When successfull the type is an instance of `Right` containing an arbitrary value. In case there was a failure for whatever reason (e.g. a runtime error) it's an instance of `Left`. It can be used to shortcut operation in an operation pipeline: as soon as there is a `Left` in the pipeline there are no more operations possible and processing will stop. The value in `Left` may contain useful information about what went wrong.

We need to come up with similar procedures we created for the array version. The generator needs to yield the value in `Right`. There's a function `fold` we can use that is like `reduce`. It takes two arguments, a function that operates on the `Left` value and one that operates on the `Right`. Since we just want to get the value unmodified we can use `identity`, which simply returns whatever was passed in. We don't care about the `Left` value here since it will never be operated on.

> The [`identity` function](https://en.wikipedia.org/wiki/Identity_function) is at the bases of functional programming as it expresses a relationship between things mathematically. It's used to prove several laws in e.g. logic and set theory.

```javascript
function* eitherGenerator<E, A>(input: Either<E, A>) {
  yield fold(identity, identity)(input);
}
```

The `concat` function might look a bit more tricky, but we only need to replace the current `Right` with the updated value. To achieve this we can use `map` to substitute the `Right`. We just ignore the original value, since it will be operated on in the main pipeline.

By this time you may realise this is a bit of a silly and contrived example. Oh well, as long as it helps to understand both `Either` and `transduce` better, right? Left 🤓

```javascript
const eitherConcat = <E, A>(a: Either<E, A>, c: A) => map(() => c)(a);
```

#### No beginning no end

Something tricky comes up when dealing with the initial `Either` to pass in. We only need to operate on `Right`, but when `Left` is passed as initial value and the input is `Right` we always end up with `Left`. However, if the initial value is `Right` and the input is `Left` then the initial value is never updated and we end up with `Left`. Hmm.

And what if we *don't* pass an initial value? Then `Right` is taken as the initial value and is never operated on. Hmm hmm. Fixed by passing the input as the initial value. Nice.

Finally let's appreciate just silly this exercise is.

```javascript
const prependHello = (a: string) => `hello ${a}`;
const isWorld = (a: string) => a === 'world';
const hello = compose(filter(isWorld), map(prependHello));
const xform = hello(eitherConcat);
const input = right('world');
const result = transduce(input, xform, eitherGenerator, input);
console.log(isRight(result)); // true
console.log(toUnion(result)); // hello world
```
