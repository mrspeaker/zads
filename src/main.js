import { bindAssembleUI, assembleText } from "./assemble.js";
import {
  $,
  $click,
  eb2asc,
  toHex,
  memcpy,
  chkBytes,
  formatObjRecord,
  loadTxtObj,
} from "./utils.js";

import actionReducer from "./actionReducer.js";
import { mk_state } from "./state.js";
import { run } from "./emulate.js";
import { disassemble } from "./disassemble.js";

const state = mk_state();
const action = actionReducer(state, render);

function render(state) {
  const { env, obj, code, goff, showObjBytes } = state;
  $("#format").innerText = goff ? "GOFF" : "OBJ";
  $("#obj").value = obj.map(formatObjRecord).join("\n\n");
  $("#regs").value = env.regs.map((v) => v.map((x) => toHex(x))).join("\n");
  $("#mem").value = env.mem.map((m) => toHex(m));
  $("#emu").value = env.code_txt?.join("\n");
  $("#dis").value = disassemble(code, showObjBytes).join("\n");
  $("#psw_cc").value = env.psw.conditionCode;
}

(async function main(state) {
  bindAssembleUI((obj) => {
    action("LOAD_OBJ", { obj });
  });

  $click("#btnObjBytes", () => action("OBJ_BYTES"));

  $click("#btnUpdate", () => {
    const code = $("#dis")
      .value.split("\n")
      .map((r) =>
        r
          .slice(3)
          .split(",")
          .map((v) => parseInt(v, 16))
      )
      .flat();

    action("UPDATE_OBJ", { code });
  });

  $click("#btnRun", () => action("RUN"));

  const obj = await loadTxtObj("../obj/max.o");
  action("LOAD_OBJ", { obj });

  state.obj.forEach((o, i) => {
    const [_, a, b, c] = o;
    console.log(i, [a, b, c].map((c) => eb2asc(c)).join(""));
  });

  action("RUN");
})(state, action);
