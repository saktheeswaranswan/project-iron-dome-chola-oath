let nodes = [];  // Array to store nodes data
let nodeCount = 1000;  // Number of nodes to fetch (you can adjust this number)

function setup() {
  createCanvas(800, 600);
  fetchNodes();
}

// Function to fetch nodes from Overpass API
function fetchNodes() {
  let apiUrl = "https://overpass-api.de/api/interpreter";
  let query = `
  [out:json];
  area["name"="Madurai"]->.searchArea;
  (
    node["highway"](area.searchArea);
    node["amenity"](area.searchArea);
    node["shop"](area.searchArea);
    node["school"](area.searchArea);
    node["hospital"](area.searchArea);
    node["park"](area.searchArea);
    node["fuel"](area.searchArea);
  );
  out body;
  >;
  out skel qt;
  `;
  
  let params = {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`
  };

  fetch(apiUrl, params)
    .then(response => response.json())
    .then(data => {
      nodes = data.elements.slice(0, nodeCount);  // Slice to limit the number of nodes
      console.log(nodes);  // Log data for debugging
      saveCSV();
    })
    .catch(error => console.error('Error fetching data:', error));
}

// Function to calculate the distance between two points using the Haversine formula
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const φ1 = radians(lat1);
  const φ2 = radians(lat2);
  const Δφ = radians(lat2 - lat1);
  const Δλ = radians(lon2 - lon1);

  const a = sin(Δφ / 2) * sin(Δφ / 2) +
            cos(φ1) * cos(φ2) *
            sin(Δλ / 2) * sin(Δλ / 2);
  const c = 2 * atan2(sqrt(a), sqrt(1 - a));

  const distance = R * c;  // Distance in km
  return distance;
}

// Function to save the data as a CSV
function saveCSV() {
  let csv = "NodeID,Latitude,Longitude,GoogleMapsLink,ConnectingNodeID,TravelTimeSeconds,TravelTimeMinutes\n";
  
  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i];
    let lat = node.lat;
    let lon = node.lon;
    let googleMapsLink = `https://www.google.com/maps?q=${lat},${lon}`;
    let connectingNodeID = (i === nodes.length - 1) ? nodes[0].id : nodes[i + 1].id;  // Close the graph
    
    // Calculate travel time between nodes (using average speed for car)
    let nextNode = nodes[i + 1] || nodes[0];  // Connect last node to the first node
    let distance = haversine(lat, lon, nextNode.lat, nextNode.lon);  // Distance in km
    
    // Assuming average speed for car (40 km/h), convert to seconds and minutes
    let speed = 40; // Average speed of car in km/h
    let timeInSeconds = (distance / speed) * 3600;  // Convert hours to seconds
    let timeInMinutes = timeInSeconds / 60;  // Convert seconds to minutes
    
    // Append data to the CSV string
    csv += `${node.id},${lat},${lon},${googleMapsLink},${connectingNodeID},${timeInSeconds.toFixed(2)},${timeInMinutes.toFixed(2)}\n`;
  }
  
  // Create a Blob and trigger download
  let blob = new Blob([csv], { type: "text/csv" });
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "madurai_nodes_graph_with_travel_time.csv";
  link.click();
}

function draw() {
  background(255);
  // Optional: Visualize the nodes as points on canvas
  for (let i = 0; i < nodes.length; i++) {
    let x = map(nodes[i].lon, 78.0, 78.1, 0, width);  // Map longitude to x-coordinate
    let y = map(nodes[i].lat, 9.9, 10.0, height, 0); // Map latitude to y-coordinate
    ellipse(x, y, 5, 5); // Draw each node as a small circle
  }
}
