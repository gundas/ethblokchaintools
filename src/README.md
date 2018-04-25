## Description
The tools here are based on `nodejs` and us `web3` Ethereum Javascript API. 
Most of the tools assume that there is a local `Geth` instance running exposing RPC endpoint at default `http://localhost:8545`. In order to retrieve data from blockchain `Geth` needs to be synchorized (blocks and the state database).


## Background information - extracting all contracts' metadata from Ethereum blockchain

There is no way to enumerate accounts and contracts in the Ethereum blockchain. The only way to retrieve contracts is to check every transaction in every block of the blockchain and see if that transaction has created a new contract.

### Identifying contract creation transactions
Technically, every transaction which does not specify the destination address (leaves `transaction.to` empty) is considered to be a contract creation transaction in Ethereum. The new contract address is generated, the contract bytecode is created by executing the bytecode provided in the `transaction.input` field and stored in the blockchain.
The newly generated contract address can be seen in the `transactionReceipt`.

However, a significant number of transactions (about one third on the main net) which do not specify destination address ( `transaction.to`) do not provide contract creation bytecode (`transaction.input`) as well. Such transactions succeed but create a contract with no bytecode. If Ether has been sent along with a transaction it will be locked in the contract forever, because the contract does not have any code to recover those funds.

### Identifying failed contract creation transactions
`transactionReceipt.status` field indicates if the given transaction has succeeded of failed. However, this field is only populated after the Byzantium fork, block 4,370,000 (basically blocks created after 16th October, 2017).
For transactions created earlier it is possible to check the state by calling eth.debug.traceTransaction(transactionHash). Unfortunately this approach does not work if Geth node has been synced in `--fast` mode.
For more detailed information on retrieving the transaction status see [this](https://ethereum.stackexchange.com/questions/6007/how-can-the-transaction-status-from-a-thrown-error-be-detected-when-gas-can-be-e) discussion.

When a contract creation transaction fails (due to invalid instructions or due to Out of Gas exception) the contract is created but the contract has empty bytecode ("0x").


### Decision:

For the purpose of contract metadata extraction I will assume that any transaction which has no destination address specified is a contract creation transaction. I will not check if the `transaction.input` has been provided or if transaction has been executed successfully.
I will decide if the contract on the blockchain is functional by checking if the contract bytecode is empty ("0x"). 
The contract bytecode could be empty for the following reasons:
1. no `transaction.input` provided
1. `transaction.input` provided but it results in an error
1. not enough gas provided for the transaction
1. the contract has been killed


# Usage

## Installation

```
$ git clone https://github.com/gundas/ethblokchaintools.git
$ cd src
$ npm install

```

## extractContracts.js

This script scans a given block range (from...to block numbers) and outputs the following information about every contract:
* contract address 
* current balance in Ethereum units (not Wei)
* transaction input length - this is the length of an EVM bytecode which creates the contract on the blockchain
* bytecode length - contract code
* the hash of transaction which created the contract
* the block number where the contract was created
* the MD5 hash of the bytecode to identify identical contracts

The tool outputs the results to standard output, one contract (space separated) data per line. 
The errors are outputted to standard error output. 

Sample usage:
```
$ node extractContracts.js 48000 48700
0x589ea787b46dA08eC8fC081678335C5d0081010e 0.002 2 2 0x28dde8260ea71c354b9d3e0cf0c2fcd86369b34f6527b7806b519ff4d6bb6d95 48162 1438952547 f6f8ca1ed640b8a47a692332d6cd0a19
0x9a6bfff95d8AE43425d3960585c230c89e9060E4 0.01 2 2 0x7a54025726704a0498ba47946296c199d11917ba47dbf7804d7a1c7e6029bfbf 48172 1438952860 f6f8ca1ed640b8a47a692332d6cd0a19
0xF0B0420788Efa4e6241Ed3fF5e88c092D7EE4FA3 1 2 2 0x4f2e6103c5b6224fe4cb478b957215a71b0e8c0523c0ce41a80b7697dbea3cb1 48173 1438952908 f6f8ca1ed640b8a47a692332d6cd0a19
0x4dAE54C8645C47Dd55782091ecA145C7bFF974Bc 0 10 2 0x28a6edb8d77c1f1f5531aa0d1c9014c063dd512c9d6a6eff193b73ba676064a6 48512 1438958350 f6f8ca1ed640b8a47a692332d6cd0a19
0x9973aaD0d294ac02632d8d26A1a2818213f31f0b 0 12 2 0x4e726f789d6c2411b49e8ee475cb4f09aa8397c16dbca5629e80e9a6bd88b168 48537 1438958635 f6f8ca1ed640b8a47a692332d6cd0a19
0x7043be25dA95cB39CDaAdC80F68Cf4066A5146d4 0.001 2 2 0x1aff7a5d0a2e0808a1d693991f0ee708f8280420b91fa787d4c643626b49fecd 48591 1438959546 f6f8ca1ed640b8a47a692332d6cd0a19
0x1a332271eAC30c5E967ce9E606Bb0e9B4ddf436E 0.001 2 2 0x290044d69e0c91da06f02e55acc7d9d16a8e62fda29071bb0b9550da7bf69e20 48613 1438959842 f6f8ca1ed640b8a47a692332d6cd0a19
0x87C44B9a951161D6d261723130208b176475F2Ad 0 12 2 0x06d751236ef10eed7e59cb305fa56bc7007dfebea0a792cb2528cfd601e40114 48615 1438959876 f6f8ca1ed640b8a47a692332d6cd0a19
0x6516298e1C94769432Ef6d5F450579094e8c21fA 0 572 534 0x575cc1e5d4259547110dc1312b85c7c5ad0a816b3c8eb194e3b874d65a1a0211 48643 1438960342 6b6dd01607d00368f45e8d8281b0dfc7
0xFeA8c4Afb88575cd89A2D7149Ab366E7328B08eB 0 1578 2 0x0640d3eb410e90008a73afc91cba70f6e3c91c2fe7cf2b7e073506f5da565f0f 48681 1438960984 f6f8ca1ed640b8a47a692332d6cd0a19
0xd464E6289Af4D1b3a6faBf2dE33c2caE85dc98F3 0 1578 2 0x66dcd8e4a5dc606f04a874778f7d737694318bc097423dfba60bfd84d94e5dbb 48699 1438961398 f6f8ca1ed640b8a47a692332d6cd0a19

```

## sortContracts.js
This is a convenience tool to order and filter out contracts file produced by `extractContracts.js`. It does not require `Geth` connectivity.

Paramaters:
* input file produced by `extractContracts.js` 
* balance in Ether (0 if omitted)  - only the contracts which balance is above will be included in the results.

Output - excatly the same as `extractContracts.js` but sorted by contract balance in descending order.


Sample usage - get all contracts which have a balance above 500000 Ether:
```
$ node sortContracts.js ../data/contracts5450000.txt  500000
0xab7c74abC0C4d48d1bdad5DCB26153FC8780f83E 1400000.0113631254 14500 13094 0x50690212781712b70e7ac412b9e3595d847a644e852a9929b6624c749d8ea7fc 1659464 1465290410 1ff6ef1180fa473497cb7f494827c051
0x61EDCDf5bb737ADffE5043706e7C5bb1f1a56eEA 710000.00001 3364 2424 0xded458fdc4a0cb1f314e2c06cd7430ac3d640c95d4e031e7a1ff9a8a69365ca7 1765076 1466804289 a368c2097adc69516a89162f3f07f1c8
0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe 669816.1545188855 8344 7784 0x9c81f44c29ff0226f835cd0a8a2f2a7eca6db52a711f8211b566fd15d3e0e8d4 54092 1439048640 c32fa78cd3bdee07c163745cd4a2cf6e

```


## extractBytecode.js

Takes a file which contains a list of contract addresses and writes each contract's bytecode (`eth.getCode(address)`) to a separate file.
Parameters:
* input file produced by `extractContracts.js` 
* output folder

The output folder will be created if it does not exist. If contract file already exists, it will not be overwritten.

## extractCreationBytecode.js

Very simialr to `extractBytecode.js` with the only difference that it uses transaction hash to extract contract creation bytecode (from `transaction.input` field). 

Parameters:
* input file produced by `extractContracts.js` 
* output folder

The output folder will be created if it does not exist. If contract file already exists, it will not be overwritten.

