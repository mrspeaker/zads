import { ops, op_name } from "./ops.js";
import { $, $click } from "./utils.js";

export const bindAssembleUI = (onAssemble) => {
  $click("#btnAsm", () => {
    onAssemble(assembleText($("#src").value));
  });
};

const assembleLine = (line) => {
  const tok = line.split(" ");
  const o = op_name[tok[0].toUpperCase()];
  if (o) {
    const opers = tok[1].split(",");
    console.log("OP:", ops[o].op, opers);

    return [o, ...opers];
  } else {
    console.log("whats this?", o);
  }
  return -1;
};

export const assembleText = (txt) => {
  return txt.split("\n").map(assembleLine);
};
