import { $, $click, $on, $get_ev_pos } from "./utils.js";

export function ui_sprites(state, action) {
  init_tile(state, action);
}

function init_tile(state, action) {
  let ctx = $("#tile_canvas").getContext("2d");
  let w = ctx.canvas.width;
  let h = ctx.canvas.height;

  const draw_pixel = (tx, ty) => {
    const { sprite_data, cur_sprite, spr_w } = state;
    const spr = sprite_data[cur_sprite];
    const idx = ty * spr_w + tx;
    spr[idx] = spr[idx] ? 0 : 1;
    action("TILE_UPDATE", [...spr]);
  };

  const get_tile = (e) => {
    const { spr_w, spr_h } = state;
    const { x, y } = $get_ev_pos(e);
    const tx = ((x / w) * spr_w) | 0;
    const ty = ((y / h) * spr_h) | 0;
    return { tx, ty };
  };

  let is_down = false;
  let last_x = -1;
  let last_y = -1;
  let init_tx = -1;
  let init_ty = -1;
  $on(ctx.canvas, "mousedown", (e) => {
    is_down = true;
    const { tx, ty } = get_tile(e);
    init_tx = tx;
    init_ty = ty;
  });

  $on(ctx.canvas, "mouseup", (e) => {
    is_down = false;
    const { tx, ty } = get_tile(e);
    if (init_tx == tx && init_ty === ty) {
      draw_pixel(tx, ty);
    }
  });

  $on(ctx.canvas, "mousemove", (e) => {
    if (!is_down) return;
    const { tx, ty } = get_tile(e);
    if (tx !== last_x || ty !== last_y) {
      last_x = tx;
      last_y = ty;
      draw_pixel(tx, ty);
    }
  });
}
