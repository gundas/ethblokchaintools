## Description
The tools here are based on `nodejs` and us `web3` Ethereum Javascript API. 
Most of the tools assume that there is a local `Geth` instance running exposing RPC endpoint at default `http://localhost:8545`.

The tools are in alpha version.


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
TBD

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

Available paramaters:
* input file produced by `extractContracts.js` 
* balance in Ether (0 if omitted)  - only the contracts which balance is above will be included in the results.

Output - excatly the same as `extractContracts.js` but sorted by contract balance in descending order.


Sample usage - get all contracts which have a balance above 100000 Ether:
```
$ node sortContracts.js ../data/contracts5450000.txt  100000
0xab7c74abC0C4d48d1bdad5DCB26153FC8780f83E 1400000.0113631254 14500 13094 0x50690212781712b70e7ac412b9e3595d847a644e852a9929b6624c749d8ea7fc 1659464 1465290410 1ff6ef1180fa473497cb7f494827c051
0x61EDCDf5bb737ADffE5043706e7C5bb1f1a56eEA 710000.00001 3364 2424 0xded458fdc4a0cb1f314e2c06cd7430ac3d640c95d4e031e7a1ff9a8a69365ca7 1765076 1466804289 a368c2097adc69516a89162f3f07f1c8
0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe 669816.1545188855 8344 7784 0x9c81f44c29ff0226f835cd0a8a2f2a7eca6db52a711f8211b566fd15d3e0e8d4 54092 1439048640 c32fa78cd3bdee07c163745cd4a2cf6e
0x52965F9BD9D0F2bbea9b5a9C155A455D0e58Fe25 493015.46048223437 14436 13094 0x1f7aebd1b2db9cabb557346ac189d105a08273a4bb57247a48d17b4aa67791c1 1921837 1469049640 1ff6ef1180fa473497cb7f494827c051
0xF0160428a8552AC9bB7E050D90eEADE4DDD52843 466648.1474628854 10734 7450 0xd93209e55e6c3e84c8b26612ab82ea7c2cb9f8c8b53f92b1a0a84c5a5fd68209 1239208 1459261090 cc60a132471d10a06565c061589896b9
0x900d0881A2E85A8E4076412AD1CeFbE2D39c566c 450000.0500100078 14436 13094 0x4b23c80f28168583126bffed43e72b4f82f231e830066cab9e4521a1834fd559 3633382 1493662833 1ff6ef1180fa473497cb7f494827c051
0xf1ce0A98eFbFA3f8EbEC2399847b7D88294A634e 450000.02001 14436 13094 0x478cfcab3028fc7220ebdc4dc1f5f5c876fd1e069a9aad91bdaaf40ec5c59634 3633288 1493661443 1ff6ef1180fa473497cb7f494827c051
0x07Ee55aA48Bb72DcC6E9D78256648910De513eca 403024.76441062713 3256 2508 0x50f054edf014652940b082d6aa761f4e0ef9540fa4743d9b79abab2f49db6932 2035446 1470678712 ad7d3ca6fde6f45cfcf3cf81a45c877e
0x7da82C7AB4771ff031b66538D2fB9b0B047f6CF9 369023.14805 10710 9390 0xd66169d4a5feaceaf777b9949ad0e9bc5621a438846a90087e50a5d7b9b0ad1e 2600849 1478777310 effe1c3bbbcd12e35878897f353411d6
0x3BfC20f0B9aFcAcE800D73D2191166FF16540258 306276.27226139995 2956 1852 0xdcb7b01434d8b2d1d9595454e2dcf4548e780240b700c259d9733a2f5ca731c2 4274233 1505419905 6773f45b552bfc2d52edc3a49a70eea7
0xA646E29877d52B9e2De457ECa09C724fF16D0a2B 264419.347970953 12768 11346 0x99737b9bb7c089e716bd0e72b2d6c6439ffae44275a4da6f319f8805472fe4ba 3898650 1497884716 8109daa60bece71d9649be7231d68bcd
0xcafE1A77e84698c83CA8931F54A755176eF75f2C 241418.96926763532 17844 16222 0xedabbcd3b5e2b00aacec55ee1ef2ec1cecb1ea947025ea47bcd8cded4a179483 3486455 1491470586 ca883712178724d4b793cbede306607c
0xBf4eD7b27F1d666546E30D74d50d173d20bca754 224204.66138541675 2408 2246 0xfeae1ff3cf9b6927d607744e3883ea105fb16042d4639857d9cfce3eba644286 1883496 1468499105 5ae83de655d54da280ed94764020a008
0xB62EF4c58F3997424B0CCeaB28811633201706Bc 203467.98550192776 4150 3468 0x9b5247b59b641c1cba8f1f30f0db55d98a1892b8fb7235b34bc76eac3833faa5 4012295 1499867274 63c4fa541d5260058f30fd5bc4c5221a
0x851b7F3Ab81bd8dF354F0D7640EFcD7288553419 196074.70001 19722 17766 0x55befd6ad29c13eb16be00e888cf7a676ad4c02b8a942099c278a2efa4bade08 3557579 1492522884 7434e061eb6a93bf64962b5989ccdf26
0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 195495.14270015352 7010 6250 0xb95343413e459a0f97461812111254163ae53467855c0d73e0f1e7c5b8442fa3 4719568 1513077455 5ef766cce3ce8a6c90f0e3e892bf409a
0xba2ED0d772e0CA1F72368E7a610e42397E960946 195357.3836558662 6982 5948 0x3c3103985d77b5720252a72f8f33e1bffa40c22e5676e22764c765349cff5cf2 3751952 1495505323 86e607eb7475c58a0159a4ac5fb63af8
0x21346283a31A5AD10Fa64377E77A8900Ac12d469 120762.2479405257 12338 11114 0xd80e1b8a566868bbab2d56b25eb843ae733c4559d4cd18b6ea8de574798a0cfb 4058170 1500735934 eed2a0cc6d599471c7135442955020ec
0x376c3E5547C68bC26240d8dcc6729fff665A4448 114939.00001000777 2700 1852 0x742025bfd24d92985417e66d2d09a822895eb40f623b7ce1283345d9084500fd 4440105 1509119041 6773f45b552bfc2d52edc3a49a70eea7
0x6C76bb6843C2Ed9A5ad484EdC9FeCba5cd80B6A0 109456.54047091014 14436 13094 0xe2c6c9bc23eed2481ffc4d4fab01d16ca873aa6c0396aba96c391613d4d9e92a 2740710 1480777460 1ff6ef1180fa473497cb7f494827c051
0xDB8C6862Ea4f5Cc843c4b3ed75Eb8951714b7635 106711.69360026551 18186 16402 0x8b6a23d33b23b67198df0bd08f162979abb9be8d69b947db5f9ef5c3e78b6f69 4034254 1500284624 fbeb4e42d4de0fb5fc1620dd16575299
0x0117ef7Fdb2A5814DFf83c50fb799741904Cd28d 100000.004 14500 13094 0x071809ba8458d5b4b6a06f6cc89d31596f24c76625a1bff8d723a763de0617a1 3369107 1489767181 1ff6ef1180fa473497cb7f494827c051

```
