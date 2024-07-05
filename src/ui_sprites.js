import { $$, $, $click, $on } from "./utils.js";
import { pal_to_hex } from "./vic.js";

export function ui_sprites(state, action) {
  const { sprite_data, cur_sprite, spr_w, spr_h } = state;
  let ctx = $("#tile_canvas").getContext("2d");
  let w = ctx.canvas.width;
  let h = ctx.canvas.height;
  const spr = sprite_data[cur_sprite];
  for (let j = 0; j < spr_h; j++) {
    for (let i = 0; i < spr_w; i++) {
      ctx.fillStyle = pal_to_hex(spr[j * spr_h + i]);
      ctx.fillRect(i * spr_w, j * spr_h, spr_w, spr_h);
    }
  }

  ctx = $("#tiles_canvas").getContext("2d");
  w = ctx.canvas.width;
  h = ctx.canvas.height;

  for (let j = 0; j < 2; j++) {
    for (let i = 0; i < 16; i++) {
      ctx.strokeStyle = pal_to_hex(1);
      ctx.strokeRect(i * 16, j * 16, 16, 16);
    }
  }

  ctx = $("#map_canvas").getContext("2d");
  w = ctx.canvas.width;
  h = ctx.canvas.height;

  for (let j = 0; j < 16; j++) {
    for (let i = 0; i < 16; i++) {
      ctx.strokeStyle = pal_to_hex(1);
      ctx.strokeRect(i * 16, j * 16, 16, 16);
    }
  }
}
