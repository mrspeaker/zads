import { $ } from "./utils.js";
import { pal_to_hex } from "./vic.js";

export const mk_render_sprites = () => {
  const ctx_tile = $("#tile_canvas").getContext("2d");
  const ctx_tiles = $("#tiles_canvas").getContext("2d");
  const ctx_map = $("#map_canvas").getContext("2d");

  return (state) => {
    const { sprite_data, cur_sprite, spr_w, spr_h, map, map_w } = state;
    render_tile(ctx_tile, sprite_data[cur_sprite], spr_w, spr_h);
    render_tiles(ctx_tiles, sprite_data, spr_w, spr_h, cur_sprite);
    render_map(ctx_map, sprite_data, spr_w, spr_h, map, map_w);
  };
};

function render_tile(ctx, spr, spr_w, spr_h) {
  for (let j = 0; j < spr_h; j++) {
    for (let i = 0; i < spr_w; i++) {
      ctx.fillStyle = pal_to_hex(spr[j * spr_h + i]);
      ctx.fillRect(i * spr_w, j * spr_h, spr_w, spr_h);
    }
  }
}

function render_tiles(ctx, sprite_data, spr_w, spr_h, cur_sprite) {
  const draw_sprite = (idx, x, y) => {
    const spr_data = sprite_data[idx];
    for (let j = 0; j < spr_h; j++) {
      for (let i = 0; i < spr_w; i++) {
        ctx.fillStyle = pal_to_hex(spr_data[j * spr_h + i]);
        ctx.fillRect(i + x, j + y, 1, 1);
      }
    }
  };

  for (let j = 0; j < 16; j++) {
    for (let i = 0; i < 16; i++) {
      draw_sprite(j * 16 + i, i * 16, j * 16);
    }
  }

  ctx.strokeStyle = "orange";
  const x = cur_sprite % 16;
  const y = (cur_sprite / 16) | 0;
  ctx.strokeRect(x * 16, y * 16, 16, 16);
}

function render_map(ctx, sprite_data, spr_w, spr_h, map, map_w) {
  const draw_sprite = (idx, x, y) => {
    const spr_data = sprite_data[idx];
    for (let j = 0; j < spr_h; j++) {
      for (let i = 0; i < spr_w; i++) {
        ctx.fillStyle = pal_to_hex(spr_data[j * spr_h + i]);
        ctx.fillRect(i + x, j + y, 1, 1);
      }
    }
  };

  for (let j = 0; j < 16; j++) {
    for (let i = 0; i < 16; i++) {
      draw_sprite(map[j * map_w + i], i * 16, j * 16);
    }
  }
}
