const Graph = require('../utils/Graph');

async function testAlgorithmPerformance() {
  console.log('🚀 Testing Algorithm Performance...\n');

  try {
    // Load the graph
    const path = require('path');
    const graphPath = path.join(__dirname, '../utils/iit_jodhpur_graph.json');
    const graph = await Graph.loadFromFile(graphPath);
    console.log(`✅ Graph loaded with ${graph.nodes.size} nodes\n`);

    // Get some test nodes
    const nodeIds = Array.from(graph.nodes.keys());
    const testCases = [
      { source: nodeIds[0], target: nodeIds[Math.floor(nodeIds.length / 2)] },
      { source: nodeIds[Math.floor(nodeIds.length / 4)], target: nodeIds[Math.floor(nodeIds.length * 3 / 4)] },
      { source: nodeIds[Math.floor(nodeIds.length / 3)], target: nodeIds[Math.floor(nodeIds.length * 2 / 3)] },
      { source: nodeIds[Math.floor(nodeIds.length / 6)], target: nodeIds[Math.floor(nodeIds.length * 5 / 6)] },
      { source: nodeIds[Math.floor(nodeIds.length / 8)], target: nodeIds[Math.floor(nodeIds.length * 7 / 8)] }
    ];

    console.log('📊 Performance Comparison Results:\n');
    console.log('Test Case | Dijkstra (ms) | A* (ms) | Speedup | Distance (m)');
    console.log('----------|---------------|---------|---------|-------------');

    let totalDijkstraTime = 0;
    let totalAStarTime = 0;

    for (let i = 0; i < testCases.length; i++) {
      const { source, target } = testCases[i];

      // Test Dijkstra
      const dijkstraStart = process.hrtime.bigint();
      const dijkstraResult = graph.dijkstra(source, target);
      const dijkstraEnd = process.hrtime.bigint();
      const dijkstraTime = Number(dijkstraEnd - dijkstraStart) / 1000000; // Convert to milliseconds

      // Test A*
      const aStarStart = process.hrtime.bigint();
      const aStarResult = graph.aStar(source, target);
      const aStarEnd = process.hrtime.bigint();
      const aStarTime = Number(aStarEnd - aStarStart) / 1000000; // Convert to milliseconds

      // Calculate speedup
      const speedup = dijkstraTime / aStarTime;
      const distance = dijkstraResult.distance;

      console.log(`Case ${i + 1}    | ${dijkstraTime.toFixed(2).padStart(11)} | ${aStarTime.toFixed(2).padStart(7)} | ${speedup.toFixed(2).padStart(7)} | ${distance.toFixed(0).padStart(11)}`);

      totalDijkstraTime += dijkstraTime;
      totalAStarTime += aStarTime;

      // Verify both algorithms give the same result
      if (Math.abs(dijkstraResult.distance - aStarResult.distance) > 0.1) {
        console.log(`⚠️  WARNING: Different results for test case ${i + 1}!`);
        console.log(`   Dijkstra: ${dijkstraResult.distance}m`);
        console.log(`   A*: ${aStarResult.distance}m`);
      }
    }

    console.log('\n📈 Summary:');
    console.log(`Average Dijkstra time: ${(totalDijkstraTime / testCases.length).toFixed(2)}ms`);
    console.log(`Average A* time: ${(totalAStarTime / testCases.length).toFixed(2)}ms`);
    console.log(`Overall speedup: ${(totalDijkstraTime / totalAStarTime).toFixed(2)}x`);
    console.log(`\n✅ A* algorithm is ${(totalDijkstraTime / totalAStarTime).toFixed(2)}x faster than Dijkstra!`);

  } catch (error) {
    console.error('❌ Error testing algorithms:', error);
  }
}

// Run the test
testAlgorithmPerformance();
