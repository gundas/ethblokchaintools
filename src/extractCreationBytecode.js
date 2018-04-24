
var Web3 = require ("web3");

var w3  = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
 
// check arguments
if (process.argv.length != 4) {
   console.log("Usage: ");
   console.log("node extractCreationBytecode.js <input file> <output path>");
   console.log("<input file> format - address balanceEth creationBytecodeLength transaction block");
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
   if (data.length != 5) { 
      console.log('ERROR splitting data, unexpected file format: '+ line);
      process.exit(1);
   }
   contracts.push({'address' : data[0], 'transaction' : data[3]});
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
   var address = contracts[nextId].address;
   // skip aldready downloaded files
   while (fs.existsSync(path.join(outFolder, address))){
     nextId++;
     if (nextId >= contracts.length) {
        return;
     }
     address = contracts[nextId].address; 
   }
   var tran = contracts[nextId].transaction;
   w3.eth.getTransaction(tran).then( t => {
        // write to disk
        fs.writeFileSync(path.join(outFolder, address), t.input);
        console.log('%d: contract %s bytecode length: %d', nextId+1, address, t.input.length );
	// proceed synchronously
        nextId++;
        if (nextId < contracts.length) {
            writeBytecode(nextId);
        }
      })
     .catch(e => {
               console.log('Failed address: %s', address);
               console.log(e);
               process.exit(1);
            });

}

