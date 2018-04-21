var Web3 = require ("web3");

var w3  = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

blockNumber = "latest";

// check arguments
if (process.argv.length != 4) {
   console.log("Usage: ");
   console.log("node getBlockDetails.js <start block Number> <finish block number>");
   process.exit(1);
}

var blockStart = process.argv[2];
var blockEnd = process.argv[3];

Analyze(blockStart, blockEnd);


function Analyze (blockNumber, blockEnd) {
   //do recursion to create sequential requests to geth, so it is not overwhelmed
   w3.eth.getBlock(blockNumber, false).then( blockInfo => {
        
        console.log("%d %d %d", blockNumber, blockInfo.transactions && blockInfo.transactions.length || 0, blockInfo.timestamp);

        if (blockNumber < blockEnd) {
            blockNumber++;
            Analyze(blockNumber, blockEnd);
        } 
      })
      .catch(err => {
           console.error(err);
           Analyze(blockNumber, blockEnd);
       });
}


