See https://github.com/gundas/ethblokchaintools/tree/master/src for detailed description how the data was obtained.


## contracts5500000_nonempty.txt 

The file contains the smart contracts' information extracted from Ethereum blockchain until block number 5,500,000. 

Only contracts which had balance above 0 Wei (checked at around April 23th-25th, 2018) are included in this list.

Each line contains the following space separated data:
1. Contract address
1. Contract balance in Eth at around April 23th-25th, 2018
1. Contract creation bytecode length ('transaction.input')
1. Contract bytecode length
1. Transaction hash which created the contract
1. Block number
1. Block timestamp
1. Contract bytecode MD5 hash

## contractsByBytecode.txt 
This file contains MD5 hashes of all of the smart contracts bytecode (up to block 5,500,000).

Each line contains the following space separated data:
1. cumulative amount of Ether stored across all the contracts having this bytecode MD5 hash
1. a number of contracts having this bytecode MD5 hash
1. MD5 hash of the contract bytecode
