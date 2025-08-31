class Graph {
  constructor() {
    this.nodes = new Map(); // nodeId -> { lat, lon, edges: [{ target, distance }] }
  }

  addNode(nodeId, lat, lon) {
    this.nodes.set(nodeId, {
      lat,
      lon,
      edges: []
    });
  }

  addEdge(sourceId, targetId, distance) {
    const sourceNode = this.nodes.get(sourceId);
    const targetNode = this.nodes.get(targetId);
    
    if (sourceNode && targetNode) {
      sourceNode.edges.push({ target: targetId, distance });
      targetNode.edges.push({ target: sourceId, distance }); // Undirected graph
    }
  }

  // Find nearest node to given coordinates
  findNearestNode(lat, lon) {
    let nearestNode = null;
    let minDistance = Infinity;

    for (const [nodeId, node] of this.nodes) {
      const distance = this.haversineDistance(lat, lon, node.lat, node.lon);
      if (distance < minDistance) {
        minDistance = distance;
        nearestNode = { id: nodeId, ...node };
      }
    }

    return nearestNode;
  }

  // Haversine distance calculation (in meters)
  haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Dijkstra's algorithm to find shortest path
  dijkstra(sourceId, targetId) {
    if (!this.nodes.has(sourceId) || !this.nodes.has(targetId)) {
      return { distance: Infinity, path: [] };
    }

    const distances = new Map();
    const previous = new Map();
    const visited = new Set();
    const queue = [];

    // Initialize distances
    for (const nodeId of this.nodes.keys()) {
      distances.set(nodeId, Infinity);
      previous.set(nodeId, null);
    }
    distances.set(sourceId, 0);
    queue.push({ id: sourceId, distance: 0 });

    while (queue.length > 0) {
      // Get node with minimum distance
      queue.sort((a, b) => a.distance - b.distance);
      const current = queue.shift();

      if (visited.has(current.id)) continue;
      visited.add(current.id);

      // If we reached the target, we're done
      if (current.id === targetId) break;

      // Check all neighbors
      const currentNode = this.nodes.get(current.id);
      for (const edge of currentNode.edges) {
        const neighborId = edge.target;
        const newDistance = current.distance + edge.distance;

        if (newDistance < distances.get(neighborId)) {
          distances.set(neighborId, newDistance);
          previous.set(neighborId, current.id);
          queue.push({ id: neighborId, distance: newDistance });
        }
      }
    }

    // Reconstruct path
    const path = [];
    let current = targetId;
    while (current !== null) {
      path.unshift(current);
      current = previous.get(current);
    }

    return {
      distance: distances.get(targetId),
      path: path
    };
  }

  // Load graph from JSON file
  static async loadFromFile(filePath) {
    try {
      const fs = require('fs').promises;
      const data = await fs.readFile(filePath, 'utf8');
      const graphData = JSON.parse(data);
      
      const graph = new Graph();
      
      // Add nodes - handle both array and object formats
      if (Array.isArray(graphData.nodes)) {
        // Array format: [{id, lat, lon}, ...]
        for (const node of graphData.nodes) {
          graph.addNode(node.id, node.lat, node.lon);
        }
      } else if (typeof graphData.nodes === 'object') {
        // Object format: {nodeId: {lat, lon}, ...}
        for (const [nodeId, nodeData] of Object.entries(graphData.nodes)) {
          graph.addNode(nodeId, nodeData.lat, nodeData.lon);
        }
      } else {
        throw new Error('Invalid nodes format in graph data');
      }
      
      // Add edges - handle different formats
      if (Array.isArray(graphData.edges)) {
        // Array format: [{source, target, distance}, ...]
        for (const edge of graphData.edges) {
          graph.addEdge(edge.source, edge.target, edge.distance);
        }
      } else if (typeof graphData.edges === 'object') {
        // Check if it's the IIT Jodhpur format: {sourceId: {targetId: distance, ...}, ...}
        const firstKey = Object.keys(graphData.edges)[0];
        if (firstKey && typeof graphData.edges[firstKey] === 'object' && 
            !graphData.edges[firstKey].hasOwnProperty('source')) {
          // IIT Jodhpur format: {sourceId: {targetId: distance, ...}, ...}
          for (const [sourceId, targets] of Object.entries(graphData.edges)) {
            for (const [targetId, distance] of Object.entries(targets)) {
              graph.addEdge(sourceId, targetId, distance);
            }
          }
        } else {
          // Object format: {edgeId: {source, target, distance}, ...}
          for (const [edgeId, edgeData] of Object.entries(graphData.edges)) {
            graph.addEdge(edgeData.source, edgeData.target, edgeData.distance);
          }
        }
      } else {
        // If no edges defined, skip edge loading
        console.log('No edges found in graph data, skipping edge loading');
      }
      
      return graph;
    } catch (error) {
      console.error('Error loading graph:', error);
      throw error;
    }
  }
}

module.exports = Graph;
