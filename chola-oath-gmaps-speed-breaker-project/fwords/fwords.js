// Define the bounding box for Madurai (approximate)
const maduraiBbox = {
  north: 9.9833,
  south: 9.8833,
  west: 78.0833,
  east: 78.1833
};

// Number of random positions to generate
const numPoints = 500;

// Array to store the generated coordinates
let randomCoords = [];

function setup() {
  createCanvas(400, 400);
  noLoop(); // No need to continuously redraw

  // Generate random coordinates within the bounding box
  for (let i = 0; i < numPoints; i++) {
    let lat = random(maduraiBbox.south, maduraiBbox.north);
    let lon = random(maduraiBbox.west, maduraiBbox.east);
    randomCoords.push({ lat: lat, lon: lon });
  }

  // Display the Google Maps links
  displayLinks();
}

function displayLinks() {
  // Create a div to hold the links
  let linkContainer = createDiv();
  linkContainer.position(10, 10);

  // Generate and display Google Maps links
  for (let i = 0; i < randomCoords.length; i++) {
    let lat = randomCoords[i].lat.toFixed(6);
    let lon = randomCoords[i].lon.toFixed(6);
    let gmapLink = `https://www.google.com/maps?q=${lat},${lon}`;

    // Create a clickable link
    let link = createA(gmapLink, `Location ${i + 1}: (${lat}, ${lon})`);
    link.parent(linkContainer);
    link.style('display', 'block'); // Display each link on a new line
  }
}
