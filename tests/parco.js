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
  const r = p(inp);
  if (r.fail) return r;
  return ok(f(r.data), r.rest);
};

const id = (...res) => res;
const And = (...ps) => apply(id, ps);
const Or =
  (...ps) =>
  (inp) => {
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

const Regex = (expr, label) => (inp) => {
  const m = new RegExp(`^${expr.source}`).exec(inp);
  if (m) {
    return ok(m[0], inp.slice(m[0].length));
  }
  return fail(label || expr, inp);
};

const Alpha = Regex(/[a-zA-Z]/, "alpha");
const Digit = map((v) => +v, Regex(/[0-9]/, "digit"));

const plus = apply((a, _, b) => a + b, [Int, Str("+"), Int, Eof]);
//console.log("Plus:", plus("32+10"));
//console.log(
//  "OR:",
//  parse(Or(And(Str("wor"), Str("ms")), Str("world")), "world")
//);

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
  // TODO: using "actual" from fail as "rest"... feels wrong!
  // yeah, must be wrong - because could succeed if EOF is part of parser
  return ok(out, r.actual);
};

const National = OneOf("@$#");
const Underscore = Ch("_");
const Special = OneOf("+-,=.*()'/&");

const SymName = map(
  ([first, rest]) => first + rest.join(""),
  And(Alpha, Many(Or(Alpha, Digit, National, Underscore)))
);

const firstBit = parse(SymName, "screen_1+1");
const lastBit = parse(And(Ch("+"), Digit), firstBit.rest);
//console.log(firstBit, lastBit);
