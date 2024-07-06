import { $, $click, $on, $get_ev_pos } from "./utils.js";

export function ui_sprites(state, action) {
  init_tile(state, action);
}

function init_tile(state, action) {
  let ctx = $("#tile_canvas").getContext("2d");
  let w = ctx.canvas.width;
  let h = ctx.canvas.height;

  $click(ctx.canvas, (e) => {
    const { sprite_data, cur_sprite, spr_w, spr_h } = state;
    const spr = sprite_data[cur_sprite];

    const { x, y } = $get_ev_pos(e);
    const tx = ((x / w) * spr_w) | 0;
    const ty = ((y / h) * spr_h) | 0;
    const idx = ty * spr_w + tx;

    spr[idx] = spr[idx] ? 0 : 1;
    action("TILE_UPDATE", [...spr]);
  });
}
