 
// check arguments
if (process.argv.length != 3 && process.argv.length !=4 ) {
   console.log("Usage: ");
   console.log("node sortContracts.js <input file> <minimum balance>");
   console.log("<input file> format: account balanceEth blockNumber");
   console.log("<minimum balance> in ETH can be included in the results, will default to 0"); 
   process.exit(1);
}

var inputFile = process.argv[2];
var minimumBalance = (process.argv[3] && parseFloat(process.argv[3])) || 0;

var fs = require('fs');
var readline = require('readline');
var stream = require('stream');

var inStream = fs.createReadStream(inputFile);
var outStream = new stream;
var rl = readline.createInterface(inStream, outStream);

var contracts = [];

rl.on('line', function (line) {
   // parse line
   var data = line.split(' ');
   if (data.length != 3) { 
      console.error('ERROR splitting data: %s Expected:3, received:%d', line, data.length);
      process.exit(1);
   }
   var balance = parseFloat(data[1]);
   if (balance > minimumBalance) {
      contracts.push({
        'account': data[0],
        'balance': balance,
        'block' : data[2]
        });
      //console.log(line);
   }
});



rl.on('close', function () {
   // sort and output
   contracts.sort(function (a,b) { return b.balance - a.balance});
   for (var i=0; i < contracts.length; i++) {
      console.log("%s %d %d",  contracts[i].account, contracts[i].balance, contracts[i].block);
   }


});

