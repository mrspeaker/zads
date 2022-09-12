import { step } from "../src/emulate.js";
import { ops, op_by_mn } from "../src/ops.js";
import { byte_from, regval, fw_to_bytes, memcpy } from "../src/bytes.js";
import { mk_mem } from "../src/state.js";

const mk_env = (regvals = [0], mem = 32) => ({
  regs: regvals.map(fw_to_bytes),
  mem: mk_mem(mem),
  psw: { pc: 0, conditionCode: 0 },
});

const op_lr = () => {
  const env = mk_env([10, 42]);
  const op = ops[op_by_mn["LR"]];
  const obj = [...op.code, byte_from(0, 1)];

  step(obj, env);

  const { regs, psw } = env;
  const [r0, r1] = regs;
  return (
    regval(r1) === 42 && regval(r0) === regval(r1) && psw.conditionCode === 0
  );
};

const op_l = () => {
  const env = mk_env();
  const INIT_VAL = 3;
  memcpy([0, 0, 0, INIT_VAL], env.mem, 0);

  const op = ops[op_by_mn["L"]];
  const obj = [...op.code, 0x00, 0x00, 0x00];

  step(obj, env);

  const { regs, psw } = env;
  const [r0] = regs;
  return regval(r0) === INIT_VAL && psw.conditionCode === 0;
};

export default [op_lr, op_l];
