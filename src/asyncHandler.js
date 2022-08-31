import { load_prog, mk_program_from_obj } from "./program.js";

const tryerr = (f) => async (...args) => {
  try {
    return [null, await f(...args)];
  } catch (err) {
    return [err, []];
  }
};

const asyncHandler = (action) => async (type, value) => {
  switch (type) {
    case "PROG_LOAD":
      {
        const [err, { obj, src }] = await tryerr(load_prog)(value);
        if (!err) {
          const prog = mk_program_from_obj(obj, src);
          action("PROG_LOADED", prog);
        }
      }
      break;
    case "STORAGE_LOAD":
      {
        action("STORAGE_LOADED", [
          {
            name: "load register",
            asm: `         l     1,a1          load register
         bcr   b'1111',14    return to caller
a1       dc    f'42'`,
          },
          {
            name: "loop de loop",
            asm: `         l     1,a1
loop     bct   1,loop
         bcr   b'1111',14
a1       dc    f'20'`,
          },
          {
            name: "max",
            asm: `max      csect
         Using max,15
         l     1,w1          get First number
         l     2,w2          Get second number
         cr    1,2           set the condition code
         bc    b'0010',onehigh  branch if W1 higher
         st    2,w3          else store second number
         bcr   b'1111',14    return to caller
onehigh  st    1,w3          save first number as max
         bcr   b'1111',14    return to caller
w1       dc    f'321'        First number
w2       dc    f'123'        Second number
w3       ds    f             Maximum
         end   max
`,
          },
        ]);
      }
      break;
    default:
      action(type, value);
  }
};

export default asyncHandler;
