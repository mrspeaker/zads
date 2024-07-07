import { $, $click, $on, $get_ev_pos, $div } from "./utils.js";
import { pal_hex } from "./vic.js";

export function ui_sprites(state, action) {
  init_tile(state, action);
  init_palette(state, action);
  init_tiles(state, action);
}

function init_tile(state, action) {
  let ctx = $("#tile_canvas").getContext("2d");
  let w = ctx.canvas.width;
  let h = ctx.canvas.height;

  const draw_pixel = (tx, ty) => {
    const { sprite_data, cur_sprite, cur_colour, spr_w } = state;
    const spr = sprite_data[cur_sprite];
    const idx = ty * spr_w + tx;
    spr[idx] = cur_colour;
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

function init_tiles(state, action) {
  let ctx = $("#tiles_canvas").getContext("2d");
  let w = ctx.canvas.width;
  let h = ctx.canvas.height;

  $click(ctx.canvas, (e) => {
    const { x, y } = $get_ev_pos(e);
    action("SELECT_SPRITE", ((x / w) * 16) | 0);
  });
}

function init_palette(state, action) {
  const pal = $("#palette");
  pal_hex.forEach((p, i) => {
    const d = $div();
    d.classList.add("pal");
    d.style.backgroundColor = p;
    $click(d, () => {
      action("SET_COLOUR", i);
      // render
      $(".selected_pal")?.classList.remove("selected_pal");
      d.classList.add("selected_pal");
    });
    pal.appendChild(d);
  });
}
