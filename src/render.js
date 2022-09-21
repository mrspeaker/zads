import { disassemble } from "./disassemble.js";
import { vic_regs, pal_to_rgb, pal_to_hex } from "./vic.js";

import { $, toHex, formatObjRecord } from "./utils.js";
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
    $("#regs").value = [...regs]
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

const drawPixel = (x, y, c, img, cols) => {
  const xx = x * 8;
  const yy = y * 8;
  const pixelsPerLine = cols * 8;
  const datasPerLine = pixelsPerLine * 4;

  for (let j = 0; j < 8; j++) {
    const yoff = (yy + j) * datasPerLine;
    for (let i = 0; i < 8; i++) {
      img[yoff + (xx + i) * 4] = c[0];
      img[yoff + (xx + i) * 4 + 1] = c[1];
      img[yoff + (xx + i) * 4 + 2] = c[2];
      img[yoff + (xx + i) * 4 + 3] = 255;
    }
  }
};

function renderScreen(mem, vic) {
  const { base, screen, rows, cols } = vic;
  const mval = (offset) => memval(mem, base + offset);

  const c = $("#screen").getContext("2d");
  c.fillStyle = pal_to_rgb(mval(vic_regs.BG_COL));
  c.fillRect(0, 0, c.canvas.width, c.canvas.height);

  const scrmem = base + screen;
  const imgData = c.getImageData(0, 0, c.canvas.width, c.canvas.height);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = y * cols + x;
      const c = pal_to_rgb(mem[(scrmem + idx) % mem.length] % 16);
      drawPixel(x, y, c, imgData.data, cols);
    }
  }
  c.putImageData(imgData, 0, 0);
  c.fillStyle = pal_to_hex(mval(vic_regs.SPR1_COL));
  c.fillRect(mval(vic_regs.SPR1_X) * 8, mval(vic_regs.SPR1_Y) * 8, 16, 16);
  c.fillStyle = pal_to_hex(mval(vic_regs.SPR2_COL));
  c.fillRect(mval(vic_regs.SPR2_X) * 8, mval(vic_regs.SPR2_Y) * 8, 16, 16);
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
