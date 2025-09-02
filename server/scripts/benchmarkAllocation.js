// A simple script to benchmark the two allocation strategies.
// To run: npm run benchmark

// --- Mocks and Dependencies ---
// In a real scenario, you would import your actual Graph and Cab classes.
// For this test, we'll create simplified mocks.

const AStarAllocation = require('../strategies/AStarAllocation');

// Mock a delay to simulate computation
function simulateWork(milliseconds) {
  const start = Date.now();
  while (Date.now() - start < milliseconds) {
    // Busy-wait to simulate CPU work
  }
}

class MockGraph {
  constructor(nodeCount = 1000) {
    this.nodes = {};
    for (let i = 0; i < nodeCount; i++) {
      this.nodes[i] = { id: i, lat: Math.random(), lon: Math.random() };
    }
    console.log(`MockGraph created with ${nodeCount} nodes.`);
  }

  findNearestNode(lat, lon) {
    // In a real graph, this would be a more complex search (e.g., k-d tree).
    // Here, we just return a random node to simulate the step.
    const randomId = Math.floor(Math.random() * Object.keys(this.nodes).length);
    return this.nodes[randomId];
  }

  aStar(startNodeId, endNodeId) {
    // Simulate the cost of a single A* run.
    simulateWork(1); // ~1ms per run
    return {
      distance: Math.random() * 5000,
      path: [this.nodes[startNodeId], this.nodes[endNodeId]]
    };
  }

  dijkstra(startNodeId) {
    // Simulate the cost of a Dijkstra run, which is more expensive than a single A*
    // as it explores a larger part of the graph.
    simulateWork(15); // ~15ms for the whole graph
    const distances = new Map();
    for (const nodeId in this.nodes) {
      distances.set(parseInt(nodeId, 10), Math.random() * 10000);
    }
    return distances;
  }
}

class MockCab {
  constructor(id, lat, lon) {
    this.id = id;
    this.lat = lat;
    this.lon = lon;
    this.status = 'available';
  }

  isAvailable() {
    return this.status === 'available';
  }
}

/**
 * The "Old" way: Loop through every cab and run A* for each.
 */
function benchmarkOldMethod(trip, availableCabs, graph) {
  let bestCab = null;
  let minETA = Infinity;
  const defaultSpeedMps = 8.33;

  const pickupNode = graph.findNearestNode(trip.pickupLat, trip.pickupLon);
  if (!pickupNode) return null;

  for (const cab of availableCabs) {
    const cabNode = graph.findNearestNode(cab.lat, cab.lon);
    if (!cabNode) continue;

    // Run A* for every single cab
    const result = graph.aStar(cabNode.id, pickupNode.id);
    if (result.distance === Infinity) continue;

    const eta = result.distance / defaultSpeedMps;
    if (eta < minETA) {
      minETA = eta;
      bestCab = { cab, distance: result.distance, eta, path: result.path };
    }
  }
  return bestCab;
}

function runBenchmarks() {
  console.log('--- Starting Cab Allocation Benchmark ---');

  const graph = new MockGraph(5000); // A graph with 5000 nodes
  const mockTrip = { pickupLat: 26.47, pickupLon: 73.12 };
  const allocationStrategy = new AStarAllocation(graph);

  const cabCounts = [10, 50, 100, 250, 500];

  for (const count of cabCounts) {
    console.log(`\n--- Testing with ${count} available cabs ---`);
    const cabs = Array.from({ length: count }, (_, i) => new MockCab(i, Math.random(), Math.random()));

    console.time(`Old Method (N * A*)`);
    benchmarkOldMethod(mockTrip, cabs, graph);
    console.timeEnd(`Old Method (N * A*)`);

    console.time(`New Method (1 * Dijkstra + 1 * A*)`);
    allocationStrategy.assignCab(mockTrip, cabs);
    console.timeEnd(`New Method (1 * Dijkstra + 1 * A*)`);
  }

  console.log('\n--- Benchmark Complete ---');
  console.log('Note: "Old Method" time should scale linearly with cab count, while "New Method" should remain relatively constant.');
}

runBenchmarks();