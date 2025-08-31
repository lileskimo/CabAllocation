const Graph = require('../utils/Graph');
const path = require('path');

async function testGraphLoading() {
  console.log('🧪 Testing Graph Loading...\n');

  try {
    const graphPath = path.join(__dirname, '../utils/iit_jodhpur_graph.json');
    console.log('Loading graph from:', graphPath);
    
    const graph = await Graph.loadFromFile(graphPath);
    
    console.log('✅ Graph loaded successfully!');
    console.log(`   Nodes: ${graph.nodes.size}`);
    
    // Count edges
    let edgeCount = 0;
    for (const node of graph.nodes.values()) {
      edgeCount += node.edges.length;
    }
    console.log(`   Edges: ${edgeCount}`);
    
    // Test a simple operation
    const nodeIds = Array.from(graph.nodes.keys());
    if (nodeIds.length > 0) {
      const firstNode = nodeIds[0];
      console.log(`   First node: ${firstNode}`);
      console.log(`   First node location: ${graph.nodes.get(firstNode).lat}, ${graph.nodes.get(firstNode).lon}`);
    }
    
    console.log('\n🎉 Graph loading test completed successfully!');
    
  } catch (error) {
    console.error('❌ Graph loading test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testGraphLoading();
