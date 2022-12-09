

//file used for the background of the index page
// creates the stars and the movement of the stars to make it look like traveling through space
const numStars = 300;
let stars = [];
let size = {
    x: window.innerWidth,
    y: window.innerHeight
}

function setup() {
  var canvas = createCanvas(size.x, size.y);
  stroke(255);
  strokeWeight(1);
  canvas.id('spaceBackground');
  canvas.parent('index-wrapper');
  for(let i = 0; i < numStars; i ++) {
    stars.push(new Star(random(width), random(height)));
  }
}

function draw() {
  background(0, 50);
  
  const acc = 0.01;
  
  stars = stars.filter(star => {
    star.draw();
    star.update(acc);
    return star.isActive();
  });
  
  while(stars.length < numStars) {
    stars.push(new Star(random(width), random(height)));
  }
}

class Star {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.prevPos = createVector(x, y);
    
    this.vel = createVector(0, 0);
    
    this.ang = atan2(y - (height/2), x - (width/2));
  }
  
  isActive() {
    return onScreen(this.prevPos.x, this.prevPos.y);
  }
  
  update(acc) {
    this.vel.x += cos(this.ang) * acc;
    this.vel.y += sin(this.ang) * acc;
    
    this.prevPos.x = this.pos.x;
    this.prevPos.y = this.pos.y;
    
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
  }
  
  draw() {
    const alpha = map(this.vel.mag(), 0, 3, 0, 255);
    stroke(255, alpha);
    line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
  }
}

function onScreen(x, y) {
  return x >= 0 && x <= width && y >= 0 && y <= height;  
}

function windowResized() {
    size.x = window.innerWidth;
    size.y = window.innerHeight;
    resizeCanvas(size.x, size.y);

}
// function windowResized() {
//     resizeCanvas(window.innerWidth, window.innerHeight);
// }