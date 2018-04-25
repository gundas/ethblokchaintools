
var Web3 = require ("web3");

var w3  = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
 
// check arguments
if (process.argv.length != 4) {
   console.log("Usage: ");
   console.log("node extractBytecode.js <input file> <output path>");
   console.log("<input file> format - each line must start with contract address, any subequent data should be separated by space");
   process.exit(1);
}

var inputFile = process.argv[2];
var outFolder = process.argv[3];

var fs = require('fs');
var path = require ('path');
var readline = require('readline');
var stream = require('stream');

var inStream = fs.createReadStream(inputFile);
var outStream = new stream;
var rl = readline.createInterface(inStream, outStream);

var contracts = [];

rl.on('line', function (line) {
   // parse line
   var data = line.split(' ');
   // first item is contract adddress
   contracts.push(data[0]);
});



rl.on('close', function () {
   if (!fs.existsSync(outFolder)) {
      console.log('Creating folder %s', outFolder);
      fs.mkdirSync(outFolder);
   }
   console.log('Export start...');
   writeBytecode(0);
});


function writeBytecode (nextId) {
   var address = contracts[nextId]; 
   // skip aldready downloaded files
   while (fs.existsSync(path.join(outFolder, address))){
     nextId++;
     if (nextId >= contracts.length) {
        return;
     }
     address = contracts[nextId]; 
   }

   w3.eth.getCode(address).then( b => {
        // write to disk
        fs.writeFileSync(path.join(outFolder, address), b);
        console.log('%d: contract %s bytecode length: %d', nextId, address, b.length );
	// proceed synchronously
        nextId++;
        if (nextId < contracts.length) {
            writeBytecode(nextId);
        }
      })
     .catch(e => {
               console.error('Failed address: %s', address);
               console.error(e);
               process.exit(1);
            });

}

