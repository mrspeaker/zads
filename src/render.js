import { disassemble } from "./disassemble.js";

import { $, toHex, formatObjRecord } from "./utils.js";
import { bytes_to_fw } from "./bytes.js";

function render(state) {
  const { machine, program, zads, programs, selected } = state;
  const { showObjBytes } = zads;

  $("#btnUpdate").disabled = !showObjBytes;

  if (program) {
    const { goff, obj, src, code_txt, code } = program;
    $("#format").innerText = goff ? "GOFF" : "OBJ";
    $("#src").value = src;
    $("#obj").value = showObjBytes
      ? obj.map((v) => v.map((vv) => toHex(vv))).join("\n")
      : obj.map(formatObjRecord).join("\n----------------\n");
    $("#emu").value = code_txt?.join("\n");
    $("#dis").value = disassemble(code, showObjBytes).join("\n");
  }

  if (machine) {
    const { regs, mem, psw } = machine;
    $("#regs").value = regs
      .map((v) => bytes_to_fw(...v))
      .map((v, i) => (i < 10 ? " " : "") + i + ": " + toHex(v, 8))
      .join("\n");
    $("#mem").value = mem.map((m) => toHex(m));
    $("#psw_cc").value = psw.conditionCode;
    $("#psw_pc").value = toHex(psw.pc);
    renderScreen(mem);
  }

  const sel = $("#programs");
  while (sel.length > 1) {
    sel.remove(sel.length - 1);
  }
  Object.keys(programs).forEach((k) => {
    const opt = document.createElement("option");
    opt.text = k;
    opt.value = k;
    opt.selected = k === selected;
    sel.add(opt);
  });
}

function renderScreen(mem) {
  const c = $("#screen").getContext("2d");
  const imgData = c.getImageData(0, 0, c.canvas.width, c.canvas.height);
  imgData.data.forEach((d, i) => {
    imgData.data[i * 4] = mem[i];
    imgData.data[i * 4 + 1] = mem[i];
    imgData.data[i * 4 + 2] = mem[i];
    imgData.data[i * 4 + 3] = 255;
  });
  c.clearRect(0, 0, c.canvas.width, c.canvas.height);
  c.putImageData(imgData, 0, 0);
}

export default render;
