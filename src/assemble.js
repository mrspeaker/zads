import { ops, op_name } from "./ops.js";
import { $, $click } from "./utils.js";

export const bindAssembleUI = (onAssemble) => {
  $click("#btnAsm", () => {
    onAssemble(assembleText($("#src").value));
  });
};

const parseLine = (line) => {
  const tok = line.split(" ").reduce((ac, el, i) => {
    if (i === 0) {
      ac.push(el);
    } else {
      if (el !== "") {
        ac.push(el);
      }
    }
    return ac;
  }, []);
  const [label, op, operands, ...comment] = tok;

  return {
    label,
    op,
    operands: operands?.split(","),
    comment: comment?.join(" "),
  };
};

const assembleStatement = (stmt) => {
  const { op, operands } = stmt;
  const o = op_name[op.toUpperCase()];
  if (o) {
    console.log("OP:", ops[o].op, operands);

    return [o, ...operands];
  } else {
    console.log("Non-op:", op);
  }
  return -1;
};

export const assembleText = (txt) => {
  return txt
    .split("\n")
    .filter((v) => !!v)
    .map(parseLine)
    .map(assembleStatement);
};
