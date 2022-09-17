import { get_op } from "./ops.js";
import { toHex } from "./utils.js";
import { to_nibs, regset } from "./bytes.js";

export function run(obj, env) {
  env.psw.pc = 0;
  // TODO: need to relocate prg.
  regset(env.regs[15], 0);

  env.psw.halt = false;
  const exe_txt = [];
  while (!env.psw.halt && env.psw.pc < obj.length) {
    exe_txt.push(step(obj, env, exe_txt));
  }
  return exe_txt;
}

export function step(obj, env) {
  const { regs, mem, psw } = env;
  const oldpc = psw.pc;
  const op = get_op(obj, psw.pc++);
  if (!op) {
    console.log("op?", psw.pc, "(", obj[psw.pc], ")");
    return toHex(psw.pc - 1) + ":??? " + obj[psw.pc];
  }

  // Execute operation
  const { mn, len, f } = op;
  const num = len - 1;
  const opers = obj
    .slice(psw.pc, psw.pc + num)
    .map((v) => to_nibs(v))
    .flat();
  f(opers, regs, mem, psw);
  psw.pc += num;

  return toHex(oldpc) + ":" + mn + " " + opers.join(".");
}
