import Kid from "./Kid";
import { V2 } from "./v2";
import * as v2 from "./v2";
import jsfxr from "jsfxr";
import FX from "./FX";

let dirVecs: V2[] = [[0, -1], [-1, 0], [0, 1], [1, 0]];

export default class Game {
  players: Kid[] = [];
  kids: Kid[] = [];
  fx: FX[] = [];
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  lastLoopTimeStamp: number;
  time: number = 0;
  kidEta = 0;
  score = [0,0,0]

  tramDeform: number;
  tramCenter: number;
  tramVel = 0;
  tramMass = 10;

  rni() {
    return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  }

  spawnPlayer(n: number) {
    if (this.players[n]) return;
    let kid = Kid.newKid(this);
    this.players[n] = kid;
    (kid.at = [n == 1 ? 200 : this.width - 200, 300]), (kid.r = 20);
    kid.mass = 1;
    kid.player = n;
    this.updateUI()
  }

  constructor(public canvas: HTMLCanvasElement, public updateUI:Function) {
    this.ctx = canvas.getContext("2d");

    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;
    this.canvas.height = this.height;
    this.canvas.width = this.width;

    this.tramDeform = 0;
    this.tramCenter = this.height - 10;
  }

  over(){
    return this.kids.length>=15;
  }

  update(timeStamp: number, dirKeysPressed: boolean[]) {

    if (!this.lastLoopTimeStamp) this.lastLoopTimeStamp = timeStamp - 0.001;
    let dTime = Math.min(0.02, (timeStamp - this.lastLoopTimeStamp) / 1000);
    this.lastLoopTimeStamp = timeStamp;
    this.time += dTime;
    this.kidEta -= dTime;

    if (this.playersAlive() && (this.kidEta <= 0 || this.kids.length < 3)) {
      Kid.newKid(this);
      this.kidEta = 400 / (30 + this.time);
    }

    let dirVec: V2[] = [, [0, 0], [0, 0]];

    for (let i = 0; i < 8; i++) {
      if (dirKeysPressed[i]) {
        let player = Math.floor(i / 4) + 1;
        v2.inc(dirVec[player], dirVecs[i % 4]);
        if (!this.players[player]) this.spawnPlayer(player);        
      }
    }
    for (let p = 1; p <= 2; p++) {
      if (this.players[p]) this.players[p].dir = dirVec[p];
    }

    /*let dirVec = dirKeysPressed.reduce(
      (prev, cur, ind) => (cur ? v2.sum(prev, dirVecs[ind % 4]) : prev),
      [0, 0] as V2
    );*/

    this.tramDeform += this.tramVel * dTime;
    this.tramVel =
      this.tramVel * (1 - Math.abs(this.tramVel) * dTime * 0.3) -
      this.tramDeform * dTime * 100;

    for (let p of this.kids) {
      p.update(dTime);
    }

    for (let p of this.kids) {
      p.collide(dTime);
    }

    this.fx = this.fx.filter(b => b.update(dTime));

    this.kids = this.kids.filter(b => {
      if(b.at[1] > this.height + 20){
        if(b.isPlayer){
          delete this.players[b.player];
          this.score[b.player] -= 5;
        }
        if(b.lastHitBy){
          this.score[b.lastHitBy] ++;
        }
        return false;
      }
      return true;
    });

    this.draw();

    if(this.over())
      this.updateUI();
  }

  get tramH() {
    return this.tramCenter + this.tramDeform;
  }

  playersAlive(){
    return this.players.some(k=>k)
  }

  draw() {
    let ctx = this.ctx;

    ctx.fillStyle = "black";
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.fillRect(50, this.tramH, this.width - 100, 30);
    ctx.restore();

    for (let kid of this.kids) kid.draw();

    for (let fx of this.fx) fx.draw();

    ctx.save();
    ctx.font = `24pt Verdana`;
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    if(this.kids.length>0)
      ctx.fillText(`Kids: ${this.kids.length}/15`, this.width/2, 30);
    
    for(let i=1;i<=2;i++){
      if(this.score[i])
        ctx.fillText(`P${i} ${this.score[i]} pts`, i==1?200:this.width-200, 30);
    }


    /*if (this.player.at[1] > this.height + 20) {
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.fillText(
        "You have fallen. Game over.",
        this.width / 2,
        this.height / 2
      );
      ctx.font = `12pt Verdana`;
      ctx.fillText(
        "Press ESC to restart",
        this.width / 2,
        this.height / 2 + 50
      );
    }*/
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
    let oced = code.slice();
    oced[23] *= Math.random() * 0.2 + 0.8;
    oced[5] *= Math.random() + 0.5;
    this.sfx(oced);
  }

  hitSfx(volume = 1) {
    //this.sfxRnd([0,,0.0102,,0.1697,0.45,,-0.4679,,,,,,0.1052,,,,,1,,,0.1629,,0.5])
    this.sfxRnd([
      3,
      ,
      0.0366,
      ,
      0.2694,
      0.4668,
      ,
      -0.6978,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      1,
      ,
      ,
      ,
      ,
      0.5 * volume
    ]);
  }
}
