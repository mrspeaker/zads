// Just mutating sprites. Not a reducer. Soz.
export const actionSpriteReducer = (s, type, value) => {
  let dirty = true;
  switch (type) {
    case "SET_SPRITES":
      // Copy loaded sprite data
      Object.entries(value).forEach(([k, v]) => {
        s[k] = v;
      });
      dirty = true;
      break;
    case "TILE_UPDATE":
      s.sprite_data[s.cur_sprite] = value;
      break;
    case "SELECT_SPRITE":
      s.cur_sprite = value;
      break;
    case "SET_COLOUR":
      s.cur_colour = value;
      break;
    case "SET_MAP_TILE":
      s.map[value] = s.cur_sprite;
      break;
    case "SET_PEN":
      s.pen_size = value;
      break;
    case "SPRITE_COPY":
      s.copy_buf = [];
      s.sprite_data[s.cur_sprite].forEach((b) => s.copy_buf.push(b));
      break;
    case "SPRITE_PASTE":
      s.copy_buf.forEach((b, i) => {
        console.log(b, i);
        s.sprite_data[s.cur_sprite][i] = b;
      });
      break;
    case "MAP_INJECT":
      s.use_maps = value;
      break;
    default:
      dirty = false;
  }
  return dirty;
};
