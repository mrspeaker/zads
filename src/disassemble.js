import { ops, get_op } from "./ops.js";
import { toHex, chunk } from "./utils.js";
import { nib, nib2_to_byte } from "./bytes.js";

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
  const op = get_op(obj, psw++);
  const pc_loc = toHex(psw - 1) + ": ";
  if (op) {
    const { mn, len } = op;
    const num = len - 1;
    const opers = obj
      .slice(psw, psw + num)
      .map(nib)
      .flat();
    if (showBytes) {
      const op_nibbles = chunk(opers, 2).map(([n1, n2]) =>
        nib2_to_byte(n1, n2)
      );

      txt =
        pc_loc + [...op.code, ...op_nibbles].map((v) => toHex(v, 0)).join(",");
    } else {
      txt = pc_loc + mn + " " + opers.join(".");
    }
    psw += num;
  } else {
    // Data (or error!)
    const b1 = obj[psw];
    if (b1 > 0) {
      console.log("wat op?", psw, toHex(b1), "(", b1, ")");
    }

    const op_code_txt = toHex(b1);
    if (showBytes) {
      txt = pc_loc + op_code_txt + "," + toHex(obj[psw++]);
    } else {
      // Group the data
      if (symbol) {
        txt =
          pc_loc +
          "" +
          symbol.label +
          ":" +
          obj.slice(psw - 1, psw + symbol.len - 1).map((v) => toHex(v) + "");
        psw += symbol.len - 1;
      } else {
        txt = pc_loc + "??? 0x" + op_code_txt + " " + toHex(obj[psw++]);
      }
    }
  }
  return [psw, txt];
}
