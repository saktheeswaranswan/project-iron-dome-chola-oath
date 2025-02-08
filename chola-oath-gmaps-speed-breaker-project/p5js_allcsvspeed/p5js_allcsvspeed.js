let locations = [];
let overpassUrl = "https://overpass-api.de/api/interpreter";
let query = `
[out:json];
area['name'='India']->.searchArea;
node['amenity'='fuel'](area.searchArea);
node['amenity'='hospital'](area.searchArea);
node['amenity'='school'](area.searchArea);
node['amenity'='toll_gate'](area.searchArea);
node['railway'='crossing'](area.searchArea);
node['highway'='speed_camera'](area.searchArea);  // Speed breakers
node['highway'='unclassified'](area.searchArea);  // Potholes or similar
out body;
> ;
out skel qt;
`;

let csvButton;
let pngButton;

function setup() {
  createCanvas(800, 800);
  background(255);

  // Create download buttons for CSV and PNG
  csvButton = createButton('Download CSV');
  csvButton.position(20, height + 20);
  csvButton.mousePressed(downloadCSV);

  pngButton = createButton('Download PNG');
  pngButton.position(120, height + 20);
  pngButton.mousePressed(downloadPNG);

  // Send the POST request to Overpass API
  sendPostRequest(overpassUrl, query)
    .then(response => {
      let jsonResponse = JSON.parse(response);
      if (jsonResponse && jsonResponse.elements) {
        let elements = jsonResponse.elements;

        // Loop through elements and extract data
        for (let i = 0; i < elements.length; i++) {
          let element = elements[i];
          if (element.lat && element.lon) {
            let lat = element.lat;
            let lon = element.lon;
            let amenityType = element.amenity || element.railway || element.highway || "Unknown";
            let googleMapsLink = `https://www.google.com/maps?q=${lat},${lon}`;

            // Prepare the CSV data
            locations.push({ amenityType, lat, lon, googleMapsLink });
          }
        }

        // Draw the graph connecting points
        drawGraph();
      } else {
        textSize(16);
        fill(255, 0, 0);
        text("Error parsing response or no elements found.", width / 2 - 80, height / 2);
      }
    })
    .catch(error => {
      textSize(16);
      fill(255, 0, 0);
      text("Failed to fetch data from Overpass API.", width / 2 - 80, height / 2);
    });
}

function draw() {
  // Drawing logic is handled in setup()
}

function sendPostRequest(url, data) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = function () {
      if (xhr.status === 200) {
        resolve(xhr.responseText);
      } else {
        reject("Error fetching data from Overpass API");
      }
    };
    xhr.onerror = function () {
      reject("Network error");
    };
    xhr.send('data=' + encodeURIComponent(data));
  });
}

function saveCSV(filename, data) {
  let header = 'Amenity Type,Latitude,Longitude,Google Maps Link\n';
  let content = data.map(item => `${item.amenityType},${item.lat},${item.lon},${item.googleMapsLink}`).join('\n');
  let csvContent = header + content;

  // Create a downloadable link for the CSV file
  let hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvContent);
  hiddenElement.target = '_blank';
  hiddenElement.download = filename;
  hiddenElement.click();
}

function downloadCSV() {
  if (locations.length > 0) {
    saveCSV('amenities_india.csv', locations);
  } else {
    alert("No data available to download as CSV.");
  }
}

function savePNG() {
  saveCanvas('connected_points_graph.png');
}

function downloadPNG() {
  savePNG();
}

function drawGraph() {
  stroke(0, 100, 255);
  fill(0, 100, 255, 150);

  // Draw points and connect them
  for (let i = 0; i < locations.length; i++) {
    let lat = locations[i].lat;
    let lon = locations[i].lon;

    let x = map(lon, -180, 180, 0, width);
    let y = map(lat, -90, 90, height, 0);

    ellipse(x, y, 10, 10);  // Draw a small circle for each point

    // Connect the points with lines
    if (i > 0) {
      let prevLat = locations[i - 1].lat;
      let prevLon = locations[i - 1].lon;
      line(map(prevLon, -180, 180, 0, width), 
           map(prevLat, -90, 90, height, 0),
           x, y);
    }
  }

  // Close the graph by connecting the last point to the first one
  if (locations.length > 1) {
    let firstLat = locations[0].lat;
    let firstLon = locations[0].lon;
    let lastLat = locations[locations.length - 1].lat;
    let lastLon = locations[locations.length - 1].lon;

    line(map(lastLon, -180, 180, 0, width), 
         map(lastLat, -90, 90, height, 0),
         map(firstLon, -180, 180, 0, width), 
         map(firstLat, -90, 90, height, 0));
  }
}
