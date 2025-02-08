let amenitiesData = {
  hotels: [],
  jewelryStores: [],
  dressShops: [],
  temples: [],
  hospitals: []
};

function setup() {
  createCanvas(800, 600);
  background(255);
  
  // Define area for query (Madurai)
  let latMin = 9.9, latMax = 10.2;  // Latitude range
  let lonMin = 78.1, lonMax = 78.2; // Longitude range
  
  // Send Overpass queries for hotels, jewelry, dress shops, temples, and hospitals
  fetchData(latMin, latMax, lonMin, lonMax, 'hotel').then(data => {
    if (data) processNodes(data.elements, 'hotels');
  });
  fetchData(latMin, latMax, lonMin, lonMax, 'jewelry').then(data => {
    if (data) processNodes(data.elements, 'jewelryStores');
  });
  fetchData(latMin, latMax, lonMin, lonMax, 'clothing').then(data => {
    if (data) processNodes(data.elements, 'dressShops');
  });
  fetchData(latMin, latMax, lonMin, lonMax, 'temple').then(data => {
    if (data) processNodes(data.elements, 'temples');
  });
  fetchData(latMin, latMax, lonMin, lonMax, 'hospital').then(data => {
    if (data) processNodes(data.elements, 'hospitals');
  });
  
  // After gathering data, run shortest path calculations
  setTimeout(() => {
    calculateShortestPaths();
    exportCSV();
  }, 5000); // Adjust time as per expected delay in data fetching
}

async function fetchData(latMin, latMax, lonMin, lonMax, amenity) {
  const overpassUrl = 'https://overpass-api.de/api/interpreter';
  
  // Overpass query for different amenities (hotel, jewelry, etc.)
  const query = `
  [out:json];
  node["amenity"="${amenity}"](${latMin},${lonMin},${latMax},${lonMax});
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

function processNodes(elements, amenityCategory) {
  elements.forEach(element => {
    if (element.lat && element.lon) {
      let amenity = element.amenity || 'Unknown';
      let lat = element.lat;
      let lon = element.lon;
      let phone = element.phone || 'N/A';
      let email = element.email || 'N/A';
      let name = element.tags?.name || 'Unnamed';
      
      // Store the processed node into appropriate category
      let node = { name, amenity, lat, lon, phone, email };
      amenitiesData[amenityCategory].push(node);
    }
  });
}

function calculateShortestPaths() {
  // Example: Apply a shortest path algorithm (e.g., Dijkstra) between all the nodes for hotels and dress shops
  // For now, this is a placeholder, in reality, you'd use a library for pathfinding
  
  console.log("Calculating shortest paths...");
  
  // Dijkstra's or another shortest path algorithm can be implemented here if necessary
}

function exportCSV() {
  // Export each category as CSV
  for (let category in amenitiesData) {
    let nodes = amenitiesData[category];
    let csv = "Name,Amenity,Latitude,Longitude,Phone,Email\n";
    
    nodes.forEach(node => {
      csv += `${node.name},${node.amenity},${node.lat},${node.lon},${node.phone},${node.email}\n`;
    });
    
    // Create CSV file for each category
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${category}.csv`;
    link.click();
  }
}

function draw() {
  fill(0);
  textSize(16);
  text("Fetching and processing data...", 20, height / 2);
}
