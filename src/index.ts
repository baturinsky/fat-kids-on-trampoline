export let mouseAt: [number, number];
import { eachFrame } from "./Util";
import Game from "./Game";
let mouseInside = true;
let c: HTMLCanvasElement;

let dirKeysPressed = [...new Array(8)].map(_ => false);
let dirKeyCodes = ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"];

let game: Game;
let paused = false;

function gameUpdated(g: Game) {
  game = g;
  if (!game) {
    c.getContext("2d").clearRect(0, 0, 1200, 1200);
  }
}

window.onload = function() {
  c = document.getElementById("main") as HTMLCanvasElement;
  gameUpdated(new Game(c));

  c.addEventListener("mouseleave", e => {
    mouseInside = false;
  });

  c.addEventListener("mouseenter", e => {
    mouseInside = true;
  });

  document.addEventListener("keyup", e => {
    let dir = dirKeyCodes.indexOf(e.code);
    if (dir >= 0) {
      dirKeysPressed[dir] = false;
    }
  });

  document.addEventListener("keydown", e => {
    let dir = dirKeyCodes.indexOf(e.code);
    if (dir >= 0) {
      dirKeysPressed[dir] = true;
    }
    if (e.code == "Escape") {
      gameUpdated(new Game(c));
    }
    if (e.code == "KeyP") {
      paused = !paused;
    }

  });

  eachFrame(time => {
    if (game && !paused) game.update(time, dirKeysPressed);
  });

  gameUpdated(game);
};
