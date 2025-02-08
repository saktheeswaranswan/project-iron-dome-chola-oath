let uvLeft = 50, uvRight = 350, uvTop = 50, uvBottom = 350;
let xyLeft = 400, xyRight = 700, xyTop = 50, xyBottom = 350;
let squareCenter, squareSize;
let sizeSlider;

function setup() {
  createCanvas(750, 400);
  textSize(14);
  // Starting with a center (in uv–coordinates) and an initial side length.
  squareCenter = createVector(-2, -1);
  squareSize = 2;
  
  sizeSlider = createSlider(0.5, 5, 2, 0.1);
  sizeSlider.position(20, 20);
}

function draw() {
  background(240);
  squareSize = sizeSlider.value();
  
  drawLabels();
  drawPanels();
  drawUVSquare();
  drawXYRegion();
}

function drawLabels() {
  fill(0);
  noStroke();
  text("uv–plane (blue square)", uvLeft, uvTop - 10);
  text("xy–plane (red transformed region)", xyLeft, xyTop - 10);
  text("Transformation: T(u,v) = (u, v^2)", 20, 380);
}

function drawPanels() {
  stroke(150);
  noFill();
  // Draw uv–panel border
  rect(uvLeft, uvTop, uvRight - uvLeft, uvBottom - uvTop);
  // Draw xy–panel border
  rect(xyLeft, xyTop, xyRight - xyLeft, xyBottom - xyTop);
}

function drawUVSquare() {
  // Calculate the four corners of the blue square (in uv–space)
  let blUV = createVector(squareCenter.x - squareSize / 2, squareCenter.y - squareSize / 2);
  let brUV = createVector(squareCenter.x + squareSize / 2, squareCenter.y - squareSize / 2);
  let trUV = createVector(squareCenter.x + squareSize / 2, squareCenter.y + squareSize / 2);
  let tlUV = createVector(squareCenter.x - squareSize / 2, squareCenter.y + squareSize / 2);
  let uvCorners = [blUV, brUV, trUV, tlUV];

  // Convert uv coordinates to screen positions for the uv–panel
  let bl = uvToScreen(blUV.x, blUV.y);
  let br = uvToScreen(brUV.x, brUV.y);
  let tr = uvToScreen(trUV.x, trUV.y);
  let tl = uvToScreen(tlUV.x, tlUV.y);

  stroke(0, 0, 255);
  noFill();
  beginShape();
  vertex(bl.x, bl.y);
  vertex(br.x, br.y);
  vertex(tr.x, tr.y);
  vertex(tl.x, tl.y);
  endShape(CLOSE);

  // Draw the draggable center point in green
  fill(0, 255, 0);
  let centerScreen = uvToScreen(squareCenter.x, squareCenter.y);
  ellipse(centerScreen.x, centerScreen.y, 10, 10);

  // Annotate each corner with its uv–coordinates (as (u,v))
  fill(0);
  noStroke();
  for (let corner of uvCorners) {
    let screenPos = uvToScreen(corner.x, corner.y);
    let label = '(' + nf(corner.x, 1, 2) + ', ' + nf(corner.y, 1, 2) + ')';
    text(label, screenPos.x + 5, screenPos.y - 5);
  }
}

function drawXYRegion() {
  // Use the same uv–corners to calculate the transformed (x,y) = (u, v^2) positions.
  let blUV = createVector(squareCenter.x - squareSize / 2, squareCenter.y - squareSize / 2);
  let brUV = createVector(squareCenter.x + squareSize / 2, squareCenter.y - squareSize / 2);
  let trUV = createVector(squareCenter.x + squareSize / 2, squareCenter.y + squareSize / 2);
  let tlUV = createVector(squareCenter.x - squareSize / 2, squareCenter.y + squareSize / 2);
  let uvCorners = [blUV, brUV, trUV, tlUV];

  // Map the transformed coordinates to the xy–panel
  let bl = xyFromUVTransformed(blUV.x, blUV.y);
  let br = xyFromUVTransformed(brUV.x, brUV.y);
  let tr = xyFromUVTransformed(trUV.x, trUV.y);
  let tl = xyFromUVTransformed(tlUV.x, tlUV.y);

  stroke(255, 0, 0);
  fill(255, 100, 100, 150);
  beginShape();
  vertex(bl.x, bl.y);
  vertex(br.x, br.y);
  vertex(tr.x, tr.y);
  vertex(tl.x, tl.y);
  endShape(CLOSE);

  // Annotate each transformed corner with its (x,y) coordinates, where x = u and y = v^2.
  fill(0);
  noStroke();
  for (let corner of uvCorners) {
    let transformed = xyFromUVTransformed(corner.x, corner.y);
    // Compute transformed y as the square of v (v^2)
    let label = '(' + nf(corner.x, 1, 2) + ', ' + nf(corner.y * corner.y, 1, 2) + ')';
    text(label, transformed.x + 5, transformed.y - 5);
  }
}

// Coordinate mapping functions for the uv–panel
function uvToScreen(u, v) {
  let x = map(u, -5, 5, uvLeft, uvRight);
  // In the screen, higher v corresponds to a smaller y value
  let y = map(v, -5, 5, uvBottom, uvTop);
  return createVector(x, y);
}

// Mapping functions for the xy–panel
function xyMapX(x) {
  return map(x, -5, 5, xyLeft, xyRight);
}
function xyMapY(y) {
  // y in the transformed plane comes from v^2, so y ranges from 0 to 25.
  return map(y, 0, 25, xyBottom, xyTop);
}
function xyFromUVTransformed(u, v) {
  let x = xyMapX(u);
  // Here v is the original v, so we transform it to y by squaring it first.
  let y = xyMapY(v * v);
  return createVector(x, y);
}

// Allow dragging of the green center point to move the blue square in the uv–panel.
function mouseDragged() {
  // Only update the center if the mouse is within the uv–panel.
  if (mouseX >= uvLeft && mouseX <= uvRight && mouseY >= uvTop && mouseY <= uvBottom) {
    let mouseUV = screenToUV(mouseX, mouseY);
    // If the mouse is close enough to the current center, update its position.
    if (dist(mouseUV.x, mouseUV.y, squareCenter.x, squareCenter.y) < 1) {
      squareCenter.set(mouseUV.x, mouseUV.y);
    }
  }
}

function screenToUV(x, y) {
  let u = map(x, uvLeft, uvRight, -5, 5);
  let v = map(y, uvBottom, uvTop, -5, 5);
  return createVector(u, v);
}
s
