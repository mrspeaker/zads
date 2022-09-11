import { disassemble } from "./disassemble.js";
import { vic_regs, pal_to_rgb } from "./vic.js";

import { $, toHex, formatObjRecord } from "./utils.js";
import { memval_f, bytes_to_fw } from "./bytes.js";

function render(state) {
  const { machine, program, zads, programs, selected } = state;
  const { showObjBytes } = zads;

  $("#btnUpdate").disabled = !showObjBytes;

  if (program) {
    const { goff, obj, src, code_txt, code, symbols } = program;
    $("#format").innerText = goff ? "GOFF" : "OBJ";
    $("#src").value = src;
    $("#obj").value = showObjBytes
      ? obj.map((v) => v.map((vv) => toHex(vv))).join("\n")
      : obj.map(formatObjRecord).join("\n----------------\n");
    $("#emu").value = code_txt?.join("\n");
    $("#dis").value = disassemble(code, symbols, showObjBytes).join("\n");
  }

  if (machine) {
    const { regs, mem, psw, vic } = machine;
    $("#regs").value = regs
      .map((v) => bytes_to_fw(...v))
      .map((v, i) => (i < 10 ? " " : "") + i + ": " + toHex(v, 8))
      .join("\n");
    $("#mem").value = mem.map((m) => toHex(m));
    $("#psw_cc").value = psw.conditionCode;
    $("#psw_pc").value = toHex(psw.pc);
    renderScreen(mem, vic);
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

function renderScreen(mem, vic) {
  const { regs } = vic;

  // Copy regs
  let offset = 100;
  [...Array(regs.length)].fill(0).map((_, i) => {
    regs[i] = mem[i + offset];
  });

  const mval = (reg_name) => memval_f(regs, reg_name);

  const c = $("#screen").getContext("2d");
  const imgData = c.getImageData(0, 0, c.canvas.width, c.canvas.height - 10);
  imgData.data.forEach((d, i) => {
    imgData.data[i * 4] = mem[i];
    imgData.data[i * 4 + 1] = mem[i];
    imgData.data[i * 4 + 2] = mem[i];
    imgData.data[i * 4 + 3] = 255;
  });

  c.fillStyle = pal_to_rgb(mval(vic_regs.BG_COL));
  c.fillRect(0, 0, c.canvas.width, c.canvas.height);
  c.putImageData(imgData, 0, 0);
  c.fillStyle = pal_to_rgb(mval(vic_regs.FG_COL));
  c.fillRect(mval(vic_regs.SPR1_X), mval(vic_regs.SPR1_Y), 2, 2);
}

export default render;
