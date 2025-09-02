// /scripts/performance.js

const { performance } = require('perf_hooks');

// Mock cab allocation function
// Replace this with your actual allocation logic
function allocateCab(pickup, cabs, graph) {
    // Simulate some computation (like Dijkstra + A*)
    let minDistance = Infinity;
    let selectedCab = null;
    for (let cab of cabs) {
        let dist = Math.sqrt(
            (cab.lat - pickup.lat) ** 2 + (cab.lon - pickup.lon) ** 2
        );
        if (dist < minDistance) {
            minDistance = dist;
            selectedCab = cab;
        }
    }
    return selectedCab;
}

// Generate test data
function generateCabs(n) {
    let cabs = [];
    for (let i = 0; i < n; i++) {
        cabs.push({
            id: i,
            lat: Math.random() * 100,
            lon: Math.random() * 100,
        });
    }
    return cabs;
}

const pickup = { lat: 50, lon: 50 };
const numCabs = 1000; // scale this to test scalability
const cabs = generateCabs(numCabs);
const graph = {}; // add your graph structure if needed

// --- LATENCY TEST ---
const start = performance.now();
const selectedCab = allocateCab(pickup, cabs, graph);
const end = performance.now();
console.log(`Selected Cab: ${selectedCab.id}`);
console.log(`Latency: ${(end - start).toFixed(3)} ms`);

// --- THROUGHPUT TEST ---
const iterations = 1000;
const t0 = performance.now();
for (let i = 0; i < iterations; i++) {
    allocateCab(pickup, cabs, graph);
}
const t1 = performance.now();
console.log(
    `Throughput: ${(iterations / ((t1 - t0) / 1000)).toFixed(2)} ops/sec`
);

// --- MEMORY USAGE ---
const used = process.memoryUsage();
console.log('Memory Usage (MB):');
console.log(
    `RSS: ${(used.rss / 1024 / 1024).toFixed(2)} | Heap Total: ${(
        used.heapTotal /
        1024 /
        1024
    ).toFixed(2)} | Heap Used: ${(used.heapUsed / 1024 / 1024).toFixed(2)}`
);
