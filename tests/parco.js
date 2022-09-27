const ok = (data, rest) => ({ data, rest });
const fail = (expected, actual) => ({ fail: true, expected, actual });
const parse = (p, input) => {
  const r = p(input);
  if (r.fail) {
    throw new Error("Fail. Expected:" + r.expected + ". Got:" + r.actual + ".");
  }
  return r;
};
const apply = (f, ps) => (inp) => {
  const out = [];
  for (const p of ps) {
    const r = p(inp);
    if (r.fail) return r;
    out.push(r.data);
    inp = r.rest;
  }
  return ok(f(...out), inp);
};
const map = (f, p) => (inp) => {
  const r = parse(p, inp);
  if (r.fail) return r;
  return ok(f(r.data), r.rest);
};

const id = (...res) => res;
const And = (...ps) => apply(id, ps);
const Or = (...ps) => (inp) => {
  for (const p of ps) {
    const r = p(inp);
    if (!r.fail) return r;
  }
  return fail("Or", inp);
};

const Ch = (ch) => (inp) =>
  inp[0] === ch ? ok(ch, inp.slice(1)) : fail(`'${ch}'`, inp[0]);

const Str = (str) => (inp) =>
  inp.startsWith(str) ? ok(str, inp.slice(str.length)) : fail(`'${str}'`, inp);

const Eof = (inp) => (inp.length === 0 ? ok(null, inp) : fail("eof", inp));

const Int = (input) => {
  const m = /^\d+/.exec(input);
  if (m !== null) {
    return ok(+m[0], input.slice(m[0].length));
  }
  return fail("int", input);
};

const Alpha = (inp) => {
  const m = /^[A-Za-z]/.exec(inp);
  if (m !== null) {
    return ok(m[0], inp.slice(m[0].length));
  }
  return fail("alpha", inp);
};
const Digit = (inp) => {
  const m = /^[0-9]/.exec(inp);
  if (m !== null) {
    return ok(m[0], inp.slice(m[0].length));
  }
  return fail("digit", inp);
};

const plus = apply((a, _, b) => a + b, [Int, Str("+"), Int, Eof]);
console.log("Plus:", plus("32+10"));
console.log(
  "OR:",
  parse(Or(And(Str("wor"), Str("ms")), Str("world")), "world")
);

const OneOf = (chs) => (inp) => {
  const m = new RegExp(`^[${chs}]`).exec(inp);
  if (m !== null) {
    return ok(m[0], inp.slice(m[0].length));
  }
  return fail(`one of '${chs}'`, inp[0]);
};

const Many = (p) => (inp) => {
  let r = p(inp);
  if (r.fail) return r;
  const out = [];
  while (!r.fail) {
    out.push(r.data);
    inp = r.rest;
    r = p(inp);
  }
  return ok(out, r.rest);
};

const National = OneOf("@$#");
const Underscore = Ch("_");
const Special = OneOf("+-,=.*()'/&");

const SymName = map(
  ([first, rest]) => first + rest.join(""),
  And(Alpha, Many(Or(Alpha, Digit, National, Underscore, Special)))
);

console.log(parse(SymName, "screen+1"));
