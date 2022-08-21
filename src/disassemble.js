import { ops, op_name, nop } from "./ops.js";
import { nib, toHex, chunk, nib2_to_byte } from "./utils.js";

export function disassemble(code, showBytes) {
  let psw = 0;
  const output = [];
  while (psw < code.length) {
    let [newPsw, txt] = line(psw, code, showBytes);
    output.push(txt);
    psw = newPsw;
  }
  return output;
}

function line(psw, obj, showBytes) {
  let txt = "";
  const op = obj[psw++];
  const o = ops[op];
  if (o) {
    const [name, bytes, f] = o;
    const num = bytes - 1;
    const opers = obj
      .slice(psw, psw + num)
      .map(nib)
      .flat();
    if (showBytes) {
      const op_nibbles = chunk(opers, 2).map(([n1, n2]) =>
        nib2_to_byte(n1, n2)
      );

      txt =
        toHex(psw - 1) +
        ":" +
        [op, ...op_nibbles].map((v) => toHex(v, 0)).join(",");
    } else {
      txt = toHex(psw - 1) + ":" + name + " " + opers.join(".");
    }
    psw += num;
  } else {
    if (showBytes) {
      txt = toHex(psw - 1) + ":" + toHex(op) + "," + toHex(obj[psw++]);
    } else {
      txt = toHex(psw - 1) + ":??? 0x" + toHex(op) + " " + toHex(obj[psw++]);
    }
    console.log("wat op?", psw, toHex(op), "(", op, ")");
  }
  return [psw, txt];
}
