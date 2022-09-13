/*const expandLiterals = (ac, stmt) => {
  stmt.operands = stmt.operands.map((o) => {
    if (o.startsWith("=")) {
      const lit = {
        label: "_lit_" + ac.lits.length.toString(),
        value: o.slice(1),
      };
      ac.lits.push(lit);
      return lit.label;
    }
    return o;
  });
*/

export default [];
