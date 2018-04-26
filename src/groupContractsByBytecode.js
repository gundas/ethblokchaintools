readline = require("readline");

fs = require("fs")


readFile = function  (fileName, sep, props) {

	return new Promise (function (resolve, reject) {
    
		const rl = readline.createInterface( {
			input : fs.createReadStream(fileName)
		});
		
		var results = [];
		rl.on ('line', (line) => {
			//console.log('Line: %s', line); 
			// parse
			data = line.split(sep);
			
			if (data.length != props.length){
				console.error("Error splitting data: %s, expected:%d, got:%d", line, props.length, data.length);
			} else {
				result = {}
				for (var i = 0; i < props.length; i++) {
					if ( props[i] ) {
						result[props[i]] = data[i];
					}
				}
				results.push(result);
			}
		});
		rl.on ('close', () => {
			resolve(results);
		});
	});
}

mergeFiles = async function (contractsFile)  {
 	var contracts = await readFile(contractsFile, ' ', ["address", "balance", "", "", "", "", "", "bytecodeHash"]);
	
	var merged = {};

	for (var c of contracts) {
		var entry = merged[c.bytecodeHash];
		if (!entry) {
			entry = {"hash" : c.bytecodeHash, "sumBalance" : 0, 'contracts':[]};
		} 
		entry.sumBalance += parseFloat(c.balance);
		entry.contracts.push(c.address);
		merged[c.bytecodeHash] = entry;
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

if (args.length != 3) {
	console.error('usage:');
	console.error('node mergeContratcs.js contractsFile hashesFile');
	console.error('   contractsFile format: address balance createBytecodeLength bytecodeLength transactionHash block blockTimestamp bytecodeMD5Hash');
	process.exit(1);
}

mergeFiles(args[2], args[3]).then( (result) => {
        result.sort(function (a,b) { return (b.sumBalance - a.sumBalance == 0) ? b.contracts.length - a.contracts.length : b.sumBalance - a.sumBalance  });
	for (var h of result) {
	   console.log ("%d %d %s", h.sumBalance, h.contracts.length, h.hash);
	}
});
