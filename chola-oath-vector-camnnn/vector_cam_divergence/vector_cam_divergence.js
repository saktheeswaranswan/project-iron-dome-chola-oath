let video;
let uvLeft = 50, uvRight = 350, uvTop = 50, uvBottom = 350;     // Domain (left) panel boundaries
let xyLeft = 400, xyRight = 700, xyTop = 50, xyBottom = 350;      // Transformed (right) panel boundaries

let squareCenter, squareSize;
let sizeSlider;

function setup() {
  createCanvas(750, 400);
  
  // Start video capture and hide the default element
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  
  textSize(14);
  // Initialize square center (in domain coordinates) and side length.
  squareCenter = createVector(0, 0);
  squareSize = 2;
  
  // Slider to adjust the square's side length.
  sizeSlider = createSlider(0.5, 5, 2, 0.1);
  sizeSlider.position(20, 20);
}

function draw() {
  background(240);
  
  // Draw the live webcam feed as a transparent background.
  tint(255, 150);
  image(video, 0, 0, width, height);
  noTint();
  
  // Draw semi-transparent backgrounds for both panels.
  drawPanels();
  
  // Draw the vector field on the domain panel.
  drawVectorField();
  
  // Update the square size from the slider.
  squareSize = sizeSlider.value();
  
  // Draw the blue square (domain) with corner coordinate labels.
  drawDomainSquare();
  
  // Draw the transformed red region with labels.
  drawTransformedRegion();
  
  // Compute and display the divergence at the square’s center.
  displayDivergence();
  
  // Draw overall panel labels.
  drawLabels();
}

function drawPanels() {
  // White semi-transparent backgrounds for the panels.
  noStroke();
  fill(255, 255, 255, 200);
  rect(uvLeft, uvTop, uvRight - uvLeft, uvBottom - uvTop);
  rect(xyLeft, xyTop, xyRight - xyLeft, xyBottom - xyTop);
  
  // Draw panel borders.
  stroke(150);
  noFill();
  rect(uvLeft, uvTop, uvRight - uvLeft, uvBottom - uvTop);
  rect(xyLeft, xyTop, xyRight - xyLeft, xyBottom - xyTop);
}

function drawVectorField() {
  // Plot the vector field F(x,y) = (x+y, x^2-y^2) over a grid in the domain.
  let spacing = 1.0; // Grid spacing in domain units.
  stroke(0, 150, 0);
  fill(0, 150, 0);
  
  // The mapping from domain [-5,5] to screen: (uvRight-uvLeft) covers 10 units.
  let pixelScale = (uvRight - uvLeft) / 10;  // pixels per unit
  let arrowScale = 0.1;  // Scale factor to keep arrows from being too long
  
  // Iterate over a grid in the domain.
  for (let x = -5; x <= 5; x += spacing) {
    for (let y = -5; y <= 5; y += spacing) {
      let pt = createVector(x, y);
      let vec = createVector(x + y, x*x - y*y);
      vec.mult(arrowScale);  // Scale down the vector field for drawing
      
      // Convert the domain point to screen coordinates.
      let base = domainToScreen(pt);
      // Multiply by pixelScale to convert vector length to pixels.
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

function drawDomainSquare() {
  // Compute the four corners of the square in domain coordinates.
  let half = squareSize / 2;
  let bl = createVector(squareCenter.x - half, squareCenter.y - half);
  let br = createVector(squareCenter.x + half, squareCenter.y - half);
  let tr = createVector(squareCenter.x + half, squareCenter.y + half);
  let tl = createVector(squareCenter.x - half, squareCenter.y + half);
  let corners = [bl, br, tr, tl];
  
  // Draw the blue square.
  stroke(0, 0, 255);
  noFill();
  beginShape();
  for (let i = 0; i < corners.length; i++) {
    let pos = domainToScreen(corners[i]);
    vertex(pos.x, pos.y);
  }
  endShape(CLOSE);
  
  // Draw the draggable center as a green dot.
  fill(0, 255, 0);
  noStroke();
  let centerScreen = domainToScreen(squareCenter);
  ellipse(centerScreen.x, centerScreen.y, 10, 10);
  
  // Label each corner with its (x,y) coordinates.
  fill(0);
  noStroke();
  for (let corner of corners) {
    let pos = domainToScreen(corner);
    let label = '(' + nf(corner.x, 1, 2) + ', ' + nf(corner.y, 1, 2) + ')';
    text(label, pos.x + 5, pos.y - 5);
  }
}

function drawTransformedRegion() {
  // Compute the square's corners in domain coordinates.
  let half = squareSize / 2;
  let bl = createVector(squareCenter.x - half, squareCenter.y - half);
  let br = createVector(squareCenter.x + half, squareCenter.y - half);
  let tr = createVector(squareCenter.x + half, squareCenter.y + half);
  let tl = createVector(squareCenter.x - half, squareCenter.y + half);
  
  // Apply the transformation: F(x,y) = (x+y, x^2-y^2)
  let f_bl = transformPoint(bl);
  let f_br = transformPoint(br);
  let f_tr = transformPoint(tr);
  let f_tl = transformPoint(tl);
  
  // Draw the red transformed region in the right panel.
  stroke(255, 0, 0);
  fill(255, 100, 100, 150);
  beginShape();
  vertex(transformToScreen(f_bl).x, transformToScreen(f_bl).y);
  vertex(transformToScreen(f_br).x, transformToScreen(f_br).y);
  vertex(transformToScreen(f_tr).x, transformToScreen(f_tr).y);
  vertex(transformToScreen(f_tl).x, transformToScreen(f_tl).y);
  endShape(CLOSE);
  
  // Label each transformed corner with its (x', y') coordinates.
  fill(0);
  noStroke();
  let transformedCorners = [f_bl, f_br, f_tr, f_tl];
  for (let pt of transformedCorners) {
    let pos = transformToScreen(pt);
    let label = '(' + nf(pt.x, 1, 2) + ', ' + nf(pt.y, 1, 2) + ')';
    text(label, pos.x + 5, pos.y - 5);
  }
}

function displayDivergence() {
  // For F(x,y) = (x+y, x^2-y^2), the divergence at the square's center is:
  //   div = ∂/∂x (x+y) + ∂/∂y (x^2-y^2) = 1 - 2y.
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
  text(msg, xyLeft + 10, xyTop + 20);
}

function drawLabels() {
  fill(0);
  noStroke();
  text('Domain (x,y) with F(x,y) = (x+y, x^2-y^2) & vector field', uvLeft, uvTop - 20);
  text('Transformed Region', xyLeft, xyTop - 20);
}

// Mapping from domain coordinates (x,y) in [-5,5] to screen coordinates in the left panel.
function domainToScreen(pt) {
  let sx = map(pt.x, -5, 5, uvLeft, uvRight);
  let sy = map(pt.y, -5, 5, uvBottom, uvTop);
  return createVector(sx, sy);
}

// Transformation F(x,y) = (x+y, x^2-y^2)
function transformPoint(pt) {
  return createVector(pt.x + pt.y, pt.x*pt.x - pt.y*pt.y);
}

// Mapping from transformed coordinates to screen coordinates in the right panel.
// (Assuming x' ∈ [–10,10] and y' ∈ [–25,25] for this visualization.)
function transformToScreen(pt) {
  let sx = map(pt.x, -10, 10, xyLeft, xyRight);
  let sy = map(pt.y, -25, 25, xyBottom, xyTop);
  return createVector(sx, sy);
}

// Allow dragging of the green center dot within the domain panel.
function mouseDragged() {
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
