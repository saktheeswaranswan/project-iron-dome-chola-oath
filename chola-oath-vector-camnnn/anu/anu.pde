// Global variables
let video;
let domeSlider;        // Slider to adjust dome size
let domeSize = 300;    // Default dome radius
let missiles = [];     // Array to hold incoming enemy missiles
let counterMissiles = [];  // Array for counter–missiles fired from the dome

function setup() {
  // Create a WEBGL canvas for 3D rendering.
  createCanvas(800, 600, WEBGL);
  
  // Set up live webcam capture and hide the default video element.
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  
  // Create a slider to control the dome's size (radius). Position it on the page.
  domeSlider = createSlider(100, 600, 300, 1);
  domeSlider.position(10, 10);
  
  // Set some drawing settings
  noStroke();
}

function draw() {
  // Clear the canvas.
  background(0);
  
  // *** Draw the live webcam feed as a textured plane behind the 3D scene ***
  push();
    // Move far back along the Z axis to serve as a background.
    translate(0, 0, -1000);
    // Use the webcam video as a texture.
    texture(video);
    // Draw a plane that covers the canvas background.
    plane(width, height);
  pop();
  
  // Update the dome size from the slider.
  domeSize = domeSlider.value();
  
  // *** Draw the transparent Iron Dome ***
  push();
    // Position the dome at the center (0,0,0)
    translate(0, 0, 0);
    // Enable transparency: set fill with an alpha value and a stroke.
    fill(0, 150, 255, 50);
    stroke(0, 150, 255, 150);
    strokeWeight(2);
    // Draw the dome as a sphere. (For a “dome” you might later clip or only render the top half.)
    sphere(domeSize);
  pop();
  
  // *** Spawn incoming enemy missiles at intervals ***
  if (frameCount % 60 === 0) {  // every ~1 second at 60fps
    spawnMissile();
  }
  
  // *** Update and display enemy missiles ***
  for (let i = missiles.length - 1; i >= 0; i--) {
    let m = missiles[i];
    m.update();
    m.display();
    
    // If the missile reaches the dome (i.e. inside the dome's radius), launch a counter missile.
    if (m.pos.mag() < domeSize && m.active) {
      counterMissiles.push(new CounterMissile(m));
      m.active = false;  // mark enemy missile as intercepted
    }
    
    // Remove missile if no longer active (offscreen or intercepted).
    if (!m.active) {
      missiles.splice(i, 1);
    }
  }
  
  // *** Update and display counter missiles ***
  for (let i = counterMissiles.length - 1; i >= 0; i--) {
    let cm = counterMissiles[i];
    cm.update();
    cm.display();
    
    // Remove counter missile if it has reached its target.
    if (!cm.active) {
      counterMissiles.splice(i, 1);
    }
  }
  
  // *** Optional: Display status text ***
  push();
    resetMatrix();
    fill(255);
    textSize(16);
    text("Dome Size: " + domeSize, 10, height - 20);
    text("Enemy Missiles: " + missiles.length, 10, height - 40);
    text("Counter Missiles: " + counterMissiles.length, 10, height - 60);
  pop();
}

// --------------------------------------------
// Enemy Missile Class
// --------------------------------------------
class Missile {
  constructor(pos, vel) {
    this.pos = pos.copy();   // Current position (p5.Vector)
    this.vel = vel.copy();   // Velocity vector (p5.Vector)
    this.active = true;      // Flag to indicate if missile is active
  }
  
  update() {
    // Move the missile along its velocity.
    this.pos.add(this.vel);
    // Optionally, if the missile goes far beyond the scene, mark it inactive.
    if (this.pos.mag() > 2000) {
      this.active = false;
    }
  }
  
  display() {
    push();
      translate(this.pos.x, this.pos.y, this.pos.z);
      // Draw missile as a small red sphere.
      fill(255, 0, 0);
      noStroke();
      sphere(5);
    pop();
  }
}

// --------------------------------------------
// Counter Missile Class
// --------------------------------------------
class CounterMissile {
  constructor(targetMissile) {
    // Start from the center of the dome.
    this.pos = createVector(0, 0, 0);
    this.target = targetMissile;  // Reference to the enemy missile object
    // Initialize velocity pointing toward the enemy missile.
    this.vel = p5.Vector.sub(this.target.pos, this.pos).setMag(5);
    this.active = true;
  }
  
  update() {
    // Recompute desired velocity toward the moving target.
    let desired = p5.Vector.sub(this.target.pos, this.pos);
    desired.setMag(5);
    this.vel = desired;
    this.pos.add(this.vel);
    // If close enough to the target, consider it intercepted.
    if (p5.Vector.dist(this.pos, this.target.pos) < 10) {
      this.active = false;
      this.target.active = false;
      // (You could add explosion effects here.)
    }
  }
  
  display() {
    push();
      translate(this.pos.x, this.pos.y, this.pos.z);
      // Draw counter missile as a small yellow sphere.
      fill(255, 255, 0);
      noStroke();
      sphere(3);
    pop();
  }
}

// --------------------------------------------
// Missile Spawning Function
// --------------------------------------------
function spawnMissile() {
  // Spawn a missile from a random point on a sphere surrounding the dome.
  // Choose a radius just outside the dome.
  let r = domeSize + 100;
  let theta = random(TWO_PI);
  let phi = random(PI); // full sphere for randomness
  // Convert spherical coordinates to Cartesian.
  let x = r * sin(phi) * cos(theta);
  let y = r * sin(phi) * sin(theta);
  let z = r * cos(phi);
  let pos = createVector(x, y, z);
  // The velocity is directed from the spawn position toward the center (0,0,0).
  let vel = p5.Vector.sub(createVector(0, 0, 0), pos).setMag(2);
  missiles.push(new Missile(pos, vel));
}
