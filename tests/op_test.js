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
  env.mem[0] = 0b11100000;
  const obj = [code("OI")[0], 0b00000111, 0, 0, 0];
  step(obj, env);
  return env.mem[0] == 0b11100111 && env.psw.conditionCode === 1;
};

const op_ori_zero = () => {
  const env = mk_env();
  env.mem[0] = 0b00000000;
  const obj = [code("OI")[0], 0b00000000, 0, 0, 0];
  step(obj, env);
  return env.mem[0] == 0b00000000 && env.psw.conditionCode === 0;
};

const op_or_rr = () => {
  const env = mk_env([0b11100000, 0b00000111]);
  const obj = [code("OR")[0], 0x01];
  step(obj, env);
  return regval(env.regs[0]) == 0b11100111 && env.psw.conditionCode === 1;
};

const op_or_zero_rr = () => {
  const env = mk_env([0b00000000, 0b00000000]);
  const obj = [code("OR")[0], 0x01];
  step(obj, env);
  return regval(env.regs[0]) == 0b00000000 && env.psw.conditionCode === 0;
};

const op_and = () => {
  const env = mk_env();
  env.mem[0] = 0b10101111;
  const obj = [code("NI")[0], 0b11010001, 0, 0, 0];
  step(obj, env);
  return env.mem[0] == 0b10000001 && env.psw.conditionCode === 1;
};

const op_and_zero = () => {
  const env = mk_env();
  env.mem[0] = 0b11110000;
  const obj = [code("NI")[0], 0b00001111, 0, 0, 0];
  step(obj, env);
  return env.mem[0] == 0b00000000 && env.psw.conditionCode === 0;
};

const op_and_rr = () => {
  const env = mk_env([0b10101111, 0b11010001]);
  const obj = [code("NR")[0], 0x01];
  step(obj, env);
  return regval(env.regs[0]) == 0b10000001 && env.psw.conditionCode === 1;
};

const op_and_zero_rr = () => {
  const env = mk_env([0b11110000, 0b00001111]);
  const obj = [code("NR")[0], 0x01];
  step(obj, env);
  return regval(env.regs[0]) == 0b00000000 && env.psw.conditionCode === 0;
};

const op_xor = () => {
  const env = mk_env();
  env.mem[0] = 0b10111101;
  const obj = [code("XI")[0], 0b11000011, 0, 0, 0];
  step(obj, env);
  return env.mem[0] == 0b01111110 && env.psw.conditionCode === 1;
};

const op_xor_zero = () => {
  const env = mk_env();
  env.mem[0] = 0b10101010;
  const obj = [code("XI")[0], 0b10101010, 0, 0, 0];
  step(obj, env);
  return env.mem[0] == 0b00000000 && env.psw.conditionCode === 0;
};

const op_xor_rr = () => {
  const env = mk_env([0b10111101, 0b11000011]);
  const obj = [code("XR")[0], 0x01];
  step(obj, env);
  return regval(env.regs[0]) == 0b01111110 && env.psw.conditionCode === 1;
};

const op_xor_zero_rr = () => {
  const env = mk_env([0b11001100, 0b11001100]);
  const obj = [code("XR")[0], 0x01];
  step(obj, env);
  return regval(env.regs[0]) == 0b00000000 && env.psw.conditionCode === 0;
};

const op_sll = () => {
  const env = mk_env([0, 0b0000_0001]);
  env.mem[6] = 2;
  const obj = [code("SLL")[0], 0x10, 0x00, 0x03]; // 3  = 3 bytes before 6 (cause wonky 4byte)
  step(obj, env);
  return regval(env.regs[1]) == 0b00000100;
};

const op_sll_overflow = () => {
  const env = mk_env([0b0000_0001, 0b0100_0000]);
  env.mem[6] = 2; //below, 3  = 3 bytes before 6 (cause wonky 4byte)
  const obj = [code("SLL")[0], 0x10, 0x00, 0x3]; // shift left 2 places, overflow byte
  step(obj, env);
  return regval(env.regs[1]) == 0b0001_0000_0000;
};

const op_stc = () => {
  const env = mk_env([0, 0x000000ff]);
  const obj = [code("STC")[0], 0x10, 0x00, 0x00];
  step(obj, env);
  return env.mem[0] == 0xff;
};

const op_ic = () => {
  const env = mk_env([0, 0xff000000]);
  env.mem[0] = 0xff;
  const obj = [code("IC")[0], 0x10, 0x00, 0x00];
  step(obj, env);
  return regval(env.regs[1]) == 0xff0000ff;
};

export default [
  op_lr,
  op_l,
  op_cr,
  op_ahi_add1,
  op_ahi_add_ff,
  op_ahi_sub1,
  op_ori,
  op_ori_zero,
  op_or_rr,
  op_or_zero_rr,
  op_and,
  op_and_zero,
  op_and_rr,
  op_and_zero_rr,
  op_xor,
  op_xor_zero,
  op_xor_rr,
  op_xor_zero_rr,
  op_ic,
  op_sll,
  op_sll_overflow,
  op_stc,
];
