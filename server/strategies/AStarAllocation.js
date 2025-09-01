const AllocationStrategy = require('./AllocationStrategy');

class AStarAllocation extends AllocationStrategy {
  constructor(graph) {
    super();
    this.graph = graph;
  }

  assignCab(trip, cabs) {
    if (!cabs || cabs.length === 0) {
      return null;
    }

    // Filter available cabs
    const availableCabs = cabs.filter(cab => cab.isAvailable());
    
    if (availableCabs.length === 0) {
      return null;
    }

    let bestCab = null;
    let minETA = Infinity;

    // Find nearest node to pickup location
    const pickupNode = this.graph.findNearestNode(trip.pickupLat, trip.pickupLon);
    
    if (!pickupNode) {
      console.error('Could not find nearest node to pickup location');
      return null;
    }

    // Calculate ETA for each available cab using A* algorithm
    for (const cab of availableCabs) {
      // Find nearest node to cab location
      const cabNode = this.graph.findNearestNode(cab.lat, cab.lon);
      
      if (!cabNode) {
        console.warn(`Could not find nearest node to cab ${cab.id} location`);
        continue;
      }

      // Calculate shortest path distance from cab to pickup using A*
      const result = this.graph.aStar(cabNode.id, pickupNode.id);
      
      if (result.distance === Infinity) {
        console.warn(`No path found from cab ${cab.id} to pickup location`);
        continue;
      }

      // Calculate ETA: distance / speed (30 km/h = 8.33 m/s)
      const speedMps = 8.33; // 30 km/h in meters per second
      const eta = result.distance / speedMps;

      if (eta < minETA) {
        minETA = eta;
        bestCab = {
          cab: cab,
          distance: result.distance,
          eta: eta,
          path: result.path
        };
      }
    }

    return bestCab;
  }
}

module.exports = AStarAllocation;
