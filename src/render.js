import { disassemble } from "./disassemble.js";
import { vic_regs, pal_to_rgb, pal_to_hex } from "./vic.js";

import { $, toHex, formatObjRecord, toBin } from "./utils.js";
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

    $("#obj").value = obj.length
      ? showObjBytes
        ? obj.map((v) => v.map((vv) => toHex(vv))).join("\n")
        : obj.map(formatObjRecord).join("\n\n")
      : "[object code not loaded]";
    $("#emu").value = code_txt.length
      ? code_txt.join("\n")
      : "zads VM v" + zads.version;
    $("#dis").value = code.length
      ? disassemble(code, symbols, showObjBytes).join("\n")
      : "[no code for disassembly]";

    $("#btnStop").innerText = machine.psw.halt ? "continue" : "stop";
  }

  if (machine) {
    const { regs, mem, psw, vic } = machine;
    $("#regs").value = [...regs]
      .map(bytes_to_fw)
      .map(
        (v, i) =>
          (i % 16 < 10 ? " " : "") +
          (i % 16) +
          ": " +
          toHex(v, 8) +
          " " +
          toBin(v)
      )
      .join("\n");
    $("#mem").value = mem
      .map((m) => toHex(m))
      .map((v) => (v === "00" ? "__" : v))
      .join(" ");
    $("#psw_cc").value = psw.conditionCode;
    $("#psw_pc").value = toHex(psw.pc);

    renderScreen(mem, vic, state.sprites);
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

const drawPixel1 = (x, y, w, c, img) => {
  const datasPerLine = w * 4;
  const yoff = y * datasPerLine;
  img[yoff + x * 4] = c[0];
  img[yoff + x * 4 + 1] = c[1];
  img[yoff + x * 4 + 2] = c[2];
  img[yoff + x * 4 + 3] = 255;
};

const drawSprite = (sprNum, data, cols, mval, sprites, sprite_tile) => {
  const x = mval(vic_regs["SPR" + sprNum + "_X"]);
  const y = mval(vic_regs["SPR" + sprNum + "_Y"]);
  const spr = sprites.sprite_data[sprite_tile % sprites.sprite_data.length];
  for (let j = 0; j < sprites.spr_h; j++) {
    for (let i = 0; i < sprites.spr_w; i++) {
      const idx = j * sprites.spr_w + i;
      const pix = spr[idx];
      const col = pal_to_rgb(pix);
      drawPixel1(x + i, y + j, cols, col, data);
    }
  }
};

const drawTile = (x, y, img, sprite_data) => {
  for (let j = 0; j < 8; j++) {
    for (let i = 0; i < 8; i++) {
      const col = pal_to_rgb(sprite_data[j * 8 + i]);
      drawPixel1(x + i, y + j, 128, col, img);
    }
  }
};

function renderScreen(mem, vic, sprites) {
  const { base, screen, rows, cols } = vic;
  const { map_w, map_h, spr_w, spr_h } = sprites;
  const mval = (offset) => memval(mem, base + offset);

  const c = $("#screen").getContext("2d");
  c.font = "1px monospace";
  c.fillStyle = pal_to_hex(mval(vic_regs.BG_COL));
  c.fillRect(0, 0, c.canvas.width, c.canvas.height);

  const scrmem = base + screen;
  const imgData = c.getImageData(0, 0, c.canvas.width, c.canvas.height);
  const { data: image_data } = imgData;
  for (let y = 0; y < map_h; y++) {
    for (let x = 0; x < map_w; x++) {
      const idx = y * map_w + x;
      const v = mem[(scrmem + idx) % mem.length];
      if (v < 0 || v > sprites.sprite_data.length) {
        console.log("bad value:", v);
        continue;
      }
      drawTile(x * spr_w, y * spr_h, image_data, sprites.sprite_data[v]);
    }
  }

  for (let i = 0; i < sprites.num_sprites; i++) {
    const idx = mval(vic_regs[`SPR${i + 1}_IDX`]);
    idx && drawSprite(1, image_data, 128, mval, sprites, idx);
  }
  // mval(vic_regs.SPR2_IDX) && drawSprite(2, image_data, 128, mval, sprites, 1);
  c.putImageData(imgData, 0, 0);
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
