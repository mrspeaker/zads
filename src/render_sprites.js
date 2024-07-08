import { $ } from "./utils.js";
import { pal_to_hex } from "./vic.js";

export const mk_render_sprites = () => {
  const ctx_tile = $("#tile_canvas").getContext("2d");
  const ctx_tiles = $("#tiles_canvas").getContext("2d");
  const ctx_map = $("#map_canvas").getContext("2d");

  return (state) => {
    render_tile(ctx_tile, state);
    render_tiles(ctx_tiles, state);
    render_map(ctx_map, state);
    render_ui(state);
  };
};

function render_tile(ctx, state) {
  const { sprite_data, spr_w, spr_h, cur_sprite } = state;
  const spr = sprite_data[cur_sprite];
  for (let j = 0; j < spr_h; j++) {
    for (let i = 0; i < spr_w; i++) {
      ctx.fillStyle = pal_to_hex(spr[j * spr_h + i]);
      ctx.fillRect(i * spr_w, j * spr_h, spr_w, spr_h);
    }
  }
}

function render_tiles(ctx, state) {
  const { sprite_data, spr_w, spr_h, cur_sprite, map_w, map_h } = state;
  const draw_sprite = (idx, x, y) => {
    const spr_data = sprite_data[idx];
    if (!spr_data) {
      console.log("no", idx);
      return;
    }
    for (let j = 0; j < spr_h; j++) {
      for (let i = 0; i < spr_w; i++) {
        ctx.fillStyle = pal_to_hex(spr_data[j * spr_h + i]);
        ctx.fillRect(i + x, j + y, 1, 1);
      }
    }
  };

  for (let j = 0; j < spr_h; j++) {
    for (let i = 0; i < spr_w; i++) {
      draw_sprite(j * spr_w + i, i * spr_w, j * spr_h);
    }
  }

  ctx.strokeStyle = "orange";
  const x = cur_sprite % spr_w;
  const y = (cur_sprite / spr_w) | 0;
  ctx.strokeRect(x * spr_w, y * spr_h, spr_w, spr_h);
}

function render_map(ctx, state) {
  const { sprite_data, spr_w, spr_h, map, map_w, map_h } = state;

  ctx.fillStyle = "orange";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const draw_sprite = (idx, x, y) => {
    const spr_data = sprite_data[idx];
    for (let j = 0; j < spr_h; j++) {
      for (let i = 0; i < spr_w; i++) {
        ctx.fillStyle = pal_to_hex(spr_data[j * spr_h + i]);
        ctx.fillRect(i + x, j + y, 1, 1);
      }
    }
  };

  for (let j = 0; j < map_h; j++) {
    for (let i = 0; i < map_w; i++) {
      draw_sprite(map[j * map_w + i], i * spr_w, j * spr_h);
    }
  }
}

function render_ui(state) {
  $("#chk_map_obj").checked = state.use_maps;
  $("#cur_sprite").innerText = state.cur_sprite;
}
