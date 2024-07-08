import { $, $click, $on, $get_ev_pos, $div } from "./utils.js";
import { pal_hex } from "./vic.js";

export function ui_sprites(state, action) {
  init_tile(state, action);
  init_palette(state, action);
  init_tiles(state, action);
  init_map(state, action);
  init_pen(state, action);
}

function $mouse_draw(canvas, tw_, th_, rows, scale, onDraw) {
  const w = canvas.width * scale;
  const h = canvas.height * scale;

  const tw = tw_ * scale;

  const get_tile = (e) => {
    const { x, y } = $get_ev_pos(e);
    const tx = ((x / w) * rows) | 0;
    const ty = ((y / h) * rows) | 0;
    return { tx: tx, ty };
  };

  let is_down = false;
  let last_x = -1;
  let last_y = -1;
  let init_tx = -1;
  let init_ty = -1;
  $on(canvas, "mousedown", (e) => {
    is_down = true;
    const { tx, ty } = get_tile(e);
    init_tx = tx;
    init_ty = ty;
  });

  $on(canvas, "mouseup", (e) => {
    is_down = false;
    const { tx, ty } = get_tile(e);
    if (init_tx == tx && init_ty === ty) {
      onDraw(tx, ty);
    }
  });

  $on(canvas, "mousemove", (e) => {
    if (!is_down) return;
    const { tx, ty } = get_tile(e);
    if (tx !== last_x || ty !== last_y) {
      last_x = tx;
      last_y = ty;
      onDraw(tx, ty);
    }
  });
}

function init_tile(state, action) {
  let ctx = $("#tile_canvas").getContext("2d");

  const pens = [
    [[0, 0]],
    [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ],
  ];

  const draw_pixel = (tx, ty) => {
    const { sprite_data, cur_sprite, cur_colour, spr_w, spr_h, pen_size } =
      state;
    const spr = sprite_data[cur_sprite];

    pens[pen_size].forEach(([xo, yo]) => {
      const txo = tx + xo;
      const tyo = ty + yo;
      if (txo < 0 || txo > spr_w - 1) return;
      if (tyo < 0 || tyo > spr_h - 1) return;
      const idx = tyo * spr_w + txo;
      spr[idx] = cur_colour;
    });
    action("TILE_UPDATE", [...spr]);
  };

  $mouse_draw(ctx.canvas, state.spr_w, state.spr_h, state.spr_w, 4, draw_pixel);
}

function init_tiles(state, action) {
  let ctx = $("#tiles_canvas").getContext("2d");

  const select_tile = (tx, ty) => {
    const idx = ty * state.spr_w + tx;
    action("SELECT_SPRITE", idx);
  };

  $mouse_draw(
    ctx.canvas,
    state.spr_w,
    state.spr_h,
    state.spr_w,
    4,
    select_tile
  );
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

function init_map(state, action) {
  let ctx = $("#map_canvas").getContext("2d");

  const draw_tile = (tx, ty) => {
    const idx = ty * state.map_w + tx;
    action("SET_MAP_TILE", idx);
  };

  $mouse_draw(ctx.canvas, state.spr_w, state.spr_h, state.map_w, 2, draw_tile);
}

function init_pen(state, action) {
  $click("#pen1", () => action("SET_PEN", 0));
  $click("#pen2", () => action("SET_PEN", 1));
  $click("#spr_copy", () => action("SPRITE_COPY"));
  $click("#spr_paste", () => action("SPRITE_PASTE"));
  $click("#chk_map_obj", (e) => {
    action("MAP_INJECT", e.target.checked);
  });
}
