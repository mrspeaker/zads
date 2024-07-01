export const key_handler = (dom) => {
  const isDown = {};
  dom.addEventListener("keydown", ({ which }) => {
    isDown[which] = true;
  });
  dom.addEventListener("keyup", ({ which }) => (isDown[which] = false));

  return {
    down: (key) => isDown[key],
  };
};

export const gamepad_handler = (win) => {
  let gp = null;
  let $joy = document.getElementById("icoJoy");
  $joy.style.visibility = "hidden";
  win.addEventListener("gamepadconnected", (e) => {
    $joy.style.visibility = "";
    gp = navigator.getGamepads()[e.gamepad.index];
    console.log(gp);
  });
  win.addEventListener("gamepaddisconnected", (e) => {
    gp = null;
    $joy.style.visibility = "hidden";
  });

  const sens = 0.2;
  return {
    connected: () => gp !== null,
    dbg: () => console.log(JSON.stringify(gp?.axes)),
    left: () => gp?.axes[0] < -sens,
    right: () => gp?.axes[0] > sens,
    up: () => gp?.axes[1] < -sens,
    down: () => gp?.axes[1] > sens,
    a: () => gp?.buttons[0].pressed,
    b: () => gp?.buttons[1].pressed,
  };
};
