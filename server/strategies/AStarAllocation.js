const AllocationStrategy = require('./AllocationStrategy');

/**
 * NOTE: This optimized implementation assumes your Graph class (likely in `utils/Graph.js`)
 * has a `dijkstra(startNodeId)` method. This method should run Dijkstra's algorithm
 * from a starting node and return a Map of `(nodeId, distance)`.
 */

class AStarAllocation extends AllocationStrategy {
  // Allow speed to be configured, defaulting to 30 km/h (~8.33 m/s)
  constructor(graph, { defaultSpeedMps = 8.33 } = {}) {
    super();
    this.graph = graph;
    this.defaultSpeedMps = defaultSpeedMps;
  }

  assignCab(trip, cabs) {
    if (!cabs || cabs.length === 0) {
      return null;
    }

    // Filter for cabs that are actually available
    const availableCabs = cabs.filter(cab => cab.isAvailable());
    
    if (availableCabs.length === 0) {
      return null;
    }

    let bestCab = null;
    let minETA = Infinity;

    const pickupNode = this.graph.findNearestNode(trip.pickupLat, trip.pickupLon);
    
    if (!pickupNode) {
      console.error('Could not find nearest node to pickup location');
      return null;
    }
    
    // --- OPTIMIZATION ---
    // 1. Run Dijkstra's ONCE from the pickup point to get the shortest distance
    //    from every other node on the map to the pickup location.
    const distancesToPickup = this.graph.dijkstraAllDistances(pickupNode.id);

    // 2. Find the best cab by doing a fast lookup for each one.
    for (const cab of availableCabs) {
      const cabNode = this.graph.findNearestNode(cab.lat, cab.lon);
      
      if (!cabNode) {
        console.warn(`Could not find nearest node to cab ${cab.id} location`);
        continue;
      }
      
      const distance = distancesToPickup.get(cabNode.id);

      if (distance === undefined || distance === Infinity) {
        // This cab can't reach the pickup location based on the graph.
        continue;
      }

      const eta = distance / this.defaultSpeedMps;

      if (eta < minETA) {
        minETA = eta;
        bestCab = {
          cab: cab,
          distance: distance,
          eta: eta,
          path: [] // Path will be calculated later for only the single best cab.
        };
      }
    }

    // 3. If we found a suitable cab, run A* just ONCE to get the actual path.
    if (bestCab) {
      const bestCabNode = this.graph.findNearestNode(bestCab.cab.lat, bestCab.cab.lon);
      const pathResult = this.graph.aStar(bestCabNode.id, pickupNode.id);
      bestCab.path = pathResult.path;
    }

    return bestCab;
  }
}

module.exports = AStarAllocation;
