import { $ } from "../src/utils.js";

import bytes_test from "./bytes_test.js";
import base_displace_test from "./base_displace_test.js";
import assemble_test from "./assemble_test.js";
import disassemble_test from "./disassemble_test.js";
import op_test from "./op_test.js";
import lex_test from "./lex_test.js";
import utils_test from "./utils_test.js";

import "./parco.js";

const tests = () =>
  [
    [utils_test, "utils"],
    [bytes_test, "bytes"],
    [assemble_test, "assembler"],
    [disassemble_test, "disassembler"],
    [op_test, "ops"],
    [base_displace_test, "addressing"],
    [lex_test, "lexing"],
  ].map(([tests, title]) => [
    tests.reduce((ac, f) => {
      const name = f.name;
      const passed = !!f();
      ac.push({ name, passed });
      return ac;
    }, []),
    title,
  ]);

function main() {
  tests().forEach(([group, title]) => {
    const grpdiv = document.createElement("div");
    const div_title = document.createElement("div");
    div_title.innerText = title;
    div_title.classList.add("group_title");
    grpdiv.appendChild(div_title);

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
