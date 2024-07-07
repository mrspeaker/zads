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
    default:
      dirty = false;
  }
  return dirty;
};
