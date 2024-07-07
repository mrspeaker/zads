import { to_nibs } from "./bytes.js";

const numOnlyRegex = /^\d+$/g;
const bdregex = /([\d\w]+)\(([\d\w]*)(,([\d\w]+))*\)/g;

export const parseBaseDisplace = (o, base, symbols) => {
  const INDEX = 0;
  const noBD = o.match(numOnlyRegex);
  if (noBD) {
    return [0, 0, ...to_nibs(o, 3)];
  }

  const matches = [...o.matchAll(bdregex)]
    .flat()
    .filter((v) => v !== undefined);

  if (matches.length === 5) {
    //base disp with index
    // 100(1,2): [ "100(1,2)", "100", "1", ",2", "2" ]
    const [, disp, index, , base] = matches;
    const mindex = parseInt(index, 10) || 0;
    const mbase = parseInt(base, 10) || 0;
    const mdisp = parseInt(disp, 10) || 0;
    return [mindex, mbase, ...to_nibs(mdisp, 3)];
  } else if (matches.length === 3) {
    // no base
    //100(2) : [ "100(2)", "100", "2" ]
    const [, disp, index] = matches;
    const mindex = parseInt(index, 10) || 0;
    const mdisp = parseInt(disp, 10) || 0;
    return [mindex, base, ...to_nibs(mdisp, 3)];
  } else if (symbols[o.toLowerCase()]) {
    return [INDEX, base, ...to_nibs(symbols[o.toLowerCase()].pc, 3)];
  } else {
    console.warn("Missing symbol:", o);
  }
  return [INDEX, base, 0, 0, 0];
};
