let nodes = [];  // Array to store nodes
let allNodes = []; // To store all the nodes for export

function setup() {
  createCanvas(800, 600);
  background(255);
  
  // Define area for Madurai (adjust these boundaries as needed)
  let latMin = 9.9, latMax = 10.2;  // Latitude range for Madurai
  let lonMin = 78.1, lonMax = 78.2; // Longitude range for Madurai

  // Send incremental fetch request (bounding boxes) and save the result
  fetchData(latMin, latMax, lonMin, lonMax).then(data => {
    if (data) {
      processNodes(data.elements);
      saveCSV(allNodes);  // Save all the nodes into CSV
      console.log("Data saved.");
    }
  });
}

async function fetchData(latMin, latMax, lonMin, lonMax) {
  const overpassUrl = 'https://overpass-api.de/api/interpreter';
  
  // Overpass query to get amenities in Madurai
  const query = `
  [out:json];
  node["amenity"]( ${latMin},${lonMin},${latMax},${lonMax} );
  out body;
  >;
  out skel qt;
  `;
  
  const response = await fetch(overpassUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data=' + encodeURIComponent(query)
  });

  if (!response.ok) {
    console.error('Request failed with status:', response.status);
    return null;
  }

  const data = await response.json();
  return data;
}

function processNodes(elements) {
  elements.forEach(element => {
    let lat = element.lat;
    let lon = element.lon;
    let amenity = element.amenity || 'Unknown';
    let googleMapsLink = `https://www.google.com/maps?q=${lat},${lon}`;
    
    // Create node object and add to array
    let node = { amenity, lat, lon, googleMapsLink };
    nodes.push(node);
    allNodes.push(node); // Keep track of all nodes for final export
  });
}

// Save all collected nodes into CSV file
function saveCSV(nodes) {
  let csv = "Amenity,Latitude,Longitude,Google Maps Link\n";
  nodes.forEach(node => {
    csv += `${node.amenity},${node.lat},${node.lon},${node.googleMapsLink}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = "madurai_amenities_all.csv";
  link.click();
}

function draw() {
  fill(0);
  textSize(16);
  text("Fetching data, please wait...", 20, height / 2);
}
