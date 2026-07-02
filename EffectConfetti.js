class EffectConfetti {
  constructor(numConfetto, duration) {
    this.duration = duration;
    this.frameCount = 0;
    this.confettos = [];
    for (let i = 0; i < numConfetto; i++) {
      this.confettos[i] = new Confetto(random(0, width), random(-height/2, 0), random(-1, 1));
    }
  }

  show() {
    for (let confetto of this.confettos) confetto.show();
    this.frameCount++;
    return (this.frameCount > this.duration);
  }
}

class Confetto {
  constructor(_x, _y, _s) {
    this.x = _x;
    this.y = _y;
    this.speed = _s;
    this.time = random(0, 100);
    this.color = random(m_confettoColor);
    this.amp = random(2, 10);
    this.phase = random(0.5, 2);
    this.size = random(width / 25, height / 50);
    this.form = round(random(0, 1));
  }

  show() {
    fill(this.color);
    noStroke();
    push();
    translate(this.x, this.y);
    translate(this.amp * sin(this.time * this.phase), this.speed * cos(2 * this.time * this.phase));
    rotate(this.time);
    rectMode(CENTER);
    scale(cos(this.time / 4), sin(this.time / 4));
    if (this.form === 0) {
      rect(0, 0, this.size, this.size / 2);
    } else {
      ellipse(0, 0, this.size);
    }
    pop();

    this.time = this.time + 0.1;

    this.speed += 1 / 50;

    this.y += this.speed;
    // if (this.y > height) {
    //   this.x = random(0, width);
    //   this.y = random(-height, 0);
    //   this.speed = random(-1, 1);
    // }
  }
}