import { disassemble } from "./disassemble.js";
import { vic_regs, pal_to_rgb, pal_to_hex } from "./vic.js";

import { chunk, $, toHex, formatObjRecord } from "./utils.js";
import { memval, to_nibs, bytes_to_fw } from "./bytes.js";

function render(state) {
  const { machine, program, zads, programs, selected, cyclesPerFrame } = state;
  const { showObjBytes } = zads;

  $("#btnUpdate").disabled = !showObjBytes;
  $("#hz").innerText = 60 * cyclesPerFrame;

  if (program) {
    const { goff, obj, src, code_txt, code, symbols } = program;
    $("#format").innerText = goff ? "GOFF" : "OBJ";
    $("#src").value = src;
    $("#obj").value = showObjBytes
      ? obj.map((v) => v.map((vv) => toHex(vv))).join("\n")
      : obj.map(formatObjRecord).join("\n\n");
    $("#emu").value = code_txt?.join("\n");
    $("#dis").value = disassemble(code, symbols, showObjBytes).join("\n");
  }

  if (machine) {
    const { regs, mem, psw, vic } = machine;
    $("#regs").value = [...regs, ...chunk(vic.regs, 4)]
      .map(bytes_to_fw)
      .map((v, i) => (i % 16 < 10 ? " " : "") + (i % 16) + ": " + toHex(v, 8))
      .join("\n");
    $("#mem").value = mem
      .map((m) => toHex(m))
      .map((v) => (v === "00" ? "__" : v));
    $("#psw_cc").value = psw.conditionCode;
    $("#psw_pc").value = toHex(psw.pc);
    renderScreen(mem, vic);
    renderMemViz(mem);

    $("#btnRun").className = psw.halt ? "ok" : "fail";
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
  const { regs, base, screen } = vic;

  const mval = (reg_name) => memval(regs, reg_name);

  const c = $("#screen").getContext("2d");
  c.fillStyle = pal_to_rgb(mval(vic_regs.BG_COL));
  c.fillRect(0, 0, c.canvas.width, c.canvas.height);

  const scrmem = base + screen.memp;
  const imgData = c.getImageData(0, 0, c.canvas.width, c.canvas.height);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const c = pal_to_rgb(mem[(scrmem + i / 4) % mem.length] % 16);
    imgData.data[i] = c[0];
    imgData.data[i + 1] = c[1];
    imgData.data[i + 2] = c[2];
    imgData.data[i + 3] = 255;
  }
  c.putImageData(imgData, 0, 0);

  c.fillStyle = pal_to_hex(mval(vic_regs.SPR1_COL));
  c.fillRect(mval(vic_regs.SPR1_X), mval(vic_regs.SPR1_Y), 2, 2);
  c.fillStyle = pal_to_hex(mval(vic_regs.SPR2_COL));
  c.fillRect(mval(vic_regs.SPR2_X), mval(vic_regs.SPR2_Y), 2, 2);
}

function renderMemViz(mem) {
  const c = $("#memviz").getContext("2d");
  const imgData = c.getImageData(0, 0, c.canvas.width, c.canvas.height - 10);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const v = to_nibs(mem[i / 4]);
    const c = pal_to_rgb(v[1] === 0 ? v[0] : v[1]);
    imgData.data[i] = c[0];
    imgData.data[i + 1] = c[1];
    imgData.data[i + 2] = c[2];
    imgData.data[i + 3] = 255;
  }
  c.putImageData(imgData, 0, 0);
}

export default render;
