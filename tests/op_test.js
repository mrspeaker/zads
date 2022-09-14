import { step } from "../src/emulate.js";
import { ops, op_by_mn } from "../src/ops.js";
import { regval, fw_to_bytes, memset } from "../src/bytes.js";
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
  const obj = [...code("LR"), 0x01];

  step(obj, env);
  const { regs, psw } = env;
  const [r0, r1] = regs;
  return (
    regval(r1) === LIFE && regval(r0) === regval(r1) && psw.conditionCode === 0
  );
};

const op_l = () => {
  const env = mk_env();
  memset(fw_to_bytes(LIFE), env.mem, 0);
  const obj = [...code("L"), 0x00, 0x00, 0x00];

  step(obj, env);
  const { regs, psw } = env;
  const [r0] = regs;
  return regval(r0) === LIFE && psw.conditionCode === 0;
};

const op_cr = () => {
  const env = mk_env([LIFE - 1, LIFE]);
  const obj = [...code("CR"), 0x01];
  step(obj, env);
  return env.psw.conditionCode === 1;
};

const op_ahi_add1 = () => {
  const env = mk_env();
  const obj = [code("AHI")[0], 0x0a, 0x00, 0x01];
  step(obj, env);
  const [r0] = env.regs;
  return regval(r0) === 1;
};

const op_ahi_add_ff = () => {
  const env = mk_env([1]);
  const obj = [code("AHI")[0], 0x0a, 0x00, 0xff];
  step(obj, env);
  const [r0] = env.regs;
  return regval(r0) === 0x100;
};

const op_ahi_sub1 = () => {
  const env = mk_env();
  const obj = [code("AHI")[0], 0x0a, 0xff, 0xff];
  step(obj, env);
  const [r0] = env.regs;
  return regval(r0) === 0xffffffff;
};

const op_ori = () => {
  const env = mk_env();
  const obj = [code("OI")[0], 0b11111111, 0, 0, 0];
  step(obj, env);
  console.log(env);
  return false;
};

export default [
  op_lr,
  op_l,
  op_cr,
  op_ahi_add1,
  op_ahi_add_ff,
  op_ahi_sub1,
  op_ori,
];
