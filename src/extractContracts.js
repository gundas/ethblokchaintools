var Web3 = require ("web3");

var w3  = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));


var crypto = require("crypto");

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
               console.log("%s %d %d %d %s %d %d %s", 
                              contract.address, 
                              w3.utils.fromWei(contract.balance), 
                              contract.creationBytecodeLength, 
                              contract.bytecodeLength, 
                              contract.transaction, 
                              blockNumber, 
                              contract.timestamp,
                              contract.bytecodeDigest);
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
            // not easy to tell if successful, the status field is available only after Byzantium fork block 4370000
            // so we just ignore it - afterall there is no difference if transaction failed or if a contract has been killed. 
            // the state is the same - contract code is 0x
            
            var balance = await w3.eth.getBalance(tranReceipt.contractAddress);
            var bytecode = await w3.eth.getCode(tranReceipt.contractAddress);
            var bytecodeDigest = crypto.createHash('md5').update(bytecode).digest('hex');
            contracts.push({'address' : tranReceipt.contractAddress, 
                            'transaction' : tran.hash,
                            'balance' : balance, 
                            'creationBytecodeLength': tran.input.length,
                            'bytecodeLength': bytecode.length, 
                            'timestamp' : block.timestamp,
                            'bytecodeDigest' : bytecodeDigest});
         }
      }
   }
   return contracts;
}

