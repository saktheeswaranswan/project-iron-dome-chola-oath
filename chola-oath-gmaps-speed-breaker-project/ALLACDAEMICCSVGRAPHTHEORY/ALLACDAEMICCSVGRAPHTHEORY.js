let nodesData = []; // Store all the data (schools, colleges, etc.)
let graph = [];

function setup() {
  createCanvas(800, 600);
  background(255);

  // Madurai Latitude and Longitude bounding box (example, adjust if necessary)
  let latMin = 9.9, latMax = 10.2;  // Latitude range for Madurai
  let lonMin = 78.1, lonMax = 78.2; // Longitude range for Madurai

  // Send Overpass queries for all categories
  Promise.all([
    fetchData(latMin, latMax, lonMin, lonMax, 'school'),
    fetchData(latMin, latMax, lonMin, lonMax, 'college'),
    fetchData(latMin, latMax, lonMin, lonMax, 'polytechnic'),
    fetchData(latMin, latMax, lonMin, lonMax, 'arts_centre'),
    fetchData(latMin, latMax, lonMin, lonMax, 'computer_centre'),
    fetchData(latMin, latMax, lonMin, lonMax, 'scientific_equipment_dealer'),
    fetchData(latMin, latMax, lonMin, lonMax, 'stem_learning')
  ])
  .then(responses => {
    responses.forEach((data, index) => {
      if (data) {
        let category = '';
        switch (index) {
          case 0: category = 'schools'; break;
          case 1: category = 'colleges'; break;
          case 2: category = 'polytechnics'; break;
          case 3: category = 'artsData'; break;
          case 4: category = 'computerCentersData'; break;
          case 5: category = 'equipmentDealersData'; break;
          case 6: category = 'stemCentersData'; break;
        }
        processNodes(data.elements, category);
      }
    });

    // After gathering data, run distance calculations and export CSV
    setTimeout(() => {
      calculateDistances();
      exportCSV(); // Save everything to a single CSV
    }, 10000); // Wait for data to fetch and process
  });
}

// Fetch data from Overpass API
async function fetchData(latMin, latMax, lonMin, lonMax, amenity) {
  const overpassUrl = 'https://overpass-api.de/api/interpreter';

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

// Process the data (store nodes with additional information)
function processNodes(elements, category) {
  elements.forEach(element => {
    if (element.lat && element.lon) {
      let node = {
        name: element.tags?.name || 'Unnamed',
        amenity: element.amenity || 'Unknown',
        lat: element.lat,
        lon: element.lon,
        phone: element.tags?.phone || 'N/A',
        email: element.tags?.email || 'N/A',
        address: element.tags?.addr?.street || 'N/A',
        locationLink: `https://www.google.com/maps?q=${element.lat},${element.lon}`,
        category: category
      };

      nodesData.push(node);
    }
  });
}

// Calculate distances between each pair of nodes
function calculateDistances() {
  for (let i = 0; i < nodesData.length; i++) {
    for (let j = i + 1; j < nodesData.length; j++) {
      let distance = haversineDistance(
        nodesData[i].lat, nodesData[i].lon,
        nodesData[j].lat, nodesData[j].lon
      );
      graph.push({
        from: nodesData[i],
        to: nodesData[j],
        distance: distance
      });
    }
  }
}

// Calculate Haversine distance between two points (in kilometers)
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const a = sin(dLat / 2) * sin(dLat / 2) +
            cos(radians(lat1)) * cos(radians(lat2)) *
            sin(dLon / 2) * sin(dLon / 2);
  const c = 2 * atan2(sqrt(a), sqrt(1 - a));
  return R * c; // Distance in kilometers
}

// Export data to CSV
function exportCSV() {
  let csv = "Name,Amenity,Latitude,Longitude,Phone,Email,Address,Location Link,Category,Distance (km),From Node,To Node\n";

  // Add nodes information to the CSV
  nodesData.forEach(node => {
    csv += `${node.name},${node.amenity},${node.lat},${node.lon},${node.phone},${node.email},${node.address},${node.locationLink},${node.category}\n`;
  });

  // Add distance data (graph information) to the CSV
  graph.forEach(edge => {
    csv += `${edge.from.name},${edge.from.amenity},${edge.from.lat},${edge.from.lon},${edge.from.phone},${edge.from.email},${edge.from.address},${edge.from.locationLink},${edge.from.category},${edge.distance},${edge.from.name},${edge.to.name}\n`;
  });

  // Save the CSV file
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'nodes_and_distances.csv';
  link.click();
}

function draw() {
  fill(0);
  textSize(16);
  text("Fetching and processing data...", 20, height / 2);
}
