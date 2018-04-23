var Web3 = require ("web3");

var w3  = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

blockNumber = "latest";

// check arguments
if (process.argv.length != 4) {
   console.log("Usage: ");
   console.log("node extractContracts.js <start block Number> <finish block number>");
   process.exit(1);
}

var blockStart = process.argv[2];
var blockEnd = process.argv[3];

Analyze(blockStart, blockEnd);


function Analyze (blockNumber, blockEnd) {
   //console.log(blockNumber);
   getBlockContracts(w3, blockNumber).then( contracts => {
         if (contracts && contracts.length) {
             for (var contract of contracts) { 
               console.log("%s %d %s %d", contract.address, w3.utils.fromWei(contract.balance), contract.transaction, blockNumber);
             }
         }
        if (blockNumber < blockEnd) {
            blockNumber++;
            Analyze(blockNumber, blockEnd);
        } 
      })
      .catch(err => {
           console.error(err);
           // sometimes geth errors (produces empty response), so just log to error output and try again
           Analyze(blockNumber, blockEnd);
       });
}


async function getBlockContracts (w3, blockNumber) {
   var contracts = [];
   var block = await w3.eth.getBlock(blockNumber, true);
   if (block && block.transactions) {
      for (var tran of block.transactions) {
         if (!tran.to) {
            var tranReceipt = await w3.eth.getTransactionReceipt(tran.hash);
            var balance = await w3.eth.getBalance(""+ tranReceipt.contractAddress);
            contracts.push({'address':tranReceipt.contractAddress, 'transaction': tran.hash,  'balance':balance});
         }
      }
   }
   return contracts;
}

