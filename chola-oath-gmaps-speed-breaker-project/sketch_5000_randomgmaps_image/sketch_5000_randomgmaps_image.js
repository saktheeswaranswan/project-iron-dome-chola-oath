const maduraiBbox = {
  north: 9.9833,
  south: 9.8833,
  west: 78.0833,
  east: 78.1833
};

const numPoints = 500000;
let randomCoords = [];
let distances = [];

function setup() {
  createCanvas(800, 400);
  noLoop(); // No need to continuously redraw

  // Generate random coordinates within the bounding box
  for (let i = 0; i < numPoints; i++) {
    let lat = random(maduraiBbox.south, maduraiBbox.north);
    let lon = random(maduraiBbox.west, maduraiBbox.east);
    randomCoords.push({ lat: lat, lon: lon });
  }

  // Save coordinates and Google Maps links to CSV
  saveLinksToCSV();

  // Calculate distances between points
  distances = calculateDistances();

  // Plot the distances on a graph
  plotDistances(distances);
}

function saveLinksToCSV() {
  let csvContent = "Latitude,Longitude,Google Maps Link\n";

  // Generate the links and prepare CSV data
  randomCoords.forEach(coord => {
    let lat = coord.lat.toFixed(6);
    let lon = coord.lon.toFixed(6);
    let gmapLink = `https://www.google.com/maps?q=${lat},${lon}`;
    csvContent += `${lat},${lon},${gmapLink}\n`;
  });

  // Save CSV file
  saveStrings([csvContent], "coordinates_links.csv");
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const a = sin(dLat / 2) * sin(dLat / 2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dLon / 2) * sin(dLon / 2);
  const c = 2 * atan2(sqrt(a), sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

function calculateDistances() {
  let distances = [];

  // Calculate the distances between consecutive points
  for (let i = 1; i < randomCoords.length; i++) {
    const lat1 = randomCoords[i - 1].lat;
    const lon1 = randomCoords[i - 1].lon;
    const lat2 = randomCoords[i].lat;
    const lon2 = randomCoords[i].lon;

    const distance = haversine(lat1, lon1, lat2, lon2);
    distances.push(distance);
  }

  return distances;
}

function plotDistances(distances) {
  let maxDist = max(distances);
  let minDist = min(distances);

  // Plot the distances on the canvas
  for (let i = 0; i < distances.length; i++) {
    let x = map(i, 0, distances.length, 0, width);
    let y = map(distances[i], minDist, maxDist, height, 0);
    ellipse(x, y, 5, 5); // Plot each distance point as a circle
  }
}
