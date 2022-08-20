import { ops, op_name, nop } from "./ops.js";
import { nib  } from "./utils.js";

export function disassemble(obj, env) {
  env.pc = 0; // Ah, not PC but Location Counter!
  while (env.pc < obj.length) {
    env.pc = step(obj, env);
  }
}

function step(obj, env) {
  const { regs, mem } = env;
  let { pc } = env;
  const op = obj[pc++];
  const o = ops[op];
  if (o) {
    const [name, bytes, f] = o;
    const num = bytes - 1;
    const opers = obj
      .slice(pc, pc + num)
      .map(nib)
      .flat();
    console.log(name, f === nop ? "-NOP-" : ".", opers);
      env.instr_txt.push((pc-1).toString(16) + ":" + name + " " + opers.join("."));
    f(opers, regs, mem);
    pc += num;
  } else {
    console.log("wat op?", pc, op.toString(16), "(", op, ")");
  }
  return pc;
}
