import { ops, op_by_mn } from "./ops.js";

export const get_help_text = (selection) => {
  const trimmed = selection.trim();
  if (!trimmed) return null;
  const tok = trimmed.split(" ");
  const op_code = op_by_mn[tok[0].toUpperCase()];
  if (!op_code) return null;
  const { desc, pdf, type, len, code, mn, form } = ops[op_code];
  return {
    desc,
    pdf,
    type,
    len,
    code,
    mn,
    form,
  };
};
