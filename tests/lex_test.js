import {
  mk_lex_ctx,
  lex_tokens,
  lex_operand,
  getToken,
  readCh,
} from "../src/operand_lex.js";

const tokFromInput = (inp) => {
  const ctx = mk_lex_ctx(inp);
  readCh(ctx);
  const tok = getToken(ctx);
  return tok;
};

const get_tok_single_dig = () => {
  const tok = tokFromInput("1");
  return tok.type === lex_tokens.NumberLiteral && tok.val === 1;
};
const get_tok_many_dig = () => {
  const tok = tokFromInput("420");
  return tok.type === lex_tokens.NumberLiteral && tok.val === 420;
};
const get_tok_symbol = () => {
  const tok = tokFromInput("test");
  return tok.type === lex_tokens.Symbol && tok.val === "test";
};
const get_tok_symbol_num = () => {
  const tok = tokFromInput("test42");
  return tok.type === lex_tokens.Symbol && tok.val === "test42";
};
const lex_expr = () => {
  const toks = lex_operand("0(255,12)");
  const exp = [[lex_tokens.NumberLiteral, "0"]];
  console.log(toks);
  // NumLit,LParen,NumLit,Comma,NumLit,RParen
  return (
    toks.length === 6 && toks[0].type === exp[0][0] && toks[0].val === exp[0][1]
  );
};
const lex_plus = () => {
  const toks = lex_operand("screen+1");
  // NumLit,LParen,NumLit,Comma,NumLit,RParen
  console.log(toks);
  return false;
};

export default [
  get_tok_single_dig,
  get_tok_many_dig,
  get_tok_symbol,
  get_tok_symbol_num,
  lex_expr,
  lex_plus,
];
