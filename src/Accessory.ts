import Kid from "./Kid";
import FX from "./FX";
type V2 = [number, number];
import * as v2 from "./v2";

export default class Accessory extends FX {
  time = 0;
  mounted = true;
  vel:V2;
  at:V2;

  constructor(public kid: Kid, public type: number, public color: string) {
    super(kid.game);
  }

  update(dTime: number) {    
    this.time += dTime;
    this.at = v2.sum(this.at, this.vel, dTime)
    this.vel = v2.sum(this.vel, [0,400], dTime)
    return this.at[1] < this.game.height + 40;
  }

  launch(){
    this.game.fx.push(this);
    this.mounted = false;
    this.vel = [0,-100];
    this.at = v2.sum(this.kid.at, this.shift)
  }

  get shift() {
    return [[0, 0], [0, -1], [0, -1], [0,0], [0, -0.4], [0, -0.5], [0, 1.1]][
      this.type
    ] as V2;
  }

  draw() {
    let ctx = this.game.ctx;
    ctx.save();

    if(!this.mounted){
      ctx.translate(...this.at)
      ctx.scale(20, 20);
      ctx.rotate(-this.time*10);
    }

    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 0.05;

    if ([4, 5].includes(this.type) && this.mounted) {
      ctx.translate(...this.kid.eyeShift);
    }

    if (this.mounted)
      ctx.translate(...this.shift);

    switch (this.type) {
      case 1:
        ctx.beginPath();
        ctx.moveTo(-0.9, 0.4);
        ctx.quadraticCurveTo(-0.9, -0.2, 0, -0.2);
        ctx.quadraticCurveTo(0.9, -0.2, 0.9, 0.4);
        ctx.lineTo(-1.2, 0.4);
        ctx.lineTo(-1.2, 0.3);
        ctx.lineTo(-0.7, 0.3);
        ctx.fill();
        break;

      case 2:
        ctx.beginPath();
        ctx.moveTo(-0.9, 0.3);
        ctx.lineTo(-0.9, -0.2);
        ctx.lineTo(0.9, -0.2);
        ctx.lineTo(0.9, 0.3);
        ctx.lineTo(1.3, 0.3);
        ctx.lineTo(1.3, 0.4);
        ctx.lineTo(-1.3, 0.4);
        ctx.lineTo(-1.3, 0.3);
        ctx.fill();
        break;

      case 3:
        ctx.beginPath();
        ctx.lineTo(-0.5, -0.2);
        ctx.lineTo(0.5, 0.2);
        ctx.lineTo(0.5, -0.2);
        ctx.lineTo(-0.5, 0.2);
        ctx.lineTo(-0.5, -0.2);
        ctx.fill();
        break;

      case 4:
        ctx.fillStyle = `rgba(200,200,200,0.5)`;
        ctx.beginPath();
        ctx.arc(-0.4, 0, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0.4, 0, 0.4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();
        break;

      case 5:
        ctx.fillStyle = `black`;

        ctx.beginPath();
        ctx.arc(-0.4, 0, 0.4, 0, Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0.4, 0, 0.4, 0, Math.PI);
        ctx.stroke();
        ctx.fill();
        break;

      case 6:
        ctx.beginPath();
        ctx.arc(-0.5, 0, 0.35, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0.5, 0, 0.35, Math.PI, Math.PI * 2);
        ctx.fill();
        break;
    }
    ctx.restore();
  }
}
