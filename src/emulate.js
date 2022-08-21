import { ops, op_name, nop } from "./ops.js";
import { nib, toHex } from "./utils.js";

export function run(obj, env) {
  env.psw.pc = 0; // Ah, not PC but Location Counter!
  env.psw.halt = false;
  const code_txt = [];
  while (!env.psw.halt && env.psw.pc < obj.length) {
    step(obj, env, code_txt);
  }
  env.code_txt = code_txt;
}

function step(obj, env, code_txt) {
  const { regs, mem, psw } = env;
  const op = obj[psw.pc++];
  const o = ops[op];
  if (o) {
    const { op: name, len: bytes, f } = o;
    const num = bytes - 1;
    const opers = obj
      .slice(psw.pc, psw.pc + num)
      .map(nib)
      .flat();
    code_txt.push(toHex(psw.pc - 1) + ":" + name + " " + opers.join("."));
    f(opers, regs, mem, psw);
    psw.pc += num;
  } else {
    code_txt.push(toHex(psw.pc - 1) + ": ??? 0x" + op.toString(16));

    console.log("op?", psw.pc, toHex(op), "(", op, ")");
  }
  return psw.pc;
}
