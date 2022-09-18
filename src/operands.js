import { ops } from "./ops.js";
import { to_nibs } from "./bytes.js";
import { parseImmediate, parseBaseDisplace } from "./assemble.js";

export const tokenizeOperands = (ops) => {
  // comma, followed by NOT open paren, stuff, close paren.
  // Splits on commas, but not inside parens (eg `L R1,0(,R15)`)
  return ops?.split(/,(?![^(]*\))/g) ?? [];
};

//const literalExpaned... .reduce(expandLiterals, { lits: [], stmts: [] });
// TODO: need to inject literals somewhere - with corresponding PC,
// _before_ assebmbling the statement. Sould be LTORG
//  console.log("Literals:", expanded.lits);

export const parseOperands = (s, symbols, eqs, base) => {
  const { stmt, bytes, type } = s;
  console.log("ddd", eqs, s.stmt.operands);

  /*
  Operand is:
  - Zero or more arguments of:
  -- Expression | Exp(Exp) | Exp(Exp,Exp) or Exp(,Exp)
  - Expression:
  -- Term | Arithemetic combination of terms
  - Term:
  -- A symbol | Loc Counter Reference | Symbol Attribute | Self-defining term | Literal
  - Self-defining term:
  -- Decimal | Hexadecimal | Binary | Character | Graphic (G'<.A>')
  */

  // TODO: better equ matching
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
      if (enc.length > 2) {
        console.warn("nop, rong length", enc);
      }
      bytes.operands.push(...enc[0], ...enc[1]);
      break;
    case "RI":
      {
        // extract extra opcode byte
        const extra = ops[bytes.op_code[0]].code[1];
        bytes.operands.push(...enc[0], extra, ...enc[1]);
      }
      break;
    case "SI":
      // I2I2 B1 D1D1D1
      bytes.operands.push(...enc[1], ...enc[0].slice(1));
      break;
    case "SS":
      // L1L1 B1 D1D1D1 B2 D2D2D2
      console.log("eg MVC. TODO!");
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

// Return (mostly?) nibbles
const parseOperand = (o, symbols, base, type, idx, mn) => {
  if (type === "DC") {
    return parseImmediate(o);
  }
  const otype =
    {
      RR: ["R", "R"],
      RX: ["R", "X"],
      SI: ["S", "I"],
      SS: ["I", "X", "X"],
      RI: ["R", "I"],
    }[type] || [];
  const oidx = otype[idx];
  if (type && type !== "DC" && (!otype || !oidx)) {
    console.warn("What's this operand?", type, o, idx, mn);
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
