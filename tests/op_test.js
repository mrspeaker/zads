import { step } from "../src/emulate.js";
import { ops, op_by_mn } from "../src/ops.js";
import { byte_from, regval, fw_to_bytes } from "../src/bytes.js";

const op_lr = () => {
  const env = {
    regs: [fw_to_bytes(10), fw_to_bytes(42)],
    psw: { pc: 0, conditionCode: 0 },
  };
  const op = ops[op_by_mn["LR"]];
  const obj = [...op.code, byte_from(0, 1)];

  step(obj, env);

  const { regs, psw } = env;
  const [r0, r1] = regs;
  return (
    regval(r1) === 42 && regval(r0) === regval(r1) && psw.conditionCode === 0
  );
};


export default [op_lr];
