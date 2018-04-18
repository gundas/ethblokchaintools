readline = require("readline");

fs = require("fs")


readFile = function  (fileName, props, keyIndex) {

	return new Promise (function (resolve, reject) {
    
		const rl = readline.createInterface( {
			input : fs.createReadStream(fileName)
		});
		
		var results = {};
		rl.on ('line', (line) => {
			//console.log('Line: %s', line); 
			// parse
			data = line.split(' ');
			
			if (data.length != props.length){
				console.error("Error splitting data: %s, expected:%d, got:%d", line, props.length, data.length);
			} else {
				result = {}
				for (var i = 0; i < props.length; i++) {
					result[props[i]] = data[i];
				}
				results[data[keyIndex]] = result;
			}
		});
		rl.on ('close', () => {
			resolve(results);
		});
	});
}

mergeFiles = async function (contractsFile, hashesFile)  {
 	var contracts = await readFile(contractsFile, ["address", "balance", "block"], 0);
	var hashes = await readFile(hashesFile, ["address", "hash"], 0);
	
	var merged = {};

	for (var c in hashes) {
		if (hashes.hasOwnProperty(c)) {
			var h = hashes[c].hash;
			if (!merged[h]) {
				// create new summary object
				merged[h] = { hash: h, totalBalance: 0, contracts : [] };
			}
			merged[h].contracts.push(c);
			merged[h].totalBalance += parseInt(contracts[c].balance);
		}
	}
	
	return merged;
}

var args = process.argv;

if (args.length != 4) {
	console.error('usage:');
	console.error('node mergeContratcs.js contractsFile hashesFile');
	console.error('   contractsFile format: address balance block');
	console.error('   hashesFile format: address hash');
	process.exit(1);
}

mergeFiles(args[2], args[3]).then( (merged) => {
	for (var h in merged) {
		if (merged.hasOwnProperty(h)) {
			console.log ("%s %d %s", merged[h].contracts, merged[h].totalBalance, h);
		}
	}
});