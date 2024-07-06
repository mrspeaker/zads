import { get_op } from "./ops.js";
import { toHex, chunk } from "./utils.js";
import { to_nibs, from_nibs } from "./bytes.js";

export function disassemble(code, symbols, showBytes) {
  let psw = 0;
  const output = [];
  const symloc = Object.entries(symbols).reduce((ac, [k, v]) => {
    ac[v.pc] = { label: k, len: v.len, pc: v.pc };
    return ac;
  }, {});
  while (psw < code.length) {
    const symbol = symloc[psw];
    let [newPsw, txt] = line(psw, code, symbol, showBytes);
    output.push(txt);
    psw = newPsw;
  }
  return output;
}

function line(psw, obj, symbol, showBytes) {
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
      const op_nibbles = chunk(opers, 2).map(from_nibs);
      // TODO: something wrong when updating AHI op
      // (load prg, hit update-obj see diff
      txt =
        pc_loc + [op.code[0], ...op_nibbles].map((v) => toHex(v, 2)).join(",");
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
