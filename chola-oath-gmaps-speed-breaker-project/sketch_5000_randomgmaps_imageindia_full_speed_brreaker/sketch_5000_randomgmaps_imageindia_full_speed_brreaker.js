let speedBreakerLocations = [];

function setup() {
  createCanvas(800, 400);
  noLoop(); // No need to continuously redraw

  // Overpass API query to get speed breakers in Tamil Nadu
  let overpassUrl = 'https://overpass-api.de/api/interpreter';
  let query = `
    [out:json];
    area["name"="Tamil Nadu"]->.searchArea;
    node["highway"="speed_bump"](area.searchArea);
    node["traffic_calming"="speed_bump"](area.searchArea);
    node["traffic_calming"="speed_hump"](area.searchArea);
    out body;
    >;
    out skel qt;
  `;

  // Fetch data from Overpass API
  fetch(overpassUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `data=${encodeURIComponent(query)}`
  })
  .then(response => response.json())
  .then(data => {
    if (data.elements && data.elements.length > 0) {
      // Map each element to a location object with lat, lon, and Google Maps link
      speedBreakerLocations = data.elements.map(elem => ({
        lat: elem.lat,
        lon: elem.lon,
        googleMapsLink: `https://www.google.com/maps?q=${elem.lat},${elem.lon}`
      }));

      // Save CSV file after fetching the data
      saveSpeedBreakerLinksToCSV();
    } else {
      console.log('No speed breaker data found for Tamil Nadu.');
    }
  })
  .catch(error => {
    console.error('Error fetching data from Overpass API:', error);
  });
}

function saveSpeedBreakerLinksToCSV() {
  let csvContent = "Latitude,Longitude,Google Maps Link\n";

  speedBreakerLocations.forEach(coord => {
    let lat = coord.lat.toFixed(6);
    let lon = coord.lon.toFixed(6);
    let gmapLink = coord.googleMapsLink;
    csvContent += `${lat},${lon},${gmapLink}\n`;
  });

  // Save the CSV file
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "speed_breakers_tamilnadu.csv");
  link.click();
}

function draw() {
  background(255);

  // Display the number of speed breaker locations found
  fill(0);
  textSize(18);
  textAlign(CENTER, CENTER);
  text("Speed Breaker Locations in Tamil Nadu", width / 2, height / 4);

  textSize(14);
  text(`${speedBreakerLocations.length} locations found`, width / 2, height / 2);
}
