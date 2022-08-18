import { bindAssembleUI, assembleText } from "./assemble.js";
import { ops, op_name, nop } from "./ops.js";
import { nib, chunk, $ } from "./utils.js";
import actionReducer from "./actionReducer.js";
import { mk_state } from "./state.js";

const state = mk_state();
const action = actionReducer(state);

function refresh(state) {
  const { env, obj, goff } = state;
  $("#format").innerText = goff ? "GOFF" : "OBJ";
  $("#obj").value = obj.join(",\n\n");

  $("#regs").value = env.regs.join("\n");
  $("#mem").value = env.mem;
  $("#dis").value = env.instr_txt.join("\n");
}

const loadTxtObj = async (path) => {
  const obj = await fetch(path)
    .then((r) => r.blob())
    .then((r) => r);
  const buf = await obj.arrayBuffer();
  return new Uint8Array(buf);
};

const chkBytes = (arr, bytes, offset = 0) =>
  bytes.every((b, i) => arr[offset + i] === b);

(async function main(state) {
  bindAssembleUI((obj) => {
    action("LOAD_OBJ", { obj });
    refresh(state);
  });

  const obj = await loadTxtObj("../obj/one.o");
  action("LOAD_OBJ", { obj });

  state.obj.forEach((o, i) => {
    console.log(i, o[1], o[2], o[3]);
  });

  const txt = state.obj.filter((r) => chkBytes(r, [0x2, 0xe3, 0xe7, 0xe3]));
  txt.forEach((t) => {
    const size = t[11];
    const code = t.slice(16, 16 + size);
    if (code[0] !== 0) {
      run(code, state.env);
    } else {
      console.log("DATA?", code);
    }
  });
  refresh(state);
})(state, action);

function run(obj, env) {
  env.mem[10] = 0xff;
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
    env.instr_txt.push(name + " " + opers.join("."));
    f(opers, regs, mem);
    pc += num;
  } else {
    console.log("wat op?", pc, op.toString(16), "(", op, ")");
  }
  return pc;
}
