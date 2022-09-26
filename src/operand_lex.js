export const lex_tokens = {
  LParen: "LParen",
  RParen: "RParen",
  Comma: "Comma",
  Plus: "Plus",
  Minus: "Minus",
  Asterisk: "Asterisk",
  Divide: "Divide",
  Equals: "Equals",
  Quote: "Quote",
  Underscore: "Underscore",
  NumberLiteral: "NumberLiteral",
  HexLiteral: "HexLiteral",
  BinaryLiteral: "BinaryLiteral",
  Symbol: "Symbol",
  Unknown: "Unknown",
};

export const mk_lex_ctx = (inp) => ({
  inp,
  ch: "",
  cur: 0,
  next: 0,
});

/*
  Operand is:
  -- Expression | Exp(Exp) | Exp(Exp,Exp) or Exp(,Exp)
  - Expression:
  -- Term | Arithemetic combination of terms
  - Term:
  -- A symbol | Loc Counter Reference | Symbol Attribute | Self-defining term | Literal
  - Self-defining term:
  -- Decimal | Hexadecimal | Binary | Character | Graphic (G'<.A>')
  */
export const lex_operand = (op) => {
  const ctx = mk_lex_ctx(op);
  const toks = [];
  readCh(ctx);
  while (ctx.cur < ctx.inp.length) {
    toks.push(getToken(ctx));
  }
  return toks;
};

export const getToken = (ctx) => {
  if (is_digit(ctx.ch)) {
    return read_num(ctx);
  }
  if (is_binary_literal(ctx)) {
    return read_binary_literal(ctx);
  }
  if (is_hex_literal(ctx)) {
    return read_hex_literal(ctx);
  }
  if (is_alpha(ctx.ch)) {
    return read_symbol(ctx);
  }
  return read_letter(ctx);
};

export const readCh = (ctx) => {
  const { next, inp } = ctx;
  ctx.ch = next >= inp.length ? "" : inp[next];
  ctx.cur = next;
  ctx.next += 1;
};
const is_digit = (ch) => ch.search(/[0-9]/) === 0;
const is_binary = (ch) => ch.search(/[01]/) === 0;
const is_hex = (ch) => ch.search(/[a-fA-F0-9]/) === 0;
const is_alpha = (ch) => ch.search(/[a-zA-Z]/) === 0;
const is_national = (ch) => ch.search(/[@$#]/) === 0;
const is_special = (ch) => ch.search(/[+-,=.*()'/&]/) === 0;
const is_underscore = (ch) => ch === "_";
const is_symbol_char = (ch) => ch.search(/[a-zA-Z0-9]/) === 0;
const is_binary_literal = (ctx) =>
  ctx.inp.substr(ctx.cur).search(/[bB]'[01]+'/) === 0;
const is_hex_literal = (ctx) =>
  ctx.inp.substr(ctx.cur).search(/[xX]'[0-9a-fA-F]+'/) === 0;

const maths_chars = {
  "(": lex_tokens.LParen,
  ")": lex_tokens.RParen,
  ",": lex_tokens.Comma,
  "+": lex_tokens.Plus,
  "-": lex_tokens.Minus,
  "*": lex_tokens.Asterisk,
  "/": lex_tokens.Divide,
  "'": lex_tokens.Quote,
  "=": lex_tokens.Equals,
  _: lex_tokens.Underscore,
};
const read_letter = (ctx) => {
  const ch = ctx.ch;
  readCh(ctx);

  if (maths_chars[ch]) {
    return { type: maths_chars[ch] };
  }

  return { type: lex_tokens.Unknown, value: ch };
};

const read_num = (ctx) => {
  const init = ctx.cur;
  while (is_digit(ctx.ch)) {
    readCh(ctx);
  }

  return {
    type: lex_tokens.NumberLiteral,
    val: parseInt(ctx.inp.substring(init, ctx.cur), 10),
  };
};

// TODO: don't thing x'F00F' is "self-defining". I think that's =x'F00F'?.
const read_self_defining_literal = (ctx, isF, type) => {
  const head = ctx.ch;
  readCh(ctx);
  const quot = ctx.ch;
  readCh(ctx);
  const init = ctx.cur;
  while (isF(ctx.ch)) {
    readCh(ctx);
  }
  const num = ctx.inp.substring(init, ctx.cur);
  if (ctx.ch !== "'") {
    console.log("error - missing quote on lit", type, ctx.ch);
  }
  const quot2 = ctx.ch;
  const val = head + quot + num + quot2;
  readCh(ctx);
  return {
    type: type,
    val,
  };
};
const read_binary_literal = (ctx) =>
  read_self_defining_literal(ctx, is_binary, lex_tokens.BinaryLiteral);
const read_hex_literal = (ctx) =>
  read_self_defining_literal(ctx, is_hex, lex_tokens.HexLiteral);

const read_symbol = (ctx) => {
  const init = ctx.cur;
  while (is_symbol_char(ctx.ch)) {
    readCh(ctx);
  }
  return {
    type: lex_tokens.Symbol,
    val: ctx.inp.substring(init, ctx.cur),
  };
};
