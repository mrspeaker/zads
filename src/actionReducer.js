import { chunk } from "./utils.js";

const actionReducer = (s) => (type, value) => {
  console.log(type);
  switch (type) {
    case "LOAD_OBJ":
      s.goff = value.obj[0] === 3 && value.obj[1] === 0xf0;
      s.obj = chunk(value.obj, 80);
      return s;
    default:
      console.log("Unhandled ", type);
  }
};

export default actionReducer;
