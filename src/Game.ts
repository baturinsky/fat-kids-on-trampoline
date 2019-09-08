import Body from "./Body";
import { randomElement } from "./Util";
import { V2 } from "./v2";
import * as v2 from "./v2";
import jsfxr from "jsfxr";

let hairColors = ["black", "black", "brown", "brown", "yellow", "purple"];
let skinColors = ["#eb9", "#eb9", "brown"];
let pantsColors = ["black", "blue", "brown", "brown", "gray", "darkgreen"];

function rni() {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}

let dirVecs: V2[] = [[0, -1], [-1, 0], [0, 1], [1, 0]];


export default class Game {
  player: Body;
  bodies: Body[] = [];
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  lastLoopTimeStamp: number;
  time: number = 0;

  tramDeform: number;
  tramCenter: number;
  tramVel = 0;
  tramMass = 10;

  constructor(public canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d");

    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;
    this.canvas.height = this.height;
    this.canvas.width = this.width;

    this.tramDeform = 0;
    this.tramCenter = this.height - 10;

    this.player = new Body(this, {
      r: 20,
      mass: 1,
      at: [200, 300],
      hair: "black",
      shirt: "red",
      pants: "black"
    });

    for (let i = 0; i < 2; i++) {
      this.spawnKid();
    }
  }

  spawnKid() {
    let side = Math.random() < 0.5 ? -1 : 1;
    new Body(this, {
      dir: [-side, 0],
      speed: Math.random() * 0.5 + 0.5,
      at: [side == -1 ? -30 : this.width + 30, 400 + (rni() % 200)],
      hair: randomElement(hairColors, rni),
      pants: randomElement(pantsColors, rni),
      skin: randomElement(skinColors, rni)
    });
  }

  update(timeStamp: number, dirKeysPressed: boolean[]) {
    if (!this.lastLoopTimeStamp) this.lastLoopTimeStamp = timeStamp - 0.001;
    let dTime = Math.min(0.02, (timeStamp - this.lastLoopTimeStamp) / 1000);
    this.lastLoopTimeStamp = timeStamp;
    this.time += dTime;

    if (Math.random() < dTime * 0.05 * (1 + this.time / 20) || this.bodies.length<2) {
      this.spawnKid();
    }

    let dirVec = dirKeysPressed.reduce(
      (prev, cur, ind) => (cur ? v2.sum(prev, dirVecs[ind % 4]) : prev),
      [0, 0] as V2
    );
    this.player.dir = dirVec;

    this.tramDeform += this.tramVel * dTime;
    this.tramVel =
      this.tramVel * (1 - Math.abs(this.tramVel) * dTime * 0.3) -
      this.tramDeform * dTime * 100;

    for (let p of this.bodies) {
      p.update(dTime);
    }

    for (let p of this.bodies) {
      p.collide(dTime);
    }

    this.bodies = this.bodies.filter(b => b.at[1] <= this.height + 20);

    this.draw();
  }

  get tramH() {
    return this.tramCenter + this.tramDeform;
  }

  draw() {
    let ctx = this.ctx;

    ctx.clearRect(0, 0, this.width, this.height);
    /*ctx.fillStyle = `rgba(135,206,250,0.5)`;
    ctx.fillRect(0,0, this.width, this.height )*/
    for (let body of this.bodies) {
      body.draw();
    }

    ctx.save();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.fillRect(50, this.tramH, this.width - 100, 30);
    ctx.restore();
  }

  sfx(code: number[]) {
    try {
      var soundURL = jsfxr(code);
      var player = new Audio();
      player.src = soundURL;
      player.play();
    } catch (e) {
      console.error(e);
    }
  }
  
  sfxRnd(code: number[], spread: number = 0.01) {
    let oced = code.slice()
    oced[23] *= Math.random() * 0.2 + 0.8;
    oced[5] *= Math.random() + 0.5;
    this.sfx(oced);
  }
  
  hitSfx(volume = 1){
    //this.sfxRnd([0,,0.0102,,0.1697,0.45,,-0.4679,,,,,,0.1052,,,,,1,,,0.1629,,0.5])
    this.sfxRnd([3,,0.0366,,0.2694,0.4668,,-0.6978,,,,,,,,,,,1,,,,,0.5 * volume])
  }
  
}
