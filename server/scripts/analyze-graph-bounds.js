const fs = require('fs');
const path = require('path');

// Read the graph data
const graphPath = path.join(__dirname, '../utils/iit_jodhpur_graph.json');
const graphData = JSON.parse(fs.readFileSync(graphPath, 'utf8'));

// Extract all coordinates
const coordinates = Object.values(graphData.nodes).map(node => ({
  lat: node.lat,
  lon: node.lon
}));

// Find bounds
const bounds = coordinates.reduce((acc, coord) => {
  if (!acc.minLat || coord.lat < acc.minLat) acc.minLat = coord.lat;
  if (!acc.maxLat || coord.lat > acc.maxLat) acc.maxLat = coord.lat;
  if (!acc.minLon || coord.lon < acc.minLon) acc.minLon = coord.lon;
  if (!acc.maxLon || coord.lon > acc.maxLon) acc.maxLon = coord.lon;
  return acc;
}, {});

// Calculate center
const centerLat = (bounds.minLat + bounds.maxLat) / 2;
const centerLon = (bounds.minLon + bounds.maxLon) / 2;

// Calculate span
const latSpan = bounds.maxLat - bounds.minLat;
const lonSpan = bounds.maxLon - bounds.minLon;

console.log('Graph Bounds Analysis:');
console.log('======================');
console.log(`Total nodes: ${coordinates.length}`);
console.log('');
console.log('Bounds:');
console.log(`  Latitude:  ${bounds.minLat} to ${bounds.maxLat} (span: ${latSpan.toFixed(6)})`);
console.log(`  Longitude: ${bounds.minLon} to ${bounds.maxLon} (span: ${lonSpan.toFixed(6)})`);
console.log('');
console.log('Optimal Center:');
console.log(`  Latitude:  ${centerLat.toFixed(6)}`);
console.log(`  Longitude: ${centerLon.toFixed(6)}`);
console.log('');
console.log('Recommended Map Settings:');
console.log(`  Center: [${centerLat.toFixed(6)}, ${centerLon.toFixed(6)}]`);
console.log(`  Zoom: ${Math.max(13, Math.floor(16 - Math.log2(Math.max(latSpan, lonSpan) * 100)))}`);
console.log('');
console.log('Current Map Settings:');
console.log(`  Center: [26.47, 73.12]`);
console.log(`  Zoom: 15`);
