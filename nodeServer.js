let settings = {
    ip: "192.168.66.160",
    port: 3443
}

let fs = require("fs")

let samplesLength = 1000
let sampleRate = 8000

let outStream = fs.createWriteStream("test.wav")


let writeHeader = () => {
	let b = new Buffer(1024);
	b.write('RIFF', 0);
	/* file length */
	b.writeUInt32LE(32 + samplesLength * 2, 4);
	//b.writeUint32LE(0, 4);

	b.write('WAVE', 8);
	/* format chunk identifier */
	b.write('fmt ', 12);

	/* format chunk length */
	b.writeUInt32LE(16, 16);

	/* sample format (raw) */
	b.writeUInt16LE(1, 20);

	/* channel count */
	b.writeUInt16LE(1, 22);

	/* sample rate */
	b.writeUInt32LE(sampleRate, 24);

	/* byte rate (sample rate * block align) */
	b.writeUInt32LE(sampleRate * 2, 28);

	/* block align (channel count * bytes per sample) */
	b.writeUInt16LE(2, 32);

	/* bits per sample */
	b.writeUInt16LE(16, 34);

	/* data chunk identifier */
	b.write('data', 36);

	/* data chunk length */
	//b.writeUInt32LE(0, samplesLength * 2);
	b.writeUInt32LE(0, 40);


	outStream.write(b.slice(0, 50));
};

writeHeader(outStream)

let net = require('net');
console.log("connecting...");
client = net.connect(settings.port, settings.ip, ()=> {
	client.setNoDelay(true);

    client.on("data", (data) => {
        try {
			console.log("GOT DATA");
			outStream.write(data);
			//outStream.flush();
			console.log("got chunk of " + data.toString('hex'));
		}
        catch (ex) {
            console.error("Er!" + ex);
        }
    });
});


setTimeout(()=> {
	console.log('recorded for 10 seconds');
	client.end();
	outStream.end();
	process.exit(0);
}, 10 * 1000);
