import * as v2 from "./v2";
import { V2 } from "./v2";
import Game from "./Game";

import { randomElement } from "./Util";
import Accessory from "./Accessory";

let hairColors = ["black", "black", "brown", "brown", "yellow", "purple"];
let skinColors = [
  "#8d5524",
  "#c68642",
  "#e0ac69",
  "#f1c27d",
  "#ffdbac",
  "#ffdbac",
  "#ffdbac"
];
let shirtColors = [
  "black",
  "white",
  "white",
  "white",
  "gray",
  "pink",
  "yellow",
  "orange"
];
let pantsColors = ["black", "blue", "brown", "brown", "gray", "darkgreen"];
let accessoryColors = [
  "black",
  "blue",
  "black",
  "brown",
  "gray",
  "darkgreen",
  "darkRed",
  "white"
];

const stunLength = 3;

export default class Kid {
  at: V2 = [0, 0];
  vel: V2 = [0, 0];
  aiVel: V2;
  dir: V2 = [0, 0];
  deform = 0;
  mass = 1;
  state: number;
  speed = 1;
  lastHitBy = 0;
  lastHitTime = 0;

  hair = "brown";
  skin = "#eb9";
  shirt = "white";
  pants = "blue";
  accessory: Accessory;
  r = 20;

  rotation = 0;

  stun = 0;

  player: number;

  get friction(): V2 {
    if (this.isPlayer && this.stun == 0) return [10, 0.5];
    else return [0.2, 1];
  }

  get isPlayer() {
    return this.player > 0;
  }

  constructor(public game: Game, o?: any) {
    Object.assign(this, o);
    game.kids.push(this);
  }

  get eyeShift() {
    return v2.scale(this.vel, 0.0004);
  }

  draw() {
    let ctx = this.game.ctx;

    ctx.save();

    ctx.shadowColor = `rgba(0,0,0,0.5)`;
    ctx.shadowBlur = 1;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    ctx.lineWidth = 0.01;

    ctx.translate(...this.at);

    if (this.isPlayer) {
      ctx.textAlign = "center";
      ctx.font = `12pt Verdana`;
      ctx.fillStyle = "black";
      ctx.fillText("P" + this.player, 0, -40);
    }

    ctx.scale(
      this.r * (1 - this.deform * 0.5),
      this.r * (1 + this.deform * 0.5)
    );
    ctx.rotate(this.rotation);

    ctx.beginPath();
    ctx.fillStyle = this.skin;
    ctx.arc(0, 0, 1, Math.PI, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = this.shirt;
    ctx.arc(0, 0, 1, 0, Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = this.pants;
    ctx.arc(0, 0, 1, 0.5, Math.PI - 0.5);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = this.hair;
    ctx.arc(0, 0, 1, Math.PI + 0.7, -0.7);
    ctx.fill();

    if (this.stun) {
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.beginPath();
      ctx.arc(-0.4, -0.3, 0.15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0.4, -0.3, 0.25, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();

      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(0.4, -0.3, 0.1, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();

      ctx.beginPath();
      ctx.arc(-0.4, -0.3, 0.05, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();
    } else {
      ctx.lineWidth = 0.1;
      ctx.strokeStyle = "black";

      ctx.save();
      ctx.translate(...this.eyeShift);
      if (this.isPlayer) {
        ctx.beginPath();
        ctx.moveTo(0.2, -0.3);
        ctx.lineTo(0.6, -0.3);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-0.2, -0.3);
        ctx.lineTo(-0.6, -0.3);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(0.4, -0.25);
        ctx.lineTo(0.4, -0.5);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-0.4, -0.25);
        ctx.lineTo(-0.4, -0.5);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.save();
    ctx.lineWidth = 0.05;
    ctx.strokeStyle = `rgba(255,255,255,0.8)`;

    ctx.shadowOffsetX = -1;
    ctx.shadowOffsetY = -1;

    ctx.beginPath();
    ctx.moveTo(0, 0.7);
    ctx.lineTo(0, 1);
    ctx.stroke();
    ctx.restore();

    if (this.accessory) this.accessory.draw();

    ctx.restore();
  }

  think(dTime: number) {
    if (!this.isPlayer) {
      if (this.stun >= 0) this.dir = [0, 0];

      if (this.stun == 0) {
        this.dir[1] = Math.sign(this.vel[1]) * 0.5;
        if (
          Math.random() < dTime / 3 ||
          this.at[0] < 100 ||
          this.at[0] > this.game.width - 100
        ) {
          this.dir[0] =
            (this.at[0] > this.game.width / 2 ? -1 : 1) *
            (Math.random() * 0.5 + 0.5);
          //console.log(this);
        }
      }
    }
  }

  hit(newVel: V2, other: Kid) {
    let strength = v2.dist(this.vel, newVel);

    if (other.isPlayer) {
      this.game.hitSfx(strength / 500);
      this.lastHitBy = other.player;
      this.lastHitTime = 0;

      if (strength > 500) {
        if (other.isPlayer) {
          if (this.accessory) {
            this.accessory.launch();
            delete this.accessory;
          }
        }
        this.stun = stunLength;
      }
    }
  }

  get momentum() {
    return v2.scale(this.vel, this.mass);
  }

  collide(dTime: number) {
    for (let b of this.game.kids) {
      if (b == this) continue;
      let delta = v2.delta(this.at, b.at);
      let mirror = v2.rot(delta);
      let dist = v2.length(delta);
      let depth = this.r + b.r - dist;
      if (depth >= 0) {
        let sumMass = this.mass + b.mass;

        let sysVel = v2.scale(v2.sum(this.momentum, b.momentum), 1 / sumMass);

        let newVelThis = v2.sum(
          sysVel,
          v2.reflect(v2.delta(sysVel, this.vel), mirror)
        );
        let newVelB = v2.sum(
          sysVel,
          v2.reflect(v2.delta(sysVel, b.vel), mirror)
        );

        b.hit(newVelB, this);

        this.hit(newVelThis, b);

        this.vel = newVelThis;
        b.vel = newVelB;

        this.at = v2.sum(this.at, this.vel, dTime * 3);
        b.at = v2.sum(b.at, b.vel, dTime * 3);
      }
    }
  }

  update(dTime: number) {
    this.think(dTime);

    this.stun = Math.max(0, this.stun - dTime);

    let acc = v2.mul(this.dir, [2000, 600], dTime);
    v2.inc(this.vel, acc);

    v2.inc(this.at, this.vel, dTime);
    v2.inc(this.vel, [0, 1000], dTime);

    this.vel[0] *= 1 - dTime * this.friction[0];
    this.vel[1] *= 1 - dTime * this.friction[1];
    this.deform *= 1 - dTime * 3;

    if (
      this.at[1] >= this.game.tramH - this.r &&
      this.at[0] >= 30 &&
      this.at[0] <= this.game.width - 30
    ) {
      this.at[1] = this.game.tramH - this.r;
      if (this.vel[1] > 0) {
        this.vel[1] = -this.vel[1];
        this.deform = -this.vel[1] * 0.001;
      }
      this.game.tramDeform = 7;
    }

    if (this.at[1] < 10) {
      this.vel[1] = Math.abs(this.vel[1]);
      this.deform = this.vel[1] * 0.001;
    }

    if (this.stun) {
      this.rotation += ((Math.PI * 2) / stunLength) * dTime;
    } else {
      this.rotation = 0;
    }

    if(this.lastHitBy){
      this.lastHitTime += dTime;
      if(this.lastHitTime >= 10)
        this.lastHitBy = 0;
    }

    return true;
  }

  static newKid(game: Game) {
    let side = Math.random() < 0.5 ? -1 : 1;
    let rni = game.rni;
    let size = 0.8 + Math.random() * 0.4;
    let kid = new Kid(game, {
      dir: [-side, 0],
      speed: Math.random() * 0.5 + 0.5,
      at: [side == -1 ? -30 : game.width + 30, rni() % 600],
      hair: randomElement(hairColors, rni),
      pants: randomElement(pantsColors, rni),
      skin: randomElement(skinColors, rni),
      shirt: randomElement(shirtColors, rni),
      r: size * 20,
      mass: size ** 2 * 1
    });
    kid.accessory = new Accessory(
      kid,
      1 + (rni() % 6),
      randomElement(accessoryColors, rni)
    );
    return kid;
  }
}

/*if (this.at[1] >= this.game.tramH - 20) {
  if (this.vel[1] > this.game.tramVel) {
    let energy = this.vel[1] - this.game.tramVel;
    this.game.tramVel += energy * 0.5;
    this.vel[1] = this.game.tramVel;
  }
  this.at[1] = this.game.tramH - 20;      
}*/

/*
        let newVelThis:V2 = [
          (this.vel[0] * dMass + 2 * b.mass * b.vel[0]) / sumMass,
          (this.vel[1] * dMass + 2 * b.mass * b.vel[1]) / sumMass
        ];
        let newVelB:V2 = [
          (-b.vel[0] * dMass + 2 * this.mass * this.vel[0]) / sumMass,
          (-b.vel[1] * dMass + 2 * this.mass * this.vel[1]) / sumMass
        ];

*/
