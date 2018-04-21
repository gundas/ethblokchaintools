readline = require("readline");

fs = require("fs")


readFile = function  (fileName, sep, props, keyIndex) {

	return new Promise (function (resolve, reject) {
    
		const rl = readline.createInterface( {
			input : fs.createReadStream(fileName)
		});
		
		var results = {};
		rl.on ('line', (line) => {
			//console.log('Line: %s', line); 
			// parse
			data = line.split(sep);
			
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
 	var contracts = await readFile(contractsFile, ' ', ["address", "balance", "block"], 0);
	var hashes = await readFile(hashesFile, '  ', ["hash", "address"], 1);
	
	var merged = {};

	for (var c in hashes) {
		if (hashes.hasOwnProperty(c)) {
			var h = hashes[c].hash;
			if (!merged[h]) {
				// create new summary object
				merged[h] = { hash: h, totalBalance: 0, contracts : [] };
			}
			merged[h].contracts.push(c);
			merged[h].totalBalance += parseFloat(contracts[c].balance);
		}
	}
        // convert to array
        result = []
        for (h in merged) {
           if (merged.hasOwnProperty(h)) {
              result.push(merged[h]);
           }
        }	

	return result;
}

var args = process.argv;

if (args.length != 4) {
	console.error('usage:');
	console.error('node mergeContratcs.js contractsFile hashesFile');
	console.error('   contractsFile format: address balance block');
	console.error('   hashesFile format: hash address');
	process.exit(1);
}

mergeFiles(args[2], args[3]).then( (result) => {
        result.sort(function (a,b) { return b.totalBalance - a.totalBalance});
	for (var h of result) {
	   console.log ("%s %d %s", h.contracts, h.totalBalance, h.hash);
	}
});
