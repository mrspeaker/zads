import { step } from "../src/emulate.js";
import { ops, op_by_mn } from "../src/ops.js";
import { from_nibs, regval, fw_to_bytes, memcpy } from "../src/bytes.js";
import { mk_mem } from "../src/state.js";

const LIFE = 42;
const code = (mn) => ops[op_by_mn[mn]].code;
const mk_env = (regvals = [0], mem = 32) => ({
  regs: regvals.map(fw_to_bytes),
  mem: mk_mem(mem),
  psw: { pc: 0, conditionCode: 0 },
});

const op_lr = () => {
  const env = mk_env([10, LIFE]);
  const obj = [...code("LR"), from_nibs(0, 1)];

  step(obj, env);
  const { regs, psw } = env;
  const [r0, r1] = regs;
  return (
    regval(r1) === LIFE && regval(r0) === regval(r1) && psw.conditionCode === 0
  );
};

const op_l = () => {
  const env = mk_env();
  memcpy(fw_to_bytes(LIFE), env.mem, 0);
  const obj = [...code("L"), 0x00, 0x00, 0x00];

  step(obj, env);
  const { regs, psw } = env;
  const [r0] = regs;
  return regval(r0) === LIFE && psw.conditionCode === 0;
};

const op_cr = () => {
  const env = mk_env([LIFE - 1, LIFE]);
  const obj = [...code("CR"), from_nibs(0, 1)];
  step(obj, env);
  return env.psw.conditionCode === 1;
};

export default [op_lr, op_l, op_cr];
