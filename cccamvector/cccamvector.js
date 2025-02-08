let video;
let uvLeft = 50, uvRight = 350, uvTop = 50, uvBottom = 350;     // Domain (left) panel boundaries
let xyLeft = 400, xyRight = 700, xyTop = 50, xyBottom = 350;      // Transformed (right) panel boundaries

let squareCenter, squareSize;
let sizeSlider;

function setup() {
  createCanvas(750, 500);
  
  // Start video capture and hide its default element.
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  
  textSize(14);
  // Initialize square center (domain coordinates) and default side length.
  squareCenter = createVector(0, 0);
  squareSize = 2;
  
  // Create slider to adjust the square's side length.
  sizeSlider = createSlider(0.5, 5, 2, 0.1);
  sizeSlider.position(20, 20);
}

function draw() {
  background(240);
  
  // Draw the webcam feed as a transparent background.
  tint(255, 150);
  image(video, 0, 0, width, height);
  noTint();
  
  // Draw white, semi-transparent panel backgrounds.
  drawPanels();
  
  // Draw the vector field over the domain.
  drawVectorField();
  
  // Animate a rotating dot at each grid point to indicate local circulation.
  drawRotationAnimation();
  
  // Update the square's side length from the slider.
  squareSize = sizeSlider.value();
  
  // Draw the blue square (with its labeled corners) and draggable center.
  drawDomainSquare();
  
  // Draw the transformed red region in the right panel.
  drawTransformedRegion();
  
  // Display divergence (at the square's center) in the right panel.
  displayDivergence();
  
  // Compute and display the circulation along the square's boundary.
  displayCirculation();
  
  // Overall labels.
  drawLabels();
}

function drawPanels() {
  noStroke();
  fill(255, 255, 255, 200);
  rect(uvLeft, uvTop, uvRight - uvLeft, uvBottom - uvTop);
  rect(xyLeft, xyTop, xyRight - xyLeft, xyBottom - xyTop);
  
  stroke(150);
  noFill();
  rect(uvLeft, uvTop, uvRight - uvLeft, uvBottom - uvTop);
  rect(xyLeft, xyTop, xyRight - xyLeft, xyBottom - xyTop);
}

function drawVectorField() {
  // Plot F(x,y) = (x+y, x^2-y^2) over a grid in the domain.
  let spacing = 1.0; // grid spacing in domain units
  stroke(0, 150, 0);
  fill(0, 150, 0);
  // Convert domain units to pixels (left panel spans 10 units).
  let pixelScale = (uvRight - uvLeft) / 10;
  let arrowScale = 0.1;  // reduce arrow lengths
  for (let x = -5; x <= 5; x += spacing) {
    for (let y = -5; y <= 5; y += spacing) {
      let pos = createVector(x, y);
      let vec = createVector(x + y, x*x - y*y);
      vec.mult(arrowScale);
      let base = domainToScreen(pos);
      let arrow = vec.copy().mult(pixelScale);
      drawArrow(base, arrow);
    }
  }
}

function drawArrow(base, vec) {
  push();
  translate(base.x, base.y);
  line(0, 0, vec.x, vec.y);
  push();
  translate(vec.x, vec.y);
  rotate(vec.heading());
  let arrowSize = 4;
  noStroke();
  fill(0, 150, 0);
  triangle(0, arrowSize/2, 0, -arrowSize/2, arrowSize, 0);
  pop();
  pop();
}

function drawRotationAnimation() {
  // At each grid point, animate a small purple dot revolving around a circle.
  let spacing = 1.0; // domain grid spacing
  let pixelScale = (uvRight - uvLeft) / 10;
  let R = 5; // radius (in pixels) for the animated circle
  // Loop over domain grid points.
  for (let x = -5; x <= 5; x += spacing) {
    for (let y = -5; y <= 5; y += spacing) {
      let pos = createVector(x, y);
      // Compute local curl: for F(x,y) = (x+y, x^2-y^2), curl = 2x - 1.
      let curl = 2 * pos.x - 1;
      // Set angular speed proportional to local curl (adjust scaling as needed).
      let angularSpeed = 0.05 * curl;
      let angle = frameCount * angularSpeed;
      // Compute animated dot's offset from the grid point.
      let dx = R * cos(angle);
      let dy = R * sin(angle);
      let screenPos = domainToScreen(pos);
      
      // Draw a faint circle around the grid point.
      noFill();
      stroke(200, 0, 200, 150);
      ellipse(screenPos.x, screenPos.y, 2*R, 2*R);
      
      // Draw the rotating dot.
      noStroke();
      fill(200, 0, 200);
      ellipse(screenPos.x + dx, screenPos.y + dy, 4, 4);
    }
  }
}

function drawDomainSquare() {
  // Compute square corners in domain coordinates.
  let half = squareSize / 2;
  let bl = createVector(squareCenter.x - half, squareCenter.y - half);
  let br = createVector(squareCenter.x + half, squareCenter.y - half);
  let tr = createVector(squareCenter.x + half, squareCenter.y + half);
  let tl = createVector(squareCenter.x - half, squareCenter.y + half);
  let corners = [bl, br, tr, tl];
  
  // Draw blue square.
  stroke(0, 0, 255);
  noFill();
  beginShape();
  for (let pt of corners) {
    let screenPt = domainToScreen(pt);
    vertex(screenPt.x, screenPt.y);
  }
  endShape(CLOSE);
  
  // Draw draggable center (green dot).
  fill(0, 255, 0);
  let centerScreen = domainToScreen(squareCenter);
  noStroke();
  ellipse(centerScreen.x, centerScreen.y, 10, 10);
  
  // Label each corner with its (x,y) coordinates.
  fill(0);
  noStroke();
  for (let pt of corners) {
    let screenPt = domainToScreen(pt);
    let label = '(' + nf(pt.x, 1, 2) + ', ' + nf(pt.y, 1, 2) + ')';
    text(label, screenPt.x + 5, screenPt.y - 5);
  }
}

function drawTransformedRegion() {
  // Compute square corners in domain coordinates.
  let half = squareSize / 2;
  let bl = createVector(squareCenter.x - half, squareCenter.y - half);
  let br = createVector(squareCenter.x + half, squareCenter.y - half);
  let tr = createVector(squareCenter.x + half, squareCenter.y + half);
  let tl = createVector(squareCenter.x - half, squareCenter.y + half);
  
  // Transform corners: F(x,y) = (x+y, x^2-y^2).
  let f_bl = transformPoint(bl);
  let f_br = transformPoint(br);
  let f_tr = transformPoint(tr);
  let f_tl = transformPoint(tl);
  
  // Draw red transformed region.
  stroke(255, 0, 0);
  fill(255, 100, 100, 150);
  beginShape();
  vertex(transformToScreen(f_bl).x, transformToScreen(f_bl).y);
  vertex(transformToScreen(f_br).x, transformToScreen(f_br).y);
  vertex(transformToScreen(f_tr).x, transformToScreen(f_tr).y);
  vertex(transformToScreen(f_tl).x, transformToScreen(f_tl).y);
  endShape(CLOSE);
  
  // Label each transformed corner.
  fill(0);
  noStroke();
  let transformedCorners = [f_bl, f_br, f_tr, f_tl];
  for (let pt of transformedCorners) {
    let screenPt = transformToScreen(pt);
    let label = '(' + nf(pt.x, 1, 2) + ', ' + nf(pt.y, 1, 2) + ')';
    text(label, screenPt.x + 5, screenPt.y - 5);
  }
}

function displayDivergence() {
  // For F(x,y) = (x+y, x^2-y^2), divergence = 1 - 2y (evaluated at the square's center).
  let div = 1 - 2 * squareCenter.y;
  fill(0);
  noStroke();
  let msg = 'Divergence: ' + nf(div, 1, 2);
  if (div > 0) {
    msg += '  > (expansion)';
  } else if (div < 0) {
    msg += '  < (contraction)';
  } else {
    msg += '  = (neutral)';
  }
  text(msg, xyLeft + 10, xyTop + 40);
}

function computeCirculation() {
  // Compute circulation (line integral) along the square's boundary using a discrete sum.
  let half = squareSize / 2;
  let bl = createVector(squareCenter.x - half, squareCenter.y - half);
  let br = createVector(squareCenter.x + half, squareCenter.y - half);
  let tr = createVector(squareCenter.x + half, squareCenter.y + half);
  let tl = createVector(squareCenter.x - half, squareCenter.y + half);
  let edges = [[bl, br], [br, tr], [tr, tl], [tl, bl]];
  
  let circulation = 0;
  let steps = 20;  // sub–intervals per edge
  
  for (let edge of edges) {
    let start = edge[0];
    let end = edge[1];
    let d = p5.Vector.sub(end, start);
    let dt = 1 / steps;
    for (let i = 0; i < steps; i++) {
      let t = i * dt;
      let pos = p5.Vector.lerp(start, end, t);
      let ds = d.copy().mult(dt);
      // Evaluate F(x,y) = (x+y, x^2-y^2) at pos.
      let F = createVector(pos.x + pos.y, pos.x * pos.x - pos.y * pos.y);
      circulation += F.dot(ds);
    }
  }
  return circulation;
}

function displayCirculation() {
  let circ = computeCirculation();
  // Predicted circulation via Green's theorem (approximation): (curl at center)*(area)
  // Here curl F = 2x - 1 evaluated at squareCenter, and area = squareSize^2.
  let predicted = (2 * squareCenter.x - 1) * (squareSize * squareSize);
  fill(0);
  noStroke();
  let msg = 'Circulation (line integral): ' + nf(circ, 1, 2);
  msg += ' | Predicted (curl*Area): ' + nf(predicted, 1, 2);
  text(msg, xyLeft + 10, xyTop + 60);
}

function drawLabels() {
  fill(0);
  noStroke();
  text('Domain (x,y) with F(x,y) = (x+y, x^2-y^2), vector field & rotation', uvLeft, uvTop - 20);
  text('Transformed Region, Divergence, & Curl Circulation', xyLeft, xyTop - 20);
}

// Mapping from domain (x,y) in [-5,5] to screen coordinates in left panel.
function domainToScreen(pt) {
  let sx = map(pt.x, -5, 5, uvLeft, uvRight);
  let sy = map(pt.y, -5, 5, uvBottom, uvTop);
  return createVector(sx, sy);
}

// Transformation: F(x,y) = (x+y, x^2-y^2).
function transformPoint(pt) {
  return createVector(pt.x + pt.y, pt.x*pt.x - pt.y*pt.y);
}

// Mapping for transformed region (assume x' ∈ [–10,10] and y' ∈ [–25,25]).
function transformToScreen(pt) {
  let sx = map(pt.x, -10, 10, xyLeft, xyRight);
  let sy = map(pt.y, -25, 25, xyBottom, xyTop);
  return createVector(sx, sy);
}

function mouseDragged() {
  // Allow dragging the green center dot within the domain panel.
  if (mouseX >= uvLeft && mouseX <= uvRight && mouseY >= uvTop && mouseY <= uvBottom) {
    let mousePt = screenToDomain(mouseX, mouseY);
    if (dist(mousePt.x, mousePt.y, squareCenter.x, squareCenter.y) < 1) {
      squareCenter.set(mousePt.x, mousePt.y);
    }
  }
}

function screenToDomain(x, y) {
  let u = map(x, uvLeft, uvRight, -5, 5);
  let v = map(y, uvBottom, uvTop, -5, 5);
  return createVector(u, v);
}
