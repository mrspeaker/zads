import { bindAssembleUI, assembleText } from "./assemble.js";
import { $ } from "./utils.js";
import actionReducer from "./actionReducer.js";
import { mk_state } from "./state.js";
import { run } from "./emulate.js";

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

