import java.net.*;
import java.io.*;

String[] locations = new String[0];
String overpassUrl = "https://overpass-api.de/api/interpreter";
String query = "[out:json];" +
               "area['name'='Tamil Nadu']->.searchArea;" +
               "node['amenity'='hospital'](area.searchArea);" +
               "node['amenity'='school'](area.searchArea);" +
               "node['highway'='toll_gantry'](area.searchArea);" +
               "node['railway'='crossing'](area.searchArea);" +
               "node['highway'='traffic_signals'](area.searchArea);" +
               "node['highway'='bus_stop'](area.searchArea);" +
               "out body; >; out skel qt;";

void setup() {
  size(800, 400);
  background(255);

  // Send the HTTP POST request to the Overpass API
  String response = sendPostRequest(overpassUrl, query);
  if (response != null) {
    // Process the response JSON
    JSONObject jsonResponse = parseJSONObject(response);
    if (jsonResponse != null && jsonResponse.hasKey("elements")) {
      JSONArray elements = jsonResponse.getJSONArray("elements");
      locations = new String[elements.size()];

      // Loop through elements and extract the data
      for (int i = 0; i < elements.size(); i++) {
        JSONObject element = elements.getJSONObject(i);
        if (element.hasKey("lat") && element.hasKey("lon")) {
          float lat = element.getFloat("lat");
          float lon = element.getFloat("lon");

          String amenityType = element.hasKey("amenity") ? element.getString("amenity") : "";
          String highwayType = element.hasKey("highway") ? element.getString("highway") : "";
          String railwayType = element.hasKey("railway") ? element.getString("railway") : "";

          // Prepare data for the CSV
          String hospital = (amenityType.equals("hospital")) ? "Yes" : "No";
          String school = (amenityType.equals("school")) ? "Yes" : "No";
          String tollGantry = (highwayType.equals("toll_gantry")) ? "Yes" : "No";
          String railwayCrossing = (railwayType.equals("crossing")) ? "Yes" : "No";
          String trafficSignal = (highwayType.equals("traffic_signals")) ? "Yes" : "No";
          String busStop = (highwayType.equals("bus_stop")) ? "Yes" : "No";

          String googleMapsLink = "https://www.google.com/maps?q=" + lat + "," + lon;

          // Prepare the row for CSV with all amenities in separate columns
          locations[i] = hospital + "," + school + "," + tollGantry + "," + railwayCrossing + "," + trafficSignal + "," + busStop + "," + lat + "," + lon + "," + googleMapsLink;
        }
      }

      if (locations.length > 0) {
        // Save the data as a CSV
        saveCSV("infrastructure_tamilnadu.csv", locations);
        textSize(16);
        fill(0);
        text("CSV file with infrastructure data saved!", width / 2, height / 2);
      } else {
        textSize(16);
        fill(255, 0, 0);
        text("No infrastructure data found for Tamil Nadu.", width / 2, height / 2);
      }
    } else {
      textSize(16);
      fill(255, 0, 0);
      text("Error parsing response or no elements found.", width / 2, height / 2);
    }
  } else {
    textSize(16);
    fill(255, 0, 0);
    text("Failed to fetch data from Overpass API.", width / 2, height / 2);
  }
}

void draw() {
  // Placeholder, as we already processed data in setup()
}

String sendPostRequest(String url, String data) {
  try {
    // Set up the connection
    URL obj = new URL(url);
    HttpURLConnection con = (HttpURLConnection) obj.openConnection();
    con.setRequestMethod("POST");
    con.setDoOutput(true);

    // Send the POST data
    try (DataOutputStream wr = new DataOutputStream(con.getOutputStream())) {
      wr.writeBytes("data=" + URLEncoder.encode(data, "UTF-8"));
      wr.flush();
    }

    // Get the response code
    int responseCode = con.getResponseCode();
    if (responseCode == HttpURLConnection.HTTP_OK) {
      // Read the response
      BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
      String inputLine;
      StringBuffer response = new StringBuffer();

      while ((inputLine = in.readLine()) != null) {
        response.append(inputLine);
      }
      in.close();

      return response.toString();
    } else {
      println("POST request failed. Response Code: " + responseCode);
    }
  } catch (Exception e) {
    e.printStackTrace();
  }
  return null;
}

void saveCSV(String filename, String[] data) {
  String header = "Hospital,School,Toll Gate,Railway Crossing,Traffic Signal,Bus Stop,Latitude,Longitude,Google Maps Link\n";
  String content = header + join(data, "\n");

  // Save the content as a CSV file
  saveStrings(filename, split(content, "\n"));
}
