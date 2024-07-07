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
export const $$ = (sel) => [...document.querySelectorAll(sel)];
const $node = (obj) => (obj instanceof Node ? obj : $(obj));
export const $click = (sel, f) => $node(sel).addEventListener("click", f);
export const $on = (sel, ev, f) => $node(sel).addEventListener(ev, f);
export const $get_ev_pos = (ev) => {
  const { left, top } = ev.target.getBoundingClientRect();
  return { x: Math.floor(ev.clientX - left), y: Math.floor(ev.clientY - top) };
};
export const $div = () => {
  const d = document.createElement("div");
  return d;
};

export const delay = (time) => new Promise((res) => setTimeout(res, time));

export const arrEq = (a1, a2) =>
  a1.length === a2.length && a1.every((a, i) => a === a2[i]);

const zeros = [...Array(32)].fill(0).join("");
export const toHex = (v, pad = 2) =>
  ((pad ? zeros : "") + (v || "").toString(16)).slice(-pad);

export const toBin = (v, pad = 32) =>
  ((pad ? zeros : "") + (v || "").toString(2)).slice(-pad);

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

export const eb2code = (ch) => {
  const code = {
    A: 0xc1,
    C: 0xc3,
    Z: 0xe9,
  }[ch];
  return code ?? 0;
};

const despace = (ch) => (ch === 0x40 ? "_" : toHex(ch));

export const formatObjRecord = (rec) => {
  const [, ta, tb, tc, ...theRest] = rec;
  const type = [ta, tb, tc].map(eb2asc).join("");
  return type + ": " + theRest.map(despace).join(",");
};
