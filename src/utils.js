export const chunk = (arr, size) =>
  arr.reduce(
    (ac, el) => {
      const a = ac[ac.length - 1];
      if (a.length === size) ac.push([]);
      ac[ac.length - 1].push(el);
      return ac;
    },
    [[]]
  );

export const $ = (sel) => document.querySelector(sel);
export const $click = (sel, f) => $(sel).addEventListener("click", f, false);

const zeros = [...Array(16)].fill(0).join("");
export const toHex = (v, pad = 2) =>
  ((pad ? zeros : "") + v.toString(16)).slice(-pad);

const _e2a = {
  64: " ",
  75: ".",
  76: "<",
  77: "(",
  78: "+",
  79: "|",
  80: "&",
  90: "!",
  91: "$",
  92: "*",
  93: ")",
  94: ";",
  95: "¬",
  96: "-",
  97: "/",
  106: "¦",
  107: ",",
  108: "%",
  109: "_",
  110: ">",
  111: "?",
  121: "`",
  122: ":",
  123: "#",
  124: "@",
  125: "'",
  126: "=",
  127: '"',
  128: "Ø",
  129: "a",
  130: "b",
  131: "c",
  132: "d",
  133: "e",
  134: "f",
  135: "g",
  136: "h",
  137: "i",
  145: "j",
  146: "k",
  147: "l",
  148: "m",
  149: "n",
  150: "o",
  151: "p",
  152: "q",
  153: "r",
  161: "~",
  162: "s",
  163: "t",
  164: "u",
  165: "v",
  166: "w",
  167: "x",
  168: "y",
  169: "z",
  170: "¡",
  171: "¿",
  176: "^",
  186: "[",
  187: "]",
  189: '"',
  193: "A",
  194: "B",
  195: "C",
  196: "D",
  197: "E",
  198: "F",
  199: "G",
  200: "H",
  201: "I",
  209: "J",
  210: "K",
  211: "L",
  212: "M",
  213: "N",
  214: "O",
  215: "P",
  216: "Q",
  217: "R",
  224: "\\",
  225: "÷",
  226: "S",
  227: "T",
  228: "U",
  229: "V",
  230: "W",
  231: "X",
  232: "Y",
  233: "Z",
  240: "0",
  241: "1",
  242: "2",
  243: "3",
  244: "4",
  245: "5",
  246: "6",
  247: "7",
  248: "8",
  249: "9",
  255: "*",
};
export const eb2asc = (c) => _e2a[c] ?? "?";

const despace = (ch) => (ch === 0x40 ? " " : toHex(ch));

export const formatObjRecord = (rec) => {
  const [, ta, tb, tc, ...theRest] = rec;
  const type = [ta, tb, tc].map(eb2asc).join("");
  return type + ": " + theRest.map(despace).join(",");
};

export const loadTxtObj = async (path) => {
  const obj = await fetch(path)
    .then((r) => r.blob())
    .then((r) => r);
  const buf = await obj.arrayBuffer();
  return new Uint8Array(buf);
};

export const loadAsm = (path) =>
  fetch(path)
    .then((r) => r.text())
    .then((r) => r);
