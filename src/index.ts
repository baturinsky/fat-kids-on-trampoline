export let mouseAt: [number, number];
import { eachFrame } from "./Util";
import Game from "./Game";
let mouseInside = true;
let c: HTMLCanvasElement;
let ui: HTMLElement;

let dirKeysPressed = [...new Array(8)].map(_ => false);
let dirKeyCodes = [
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowLeft",
  "ArrowDown",
  "ArrowRight",
  "Numpad8",
  "Numpad4",
  "Numpad2",
  "Numpad6",
  "KeyI",
  "KeyJ",
  "KeyK",
  "KeyL",
];

let keyAlias={KeyX:"KeyS", KeyM:"KeyK", Comma:"KeyK"}

let game: Game;
let paused = false;

function gameUpdated(g: Game) {
  game = g;
  if (!game) {
    c.getContext("2d").clearRect(0, 0, 1200, 1200);
  }
  if (game) {
    let tip = `Neighborhood kids caught a wind of you getting a giant trampoline and want to play.<br/>
Though, they have no safety training, so you have no choice but politely ask them to leave.<br/>
They may object, but a strong enough kick makes them lose control temporarily, letting you usher them out.<br/>
You get a point for each de-trampolined kid.<br/>
If you fall off, you lose 5 points.<br/>
Game ends when there are 15 kids present (including you).<br/>
<br/>
<b>Move with WASD, arrow keys, NUMPAD or IJKL for player 1 to 4 respectively.<br/>
X,M and comma can be used for down direction too.<br/>
P to pause. ESC to reset.</b><br/>
<br/>
Have fun, and don't act recklessly or agressively on trampoline in real life!<br/>
`;
    let text = game.over()
      ? `<h3>Game over</h3>You are overrun.<br/><br/>Press ESC to restart`
      : paused
      ? `<h3>Paused</h3></br>${tip}`
      : game.playersAlive()
      ? ""
      : tip;
    ui.innerHTML = text;
  }
}

function updateUI() {
  gameUpdated(game);
}

window.onload = function() {
  c = document.getElementById("main") as HTMLCanvasElement;
  ui = document.getElementById("ui");
  
  gameUpdated(new Game(c, updateUI));

  c.addEventListener("mousedown", e => {
    console.log(game);
  });

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
    console.log(e);
    let code = e.code;
    if(keyAlias[code])
      code = keyAlias[code];
    let dir = dirKeyCodes.indexOf(code);
    if (dir >= 0) {
      dirKeysPressed[dir] = true;
      if (paused) {
        paused = false;
        updateUI();
      }
    }
    if (code == "Escape") {
      gameUpdated(new Game(c, updateUI));
    }
    if (code == "KeyP") {
      paused = !paused;
      updateUI();
    }
  });

  eachFrame(time => {
    if (game && !paused && !game.over()) game.update(time, dirKeysPressed);
  });

  gameUpdated(game);
};
