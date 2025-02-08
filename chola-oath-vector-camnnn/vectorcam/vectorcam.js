let video;
let uvLeft = 50, uvRight = 350, uvTop = 50, uvBottom = 350;     // Domain panel boundaries (left)
let xyLeft = 400, xyRight = 700, xyTop = 50, xyBottom = 350;      // Transformed panel boundaries (right)

let squareCenter, squareSize;
let sizeSlider;

function setup() {
  createCanvas(750, 400);
  
  // Start the webcam capture
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  
  textSize(14);
  // Initialize the square center (domain coordinates) and default side length.
  squareCenter = createVector(0, 0);
  squareSize = 2;
  
  sizeSlider = createSlider(0.5, 5, 2, 0.1);
  sizeSlider.position(20, 20);
}

function draw() {
  // Draw the live webcam feed as the background (semi-transparent tint so UI remains visible)
  tint(255, 127);
  image(video, 0, 0, width, height);
  noTint();
  
  // Draw white semi-transparent backgrounds for our panels to ensure readability
  drawPanels();
  
  // Update square size from slider
  squareSize = sizeSlider.value();
  
  // Draw the blue square (domain) with coordinate labels
  drawDomainSquare();
  
  // Draw the transformed red region (using F(x,y) = (x+y, x^2-y^2)) with its labels
  drawTransformedRegion();
  
  // Compute and display the divergence at the square’s center
  displayDivergence();
  
  drawLabels();
}

function drawPanels() {
  // Draw white backgrounds for the panels with some transparency
  noStroke();
  fill(255, 255, 255, 230);
  rect(uvLeft, uvTop, uvRight - uvLeft, uvBottom - uvTop);
  rect(xyLeft, xyTop, xyRight - xyLeft, xyBottom - xyTop);
  
  // Draw borders
  stroke(150);
  noFill();
  rect(uvLeft, uvTop, uvRight - uvLeft, uvBottom - uvTop);
  rect(xyLeft, xyTop, xyRight - xyLeft, xyBottom - xyTop);
}

function drawDomainSquare() {
  // Compute corners of the square in the domain (x,y)-coordinates
  let half = squareSize / 2;
  let bl = createVector(squareCenter.x - half, squareCenter.y - half);
  let br = createVector(squareCenter.x + half, squareCenter.y - half);
  let tr = createVector(squareCenter.x + half, squareCenter.y + half);
  let tl = createVector(squareCenter.x - half, squareCenter.y + half);
  let uvCorners = [bl, br, tr, tl];

  // Draw the blue square (domain panel)
  stroke(0, 0, 255);
  noFill();
  beginShape();
  vertex(domainToScreen(bl).x, domainToScreen(bl).y);
  vertex(domainToScreen(br).x, domainToScreen(br).y);
  vertex(domainToScreen(tr).x, domainToScreen(tr).y);
  vertex(domainToScreen(tl).x, domainToScreen(tl).y);
  endShape(CLOSE);
  
  // Draw the draggable center (green dot)
  fill(0, 255, 0);
  let centerScreen = domainToScreen(squareCenter);
  noStroke();
  ellipse(centerScreen.x, centerScreen.y, 10, 10);
  
  // Label each corner with its (x,y) values
  fill(0);
  noStroke();
  for (let corner of uvCorners) {
    let pos = domainToScreen(corner);
    let label = '(' + nf(corner.x, 1, 2) + ', ' + nf(corner.y, 1, 2) + ')';
    text(label, pos.x + 5, pos.y - 5);
  }
}

function drawTransformedRegion() {
  // Compute the four corners in domain coordinates
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
  
  // Draw the red transformed region (transformed panel)
  stroke(255, 0, 0);
  fill(255, 100, 100, 150);
  beginShape();
  vertex(transformToScreen(f_bl).x, transformToScreen(f_bl).y);
  vertex(transformToScreen(f_br).x, transformToScreen(f_br).y);
  vertex(transformToScreen(f_tr).x, transformToScreen(f_tr).y);
  vertex(transformToScreen(f_tl).x, transformToScreen(f_tl).y);
  endShape(CLOSE);
  
  // Label each transformed corner with its (x', y') values
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
  // For F(x,y) = (x+y, x^2-y^2), the divergence is: ∂/∂x(x+y) + ∂/∂y(x^2-y^2) = 1 - 2y.
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
  text('Domain (x,y) with F(x,y) = (x+y, x^2-y^2)', uvLeft, uvTop - 20);
  text('Transformed Region', xyLeft, xyTop - 20);
}

// Mapping for the domain (left panel); x, y ∈ [–5, 5]
function domainToScreen(pt) {
  let sx = map(pt.x, -5, 5, uvLeft, uvRight);
  let sy = map(pt.y, -5, 5, uvBottom, uvTop); // Note: higher y in domain maps upward (smaller y on screen)
  return createVector(sx, sy);
}

// Apply the transformation F(x,y) = (x+y, x^2-y^2)
function transformPoint(pt) {
  return createVector(pt.x + pt.y, pt.x * pt.x - pt.y * pt.y);
}

// Mapping for the transformed region (right panel):
// For this example we assume x' ∈ [–10,10] and y' ∈ [–25,25]
function transformToScreen(pt) {
  let sx = map(pt.x, -10, 10, xyLeft, xyRight);
  let sy = map(pt.y, -25, 25, xyBottom, xyTop);
  return createVector(sx, sy);
}

// Allow dragging of the green center point in the domain panel.
function mouseDragged() {
  // Only update if the mouse is inside the domain panel
  if (mouseX >= uvLeft && mouseX <= uvRight && mouseY >= uvTop && mouseY <= uvBottom) {
    let mousePt = screenToDomain(mouseX, mouseY);
    // Only update if the cursor is close to the current center (tolerance ~1 in domain units)
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
