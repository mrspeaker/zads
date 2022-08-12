import { $ } from "./main.js";

export const displayObj = (obj,env) => {
    $("#obj").value = obj;
    $("#regs").value = env.regs.join("\n");
}

export const loadObj = obj => {
    
}
