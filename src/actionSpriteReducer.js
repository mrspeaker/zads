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
    default:
      dirty = false;
  }
  return dirty;
};
