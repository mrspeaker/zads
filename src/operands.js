import { to_nibs } from "./bytes.js";
import { parseImmediate } from "./assemble.js";
import { parseBaseDisplace } from "./addressing.js";
import { lex_operand, lex_tokens } from "./operand_lex.js";

export const tokenizeOperands = (ops) => {
  // comma, followed by NOT open paren, stuff, close paren.
  // Splits on commas, but not inside parens (eg `L R1,0(,R15)`)
  return ops?.split(/,(?![^(]*\))/g) ?? [];
};

//const literalExpaned... .reduce(expandLiterals, { lits: [], stmts: [] });
// TODO: need to inject literals somewhere - with corresponding PC,
// _before_ assebmbling the statement. Sould be LTORG
//  console.log("Literals:", expanded.lits);

/**
 * Converts text operands to nibbles for passing to Op functions
 * @param {object} s statememt object
 * @param {object} symbols symbol table
 * @param {array} equs equates?
 * @param {number} base base for addressing?
 * @returns {string[]} disassembled listing
 */
export const parseOperands = (s, symbols, eqs, base) => {
  const { stmt, bytes, type } = s;
  const lexed = stmt.operands.map(lex_operand);
  // Eq is a Term... so don't replace yet?
  //const eqReplaced = lexed.map((v) => replaceEqs(v, eqs));
  //console.log("Lex:", stmt.operands.join(","), ...eqReplaced);
  //const encLex = eqReplaced.map((v) => parseLexedOperand(v));
  //console.log("Lex:", lexed.join(",")); // "########");

  // This is replacing equates inside Expr(Expr,Expr).
  // Not needed if using LEXED
  stmt.operands = stmt.operands.map((v) => {
    if (!v.split) return v; // TODO: nope.

    // Split up base/display parens
    const [first, ...rest] = v.split(/[,()]/g);

    const firstEq = eqs[first.toLowerCase()];
    const head = firstEq !== undefined ? firstEq : first;

    const parens = rest.slice(0, -1).map((v) => {
      const equate = eqs[v.toLocaleLowerCase()];
      return v && equate !== undefined ? equate : v;
    });
    // Rebuild them.
    return head + (parens.length ? "(" + parens.join(",") + ")" : "");
  });

  // Parse to bytes
  const enc = stmt.operands.map((o, i) =>
    parseOperand(o, symbols, base, type, i, stmt.mn)
  );

  // Re-org operands depending on operation.
  switch (type) {
    case "RR":
    case "RX":
    case "RS":
      bytes.operands.push(...enc[0], ...enc[1]);
      break;
    case "RI":
      {
        // format: op1, op2, r1, op3, i1, i2, i3, i4
        // eg: AHI: 'A', '7', r1, 'A', i1, i2, i3, i4
        // extract extra opcode byte
        const extra = bytes.op_code[0] & 0xf; // op3
        bytes.op_code[0] >>= 4; // op1, op2
        bytes.operands.push(...enc[0], extra, ...enc[1]);
      }
      break;
    case "SI":
      // I2I2 B1 D1D1D1
      bytes.operands.push(...enc[1], ...enc[0].slice(1));
      break;
    case "SS":
      // L1L1 B1 D1D1D1 B2 D2D2D2
      bytes.operands.push(...enc[0], ...enc[1]);
      break;
    case "DC":
    case undefined:
      // Just dump the bytes
      enc.forEach((bs) => bytes.operands.push(...bs));
      break;
    default:
      console.log("not rr rx si...", type, enc);
  }
  return s;
};

const replaceEqs = (o, eqs) => {
  return o.map((tok) => {
    const { type, val } = tok;
    if (type === lex_tokens.Symbol && eqs[val.toLowerCase()]) {
      return {
        type: lex_tokens.NumberLiteral,
        val: parseInt(eqs[val.toLowerCase()], 10),
      };
    }
    return tok;
  });
};

const parseExpression = (v) => {
  const { exprs } = v.reduce(
    (ac, el) => {
      const { st, exprs } = ac;
      if (st > 2) {
        console.log("ERROR... too many statements");
        return ac;
      }
      const expr = exprs[st];
      switch (el.type) {
        case lex_tokens.LParen:
          if (st !== 0) {
            console.error("Bad LParen", st);
          } else {
            return { st: 1, exprs: [...exprs, []] };
          }
          break;
        case lex_tokens.Comma:
          if (st === 1) {
            // inside parens, sep st.
            return { st: 2, exprs: [...exprs, []] };
          }
          break;
        case lex_tokens.RParen:
          if (st !== 1 && st !== 2) {
            console.error("Bad RParen", st);
          } else {
            return { st: 3, exprs };
          }
          break;
        default:
          expr.push(el);
          break;
      }
      return { st, exprs };
    },
    { st: 0, exprs: [[]] }
  );
  return exprs;
};

const parseTerm = (expr) => {
  return expr;
};

/*
  Characters:
  When you code terms and expressions (see Terms, literals, and expressions)
  in assembler language statements, you can only use the set of characters
  described above. However, when you code remarks, comments, or character
  strings between paired apostrophes, you can use any character in the
  EBCDIC character set.
  */

const TAlpha = [
  ["a", "z"],
  ["A", "Z"],
];
const TDigit = "0123456789";
const TNational = "@$#";
const TUnderscore = "_";
const TSpecial = "+-,=.*()'/&";
const TCharacters = [TAlpha, TDigit, TNational, TUnderscore, TSpecial];

const TTerm = {
  Symbol: "Symbol", // Abs or Rel
  LocationCounterReference: "LocationCounterReference", // Rel
  SymbolAttribute: "SymbolAttribute", // Abs or Rel
  SelfDefiningTerm: "SelfDefiningTerm", //Abs
  Literal: "Literal", // Rel
};

const TSelfDefining = {
  Decimal: "Decimal",
  Hexadecimal: "Hexadecimal",
  Binary: "Binary",
  Character: "Character",
  Graphic: "Graphic",
};

//
const parseLexedOperand = (v) => {
  /*
  Operand is:
  -- Expression | Exp(Exp) | Exp(Exp,Exp) or Exp(,Exp)
    --- Expr: factor | +-factor | factor+-factor
    --- Factor: primary | primary*primary | primary/primary
    --- Primary: term | ( expr )
    

  - Expression:
  -- Term | Arithemetic combination of terms
  - Term:
  -- A symbol | Loc Counter Reference | Symbol Attribute | Self-defining term | Literal
  - Self-defining term:
  -- Decimal | Hexadecimal | Binary | Character | Graphic (G'<.A>')

  -- symbol attribute: L' | I' | S'
  */
  const exprs = parseExpression(v);
  const terms = exprs.map(parseTerm);

  if (v.length === 1) {
    // if numlit, parse it.
    if (v[0].type === lex_tokens.NumberLiteral) {
      return parseInt(v[0].val, 10);
    }
  }
  return v;
};

/**
 * Parses the object code for operands into nibbles for an individual statement.
 * [This is bad - get rid of it and do operands for each instruction type properly.]
 * @param {number[]} obj operands as bytes
 * @param {object} symbol symbol table
 * @param {number} base base for addressing?
 * @param {string} type type of instruction (RS, RX etc)
 * @param {number} idx index of the operand in the list
 * @param {string} mn mnemonic of the current instruction
 * @returns {string[]} disassembled listing
 */
const parseOperand = (o, symbols, base, type, idx, mn) => {
  if (!type) {
    throw new Error("Err parseOperand: no type", o);
  }

  if (type === "DC") {
    return parseImmediate(o);
  }
  const otype =
    {
      RR: ["R", "R"],
      RX: ["R", "X"],
      RS: ["R", "S"],
      SI: ["S", "I"],
      SS: ["X", "X"],
      RI: ["R", "I"],
    }[type] || [];
  const oidx = otype[idx];
  if (type && type !== "DC" && (!otype || !oidx)) {
    console.warn("What's this operand?", type, o, idx, mn, symbols);
  }
  if (type === "SS") {
    // HACK! manually doing this. don't think you can guess the operand types for all
    // instruction types! Redo this whole function!
    // ... For now, let's assume all SS types are SS-1 with Implied Addresses.
    // eg: S1(N1),S2

    if (idx === 0) {
      // S1(N1)
      const [s1, n1] = o.split("(");
      const bd = parseBaseDisplace(s1, base, symbols);
      const addr = bd.slice(1); // no index
      const len = parseInt(n1);
      return [...to_nibs(len, 4), ...addr];
    }
    // S2
    const bd = parseBaseDisplace(o, base, symbols);
    const addr = bd.slice(1); // no index
    return addr;
  }

  switch (oidx) {
    case "R":
      // One number? Correct? Should not be over 15 anyway.
      if (o > 15 || o < 0) console.warn("bad reg", o);
      return parseImmediate(o);
    case "I": {
      const nibs = type === "RI" ? 4 : 2;
      return to_nibs(parseImmediate(o), nibs);
    }
    case "X":
    case "S": {
      return parseBaseDisplace(o, base, symbols);
    }
    default: {
      console.warn("unhandeld mn?", oidx, otype, type);
      return parseImmediate(o);
    }
  }
};

/*
  DC and DS Operands can be composed of one to five subfields
  - Subfields:
  -- Duplication factor
  -- Type
  -- Type Extension
  -- Modifiers (eg L2)
  -- Nominal Value
  - Nominal Value:
  -- Decimal Number | Expression | Character String | Graphic String  
 */
export const parseDataOperand = (d) => {
  const numReps = parseInt(d, 10);
  if (isNaN(numReps)) {
    return parseImmediate(d);
  }
  // Expand repetitions
  const value = d.slice((numReps + "").length);
  return new Array(numReps).fill(parseImmediate(value)).flat();
};

export const LITERAL_GEN_PREFIX = "_lit_";
export const expandLiterals = (ac, stmt) => {
  stmt.operands = stmt.operands.map((o) => {
    if (o.startsWith("=")) {
      const lit = {
        label: LITERAL_GEN_PREFIX + ac.lits.length.toString(),
        value: o.slice(1),
      };
      ac.lits.push(lit);
      return lit.label;
    }
    return o;
  });
  ac.stmts.push(stmt);
  return ac;
};
