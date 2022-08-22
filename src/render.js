import { disassemble } from "./disassemble.js";

import { $, eb2asc, toHex, formatObjRecord, loadTxtObj } from "./utils.js";

function render(state) {
  const { env, obj, code, goff, showObjBytes } = state;
  $("#format").innerText = goff ? "GOFF" : "OBJ";
    $("#obj").value = obj.map(formatObjRecord).join("\n----------------\n");
  $("#regs").value = env.regs.map((v) => v.map((x) => toHex(x))).join("\n");
  $("#mem").value = env.mem.map((m) => toHex(m));
  $("#emu").value = env.code_txt?.join("\n");
  $("#dis").value = disassemble(code, showObjBytes).join("\n");
  $("#psw_cc").value = env.psw.conditionCode;
}

export default render;
