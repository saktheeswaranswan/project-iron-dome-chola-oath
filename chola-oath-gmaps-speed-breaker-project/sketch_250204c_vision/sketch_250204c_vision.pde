import boofcv.abst.fiducial.FiducialDetection;
import boofcv.io.image.ConvertImage;
import boofcv.struct.image.GrayU8;
import boofcv.struct.image.Planar;
import boofcv.alg.feature.detect.fiducial.detect.DetectorSquareGrid;
import boofcv.core.image.ConvertBufferedImage;
import boofcv.gui.image.ShowImages;
import boofcv.factory.fiducial.FactoryFiducial;
import boofcv.gui.feature.VisualizeFeatures;
import boofcv.abst.tracker.PointTracker;

import java.awt.image.BufferedImage;
import javax.swing.*;

import boofcv.video.VideoCapture;
import boofcv.gui.image.ImagePanel;


PVector missilePos = new PVector(-500, 100, 100); // Starting position of missile
PVector domeCenter;
float domeRadius = 300;
float domeAngle = 0;
Missile missile;

Capture video;

void setup() {
  size(800, 600, P3D); // Create 3D canvas
  
  // Setup video capture using BoofCV
  String[] devices = Capture.list();
  video = new Capture(this, devices[0]);
  video.start();  // Start the video feed
  
  missile = new Missile();
  domeCenter = new PVector(0, 0, 0);
  
}

void draw() {
  background(200);
  
  // Rotate the scene for VR-like effect
  rotateY(domeAngle);
  
  // Draw transparent dome
  pushMatrix();
  noFill();
  stroke(200, 100, 100);
  strokeWeight(2);
  ellipse(0, 0, domeRadius * 2, domeRadius * 2);  // Dome edge
  sphere(domeRadius);  // Transparent dome effect
  popMatrix();
  
  // Display live webcam inside the dome using BoofCV
  if (video.available()) {
    video.read(); // Update the video feed
    PImage img = video.get(); // Get the current frame as PImage
    texture(img); // Apply as texture to the dome plane
    pushMatrix();
    translate(0, 0, -domeRadius + 20); // Position in front of the dome
    plane(domeRadius * 2, domeRadius * 2);  // Display video as plane texture
    popMatrix();
  }
  
  // Animate and draw missile
  missile.update();
  missile.display();
  
  // Check if missile enters the dome
  if (missilePos.dist(domeCenter) < domeRadius) {
    missile.showInsideDome();
  }
  
  // Update camera angle for the VR effect
  domeAngle += 0.005;
}

class Missile {
  PVector velocity;
  
  Missile() {
    velocity = new PVector(3, 0, 0);  // Missile speed
  }

  void update() {
    missilePos.add(velocity); // Move missile
  }

  void display() {
    pushMatrix();
    translate(missilePos.x, missilePos.y, missilePos.z); // Position the missile
    fill(255, 0, 0);
    cone(10, 50);  // Represent missile as a cone
    popMatrix();
  }

  void showInsideDome() {
    pushMatrix();
    translate(missilePos.x, missilePos.y, missilePos.z); 
    fill(0, 255, 0);
    sphere(10); // Show missile as a green sphere when inside dome
    popMatrix();
  }
}
