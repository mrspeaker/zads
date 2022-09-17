import { ops } from "./ops.js";
import { to_nibs } from "./bytes.js";
import { parseImmediate, parseBaseDisplace } from "./assemble.js";

/*
  Operand is:
  - Zero or more arguments of:
  -- Expression | Exp(Exp) | Exp(Exp,Exp) or Exp(,Exp)
  - Expression:
  -- Term | Arithemetic combination of terms
  - Term:
  -- A symbol literal | Loc Counter Reference | Symbol Attribute | Self-defining term
  - Self-defining term:
  -- Decimal | Hexadecimal | Binary | Character | Graphic (G'<.A>')
 */

export const parseOperands = (s, symbols, base) => {
  const { stmt, bytes, type } = s;

  console.log(stmt.operands);

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

export const parseDataOperand = (d) => {
  const numReps = parseInt(d, 10);
  if (isNaN(numReps)) {
    return parseImmediate(d);
  }
  // Expand repetitions
  const value = d.slice((numReps + "").length);
  return new Array(numReps).fill(parseImmediate(value)).flat();
};
