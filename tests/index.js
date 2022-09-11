import { disassemble } from "../src/disassemble.js";
import { step } from "../src/emulate.js";
import { ops, op_by_mn } from "../src/ops.js";

const dis_lr = () => {
  const bytes = disassemble([0x18, 0x12], {}, false);
  console.log("00: LR 1.2", bytes);
};

const op_lr = () => {
  const env = { regs: [[0, 0, 0, 0], [0, 0, 0, 1]], psw: { pc: 0 } };
  const op = ops[op_by_mn["LR"]];
  const obj = [...op.code, 1];
  const out = step(obj, env);
  console.log(out, JSON.stringify(env));
};

const tests = () => {
  dis_lr();
  op_lr();
};

function main() {
  tests();
}
main();
