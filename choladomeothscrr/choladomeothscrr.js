// Global variables
let video;
let domeSlider;          // Slider to adjust dome (and camera rectangle) size
let domeSize = 300;      // Default dome radius
let domePos;             // The moving position of the dome
let missiles = [];       // Array to store enemy missiles
let counterMissiles = []; // Array for counter missiles
let rocketStructures = []; // Array for rocket–like structures with emoji fire

// Variables to control dome locking
let lockButton, releaseButton;
let domeLocked = false;
let lockedDomePos = null;

function setup() {
  // Create an 800x600 WEBGL canvas
  createCanvas(800, 600, WEBGL);
  
  // Set up live webcam capture and hide the default element
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  
  // Create a slider for dome size
  domeSlider = createSlider(100, 600, 300, 1);
  domeSlider.position(10, 10);
  
  // Create buttons to lock and release the dome movement
  lockButton = createButton('Lock Dome');
  lockButton.position(10, 40);
  lockButton.mousePressed(lockDome);
  
  releaseButton = createButton('Release Dome');
  releaseButton.position(100, 40);
  releaseButton.mousePressed(releaseDome);
  
  noStroke();
  // Initialize dome position at the origin
  domePos = createVector(0, 0, 0);
}

function draw() {
  background(0);
  
  // Update domePos: if unlocked, move it in a circular path; if locked, use the saved position.
  if (!domeLocked) {
    let t = frameCount * 0.005;
    domePos.x = sin(t) * 200;
    domePos.y = cos(t) * 200;
    domePos.z = 0;
  } else if (lockedDomePos !== null) {
    // Keep domePos fixed at the locked position
    domePos = lockedDomePos.copy();
  }
  
  // Update domeSize from the slider value
  domeSize = domeSlider.value();
  
  // -------------------------------------------
  // Draw the moving camera rectangle (webcam feed)
  // -------------------------------------------
  push();
    // Position the textured plane at the dome's location, offset slightly in Z
    translate(domePos.x, domePos.y, domePos.z - 5);
    texture(video);
    // Draw a square plane with side length equal to 2*domeSize
    plane(2 * domeSize, 2 * domeSize);
  pop();
  
  // -------------------------------------------
  // Draw the dome (semi–transparent sphere) at domePos
  // -------------------------------------------
  push();
    translate(domePos.x, domePos.y, domePos.z);
    fill(0, 150, 255, 50);
    stroke(0, 150, 255, 150);
    strokeWeight(2);
    sphere(domeSize);
  pop();
  
  // -------------------------------------------
  // Spawn enemy missiles (every ~1 second)
  // -------------------------------------------
  if (frameCount % 60 === 0) {
    spawnMissile();
  }
  
  // Update and display enemy missiles
  for (let i = missiles.length - 1; i >= 0; i--) {
    let m = missiles[i];
    m.update();
    m.display();
    
    // If the missile gets within the dome's radius (from the moving dome), launch a counter missile
    if (p5.Vector.sub(m.pos, domePos).mag() < domeSize && m.active) {
      counterMissiles.push(new CounterMissile(m));
      m.active = false;
    }
    
    // Remove missiles that are no longer active
    if (!m.active) {
      missiles.splice(i, 1);
    }
  }
  
  // Update and display counter missiles
  for (let i = counterMissiles.length - 1; i >= 0; i--) {
    let cm = counterMissiles[i];
    cm.update();
    cm.display();
    if (!cm.active) {
      counterMissiles.splice(i, 1);
    }
  }
  
  // -------------------------------------------
  // Spawn rocket–like structures with emoji (every ~3 seconds)
  // -------------------------------------------
  if (frameCount % 180 === 0) {
    rocketStructures.push(new RocketStructure());
  }
  
  // Update and display rocket structures
  for (let i = rocketStructures.length - 1; i >= 0; i--) {
    let rs = rocketStructures[i];
    rs.update();
    rs.display();
    // Remove rocket structure if it's close to the dome
    if (p5.Vector.sub(rs.pos, domePos).mag() < domeSize * 0.8) {
      rocketStructures.splice(i, 1);
    }
  }
  
  // -------------------------------------------
  // Draw overlay text (2D)
  // -------------------------------------------
  push();
    resetMatrix();
    fill(255);
    textSize(16);
    text("Dome Size: " + domeSize, 10, height - 20);
    text("Enemy Missiles: " + missiles.length, 10, height - 40);
    text("Counter Missiles: " + counterMissiles.length, 10, height - 60);
    text("Rocket Structures: " + rocketStructures.length, 10, height - 80);
    text("Dome " + (domeLocked ? "Locked" : "Moving"), 10, height - 100);
  pop();
}

// ------------------------------------------------------
// Button callback functions to lock/release the dome movement
// ------------------------------------------------------
function lockDome() {
  domeLocked = true;
  lockedDomePos = domePos.copy();  // Save the current dome position
}

function releaseDome() {
  domeLocked = false;
}

// ------------------------------------------------------
// Enemy Missile Class (targets the moving dome)
// Now uses a random emoji (jet, helicopter, or warship) and flies towards the dome
// ------------------------------------------------------
class Missile {
  constructor(pos, vel) {
    this.pos = pos.copy();
    this.vel = vel.copy();
    this.active = true;
    // Choose a random enemy emoji: jet, helicopter, or warship
    this.emoji = random(["✈️", "🚁", "🚢"]);
  }
  
  update() {
    this.pos.add(this.vel);
    if (p5.Vector.sub(this.pos, domePos).mag() > 2000) {
      this.active = false;
    }
  }
  
  display() {
    push();
      translate(this.pos.x, this.pos.y, this.pos.z);
      textAlign(CENTER, CENTER);
      textSize(24);
      text(this.emoji, 0, 0);
    pop();
  }
}

// ------------------------------------------------------
// Counter Missile Class (launched from domePos)
// Uses either a jet or helicopter emoji
// ------------------------------------------------------
class CounterMissile {
  constructor(targetMissile) {
    this.pos = domePos.copy();
    this.target = targetMissile;
    this.vel = p5.Vector.sub(this.target.pos, this.pos).setMag(5);
    this.active = true;
    // Choose randomly between a jet and a helicopter emoji
    this.emoji = random(["✈️", "🚁"]);
  }
  
  update() {
    let desired = p5.Vector.sub(this.target.pos, this.pos);
    desired.setMag(5);
    this.vel = desired;
    this.pos.add(this.vel);
    if (p5.Vector.dist(this.pos, this.target.pos) < 10) {
      this.active = false;
      this.target.active = false;
    }
  }
  
  display() {
    push();
      translate(this.pos.x, this.pos.y, this.pos.z);
      textAlign(CENTER, CENTER);
      textSize(24);
      text(this.emoji, 0, 0);
    pop();
  }
}

// ------------------------------------------------------
// RocketStructure Class with Emoji Animation
// Displays as a ship emoji with animated fire
// ------------------------------------------------------
class RocketStructure {
  constructor() {
    // Spawn at a random point on a sphere around the moving dome
    let r = domeSize + random(150, 300);
    let theta = random(TWO_PI);
    let phi = random(PI);
    let offset = createVector(
      r * sin(phi) * cos(theta),
      r * sin(phi) * sin(theta),
      r * cos(phi)
    );
    this.pos = p5.Vector.add(domePos, offset);
    this.vel = p5.Vector.sub(domePos, this.pos).setMag(random(1, 3));
  }
  
  update() {
    this.pos.add(this.vel);
  }
  
  display() {
    push();
      translate(this.pos.x, this.pos.y, this.pos.z);
      textAlign(CENTER, CENTER);
      textSize(32);
      // Display ship emoji (warship) for the structure
      text("🚢", 0, 0);
      let fireOffset = sin(frameCount * 0.2) * 5;
      textSize(24);
      text("🔥", 0, 30 + fireOffset);
    pop();
  }
}

// ------------------------------------------------------
// Spawn an enemy missile from a random point around domePos
// ------------------------------------------------------
function spawnMissile() {
  let r = domeSize + 100;
  let theta = random(TWO_PI);
  let phi = random(PI);
  let offset = createVector(
    r * sin(phi) * cos(theta),
    r * sin(phi) * sin(theta),
    r * cos(phi)
  );
  let pos = p5.Vector.add(domePos, offset);
  let vel = p5.Vector.sub(domePos, pos).setMag(2);
  missiles.push(new Missile(pos, vel));
}
