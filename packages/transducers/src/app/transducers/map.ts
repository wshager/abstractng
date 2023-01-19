export const map = (f) => (step) => (a, c) => step(a, f(c));
