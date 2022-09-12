import base_displace_test from "./base_displace_test.js";
import disassemble_test from "./disassemble_test.js";
import op_test from "./op_test.js";

const tests = () =>
  [...disassemble_test, ...op_test, ...base_displace_test].map((f) => {
    const name = f.name;
    const passed = !!f();
    return { name, passed };
  });

function main() {
  tests().forEach(({ name, passed }) => {
    const div = document.createElement("div");
    div.innerHTML = `<span class="${passed ? "ok " : "fail"}">${
      passed ? "&nbsp;OK&nbsp;" : "FAIL"
    }</span> ${name}`;
    document.body.appendChild(div);
  });
}
main();
