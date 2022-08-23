import { disassemble } from "./disassemble.js";

import { $, toHex, formatObjRecord } from "./utils.js";
import { fullword } from "./bytes.js";

function render(state) {
  const { machine, program, zads } = state;
  const { showObjBytes } = zads;

  $("#btnUpdate").disabled = !showObjBytes;

  if (program) {
    const { goff, obj, src, code_txt, code } = program;
    $("#format").innerText = goff ? "GOFF" : "OBJ";
    $("#src").value = src;
    $("#obj").value = obj.map(formatObjRecord).join("\n----------------\n");
    $("#emu").value = code_txt?.join("\n");
    $("#dis").value = disassemble(code, showObjBytes).join("\n");
  }

  if (machine) {
    const { regs, mem, psw } = machine;
    $("#regs").value = regs
      .map((v) => fullword(...v))
      .map((v, i) => (i < 10 ? " " : "") + i + ": " + toHex(v, 8))
      .join("\n");
    $("#mem").value = mem.map((m) => toHex(m));
    $("#psw_cc").value = psw.conditionCode;
      $("#psw_pc").value = toHex(psw.pc);
  }
}

export default render;
