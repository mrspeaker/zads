import { step } from "../src/emulate.js";
import { ops, op_by_mn, get_op } from "../src/ops.js";
import {
  regval,
  fw_to_bytes,
  memset,
  to_nibs,
  from_nibs,
} from "../src/bytes.js";
import { mk_mem } from "../src/state.js";

const LIFE = 42;
const code = (mn) => ops[op_by_mn[mn]].code;
const mk_env = (regvals = [0], mem = 32) => ({
  regs: regvals.map(fw_to_bytes),
  mem: mk_mem(mem),
  psw: { pc: 0, conditionCode: 0 },
});
const R0 = 0;
const R1 = 1;
const R2 = 2;

const get_op_rr = () => {
  const obj = [0x18, 0x12]; // LR 1,2
  const psw = 0;
  const op = get_op(obj, psw);
  return op && op.mn == "LR";
};

const get_op_ri = () => {
  // RI format: op1, op2, r1, op3, i1-i4
  const obj = [0xa7, 0x1a, 0x00, 0x01]; // AHI 1, 1
  const psw = 0;
  const op = get_op(obj, psw);
  return op && op.mn === "AHI";
};

const op_nul = () => {
  const env = mk_env();
  const obj = [0x00];

  env.psw.halt = false;
  step(obj, env);
  // Ensure halts on null op
  return env.psw.halt;
};

const op_lr = () => {
  const env = mk_env([10, LIFE]);
  const obj = [code("LR"), from_nibs([R0, R1])];

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
  const obj = [code("L"), 0x00, 0x00, 0x00];

  step(obj, env);
  const { regs, psw } = env;
  const [r0] = regs;
  return regval(r0) === LIFE && psw.conditionCode === 0;
};

const op_cr = () => {
  const env = mk_env([LIFE - 1, LIFE]);
  const obj = [code("CR"), 0x01];
  step(obj, env);
  return env.psw.conditionCode === 1;
};

const op_ahi_add1 = () => {
  const env = mk_env([0]);
  const op_code = to_nibs(code("AHI"), 3);
  // RI format: OP1 OP2 R1 Op3 I1 I2 I3 I4
  const obj = [
    from_nibs([op_code[0], op_code[1]]),
    from_nibs([R0, op_code[2]]),
    0x00,
    0x01, // add 1
  ];
  step(obj, env);
  const [r0] = env.regs;
  return regval(r0) === 0x01;
};

const op_ahi_add_ff = () => {
  const env = mk_env([1]);
  const op_code = to_nibs(code("AHI"), 3);
  // RI format: OP1 OP2 R1 Op3 I1 I2 I3 I4
  const obj = [
    from_nibs([op_code[0], op_code[1]]),
    from_nibs([R0, op_code[2]]),
    0x00,
    0xff, // add 0xff
  ];
  step(obj, env);
  const [r0] = env.regs;
  return regval(r0) === 0x100;
};

const op_ahi_sub1 = () => {
  const env = mk_env();
  const op_code = to_nibs(code("AHI"), 3);
  // RI format: OP1 OP2 R1 Op3 I1 I2 I3 I4
  const obj = [
    from_nibs([op_code[0], op_code[1]]),
    from_nibs([R0, op_code[2]]),
    0xff,
    0xff, // sub 1
  ];
  step(obj, env);
  const [r0] = env.regs;
  return regval(r0) === 0xffffffff;
};

const op_ori = () => {
  const env = mk_env();
  env.mem[0] = 0b11100000;
  const obj = [code("OI"), 0b00000111, 0, 0, 0];
  step(obj, env);
  return env.mem[0] == 0b11100111 && env.psw.conditionCode === 1;
};

const op_ori_zero = () => {
  const env = mk_env();
  env.mem[0] = 0b00000000;
  const obj = [code("OI"), 0b00000000, 0, 0, 0];
  step(obj, env);
  return env.mem[0] == 0b00000000 && env.psw.conditionCode === 0;
};

const op_or_rr = () => {
  const env = mk_env([0b11100000, 0b00000111]);
  const obj = [code("OR"), 0x01];
  step(obj, env);
  return regval(env.regs[0]) == 0b11100111 && env.psw.conditionCode === 1;
};

const op_or_zero_rr = () => {
  const env = mk_env([0b00000000, 0b00000000]);
  const obj = [code("OR"), 0x01];
  step(obj, env);
  return regval(env.regs[0]) == 0b00000000 && env.psw.conditionCode === 0;
};

const op_and = () => {
  const env = mk_env();
  env.mem[0] = 0b10101111;
  const obj = [code("NI"), 0b11010001, 0, 0, 0];
  step(obj, env);
  return env.mem[0] == 0b10000001 && env.psw.conditionCode === 1;
};

const op_and_zero = () => {
  const env = mk_env();
  env.mem[0] = 0b11110000;
  const obj = [code("NI"), 0b00001111, 0, 0, 0];
  step(obj, env);
  return env.mem[0] == 0b00000000 && env.psw.conditionCode === 0;
};

const op_and_rr = () => {
  const env = mk_env([0b10101111, 0b11010001]);
  const obj = [code("NR"), 0x01];
  step(obj, env);
  return regval(env.regs[0]) == 0b10000001 && env.psw.conditionCode === 1;
};

const op_and_zero_rr = () => {
  const env = mk_env([0b11110000, 0b00001111]);
  const obj = [code("NR"), 0x01];
  step(obj, env);
  return regval(env.regs[0]) == 0b00000000 && env.psw.conditionCode === 0;
};

const op_mvi = () => {
  const env = mk_env([0x00]);
  env.mem[0] = 0x1;
  env.mem[1] = 0x0;
  const imm = 0x02;
  const obj = [code("MVI"), imm, 0x00, 0x01];
  step(obj, env);
  // Make sure mvi only affects 1 byte
  return env.mem[0] === 0x1 && env.mem[1] === 0x02;
};

const op_xor = () => {
  const env = mk_env();
  env.mem[0] = 0b10111101;
  const obj = [code("XI"), 0b11000011, 0, 0, 0];
  step(obj, env);
  return env.mem[0] == 0b01111110 && env.psw.conditionCode === 1;
};

const op_xor_zero = () => {
  const env = mk_env();
  env.mem[0] = 0b10101010;
  const obj = [code("XI"), 0b10101010, 0, 0, 0];
  step(obj, env);
  return env.mem[0] == 0b00000000 && env.psw.conditionCode === 0;
};

const op_xor_rr = () => {
  const env = mk_env([0b10111101, 0b11000011]);
  const obj = [code("XR"), 0x01];
  step(obj, env);
  return regval(env.regs[0]) == 0b01111110 && env.psw.conditionCode === 1;
};

const op_xor_zero_rr = () => {
  const env = mk_env([0b11001100, 0b11001100]);
  const obj = [code("XR"), 0x01];
  step(obj, env);
  return regval(env.regs[0]) == 0b00000000 && env.psw.conditionCode === 0;
};

const op_sll = () => {
  const env = mk_env([0, 0b0000_0001]);
  env.mem[6] = 2;
  const obj = [code("SLL"), 0x10, 0x00, 0x03]; // 3  = 3 bytes before 6 (cause wonky 4byte)
  step(obj, env);
  return regval(env.regs[1]) == 0b00000100;
};

const op_sll_overflow = () => {
  const env = mk_env([0b0000_0001, 0b0100_0000]);
  env.mem[6] = 2; //below, 3  = 3 bytes before 6 (cause wonky 4byte)
  const obj = [code("SLL"), 0x10, 0x00, 0x3]; // shift left 2 places, overflow byte
  step(obj, env);
  return regval(env.regs[1]) == 0b0001_0000_0000;
};

const op_stc = () => {
  const env = mk_env([0, 0x000000ff]);
  const obj = [code("STC"), 0x10, 0x00, 0x00];
  step(obj, env);
  return env.mem[0] == 0xff;
};

const op_ic = () => {
  const env = mk_env([0, 0xff000000]);
  env.mem[0] = 0xff;
  const obj = [code("IC"), 0x10, 0x00, 0x00];
  step(obj, env);
  return regval(env.regs[1]) == 0xff0000ff;
};

const op_mvc = () => {
  return false;
};

export default [
  get_op_rr,
  get_op_ri,
  op_nul,
  op_lr,
  op_l,
  op_cr,
  op_ahi_add1,
  op_ahi_add_ff,
  op_ahi_sub1,
  op_mvi,
  op_mvc,
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
