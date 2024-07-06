import { get_op } from "./ops.js";
import { toHex, chunk } from "./utils.js";
import { to_nibs, from_nibs } from "./bytes.js";

/**
 * Disassembles all object code into readable line
 * @param {number[]} obj program object code array
 * @param {object} symbol symbol table
 * @param {bool} showBytes show mnemonics or byte
 * @returns {string[]} disassembled listing
 */
export function disassemble(code, symbols, showBytes) {
  let psw = 0;
  const output = [];
  const symloc = Object.entries(symbols).reduce((ac, [k, v]) => {
    ac[v.pc] = { label: k, len: v.len, pc: v.pc };
    return ac;
  }, {});
  while (psw < code.length) {
    const symbol = symloc[psw];
    let [newPsw, txt] = disassemble_line(psw, code, symbol, showBytes);
    output.push(txt);
    psw = newPsw;
  }
  return output;
}

/**
 * Disassembles next object code instruction into readable line
 * @param {number} psw program counter
 * @param {number[]} obj program object code array
 * @param {object} symbol symbol table
 * @param {bool} showBytes show mnemonics or byte
 * @returns {[number, string]} psw and disassembled line
 */
export function disassemble_line(psw, obj, symbol, showBytes) {
  let txt = "";
  const op = get_op(obj, psw);
  const pc_loc = toHex(psw) + ": ";
  if (op) {
    const { mn, len } = op;
    const opers = obj
      .slice(psw + 1, psw + len)
      .map((v) => to_nibs(v))
      .flat();

    if (showBytes) {
      const operands_nibbles = chunk(opers, 2).map(from_nibs);
      const op1op2 = op.code > 0xff ? op.code >> 4 : op.code;
      txt =
        pc_loc +
        [op1op2, ...operands_nibbles].map((v) => toHex(v, 2)).join(",");
    } else {
      txt =
        pc_loc +
        mn.padEnd(3, " ") +
        " " +
        chunk(opers, 2)
          .map((ch) => ch.join("."))
          .join(" ");
    }
    psw += len;
  } else {
    // Data (or error!)
    const b1 = obj[psw];
    if (b1 > 0) {
      console.log("wat op?", psw, toHex(b1), "(", b1, ")");
    }

    const op_code_txt = toHex(b1);
    if (showBytes) {
      const bb = obj[psw + 1];
      txt = pc_loc + op_code_txt + "," + toHex(bb);
      psw += 2;
    } else {
      // Group the data
      if (symbol) {
        txt =
          pc_loc +
          "" +
          symbol.label +
          ":" +
          obj.slice(psw, psw + symbol.len).map((v) => toHex(v) + "");
        psw += symbol.len;
      } else {
        txt = pc_loc + "??? 0x" + op_code_txt + " " + toHex(obj[psw + 1]);
        psw += 2;
      }
    }
  }
  return [psw, txt];
}
