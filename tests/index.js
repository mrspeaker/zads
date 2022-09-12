import { $ } from "../src/utils.js";

import bytes_test from "./bytes_test.js";
import base_displace_test from "./base_displace_test.js";
import disassemble_test from "./disassemble_test.js";
import op_test from "./op_test.js";
import utils_test from "./utils_test.js";

const tests = () =>
  [utils_test, bytes_test, disassemble_test, op_test, base_displace_test].map(
    (tests) =>
      tests.reduce((ac, f) => {
        const name = f.name;
        const passed = !!f();
        ac.push({ name, passed });
        return ac;
      }, [])
  );

function main() {
  tests().forEach((group) => {
    const grpdiv = document.createElement("div");
    group.map(({ name, passed }) => {
      const div = document.createElement("div");
      div.innerHTML = `<span class="${passed ? "ok " : "fail"}">${
        passed ? "&nbsp;OK&nbsp;" : "FAIL"
      }</span> ${name}`;
      grpdiv.appendChild(div);
    });
    $("#tests").appendChild(grpdiv);
  });
}

main();
