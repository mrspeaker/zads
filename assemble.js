import { $, $click } from "./main.js";

export const bindAssembleUI = (onAssemble) => {
    $click("#btnAsm", () => {
        onAssemble(assembleText($("#src").value));
    });
}

export const assembleText = txt => {
    return txt.split("").map(()=>0x00);
}
