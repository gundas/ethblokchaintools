## Description
The tools here are based on `nodejs` and us `web3` Ethereum Javascript API. 
All of the tools assume that there is a local `Geth` instance running exposing RPC endpoint at default `http://localhost:8545`.

The tools are in alpha version.


## List of tools

### extractContracts.js

This script scans a given block range (from...to block numbers) and outputs the following information about every contract:
* contract address 
* current balance in Ethereum units (not Wei)
* transaction input length - this is the length of an EVM bytecode which creates the contract on the blockchain
* the hash of transcation which created the contract
* the block number where the contract was created

The tool outputs the results to standard output, one contract (space separaged) data per line. 
The errors are outputted to standard error output. 

Sample usage:
```
$ node extractContracts.js 48000 48700
0x589ea787b46dA08eC8fC081678335C5d0081010e 0.002 2 0x28dde8260ea71c354b9d3e0cf0c2fcd86369b34f6527b7806b519ff4d6bb6d95 48162
0x9a6bfff95d8AE43425d3960585c230c89e9060E4 0.01 2 0x7a54025726704a0498ba47946296c199d11917ba47dbf7804d7a1c7e6029bfbf 48172
0xF0B0420788Efa4e6241Ed3fF5e88c092D7EE4FA3 1 2 0x4f2e6103c5b6224fe4cb478b957215a71b0e8c0523c0ce41a80b7697dbea3cb1 48173
0x4dAE54C8645C47Dd55782091ecA145C7bFF974Bc 0 10 0x28a6edb8d77c1f1f5531aa0d1c9014c063dd512c9d6a6eff193b73ba676064a6 48512
0x9973aaD0d294ac02632d8d26A1a2818213f31f0b 0 12 0x4e726f789d6c2411b49e8ee475cb4f09aa8397c16dbca5629e80e9a6bd88b168 48537
0x7043be25dA95cB39CDaAdC80F68Cf4066A5146d4 0.001 2 0x1aff7a5d0a2e0808a1d693991f0ee708f8280420b91fa787d4c643626b49fecd 48591
0x1a332271eAC30c5E967ce9E606Bb0e9B4ddf436E 0.001 2 0x290044d69e0c91da06f02e55acc7d9d16a8e62fda29071bb0b9550da7bf69e20 48613
0x87C44B9a951161D6d261723130208b176475F2Ad 0 12 0x06d751236ef10eed7e59cb305fa56bc7007dfebea0a792cb2528cfd601e40114 48615
0x6516298e1C94769432Ef6d5F450579094e8c21fA 0 572 0x575cc1e5d4259547110dc1312b85c7c5ad0a816b3c8eb194e3b874d65a1a0211 48643
0xFeA8c4Afb88575cd89A2D7149Ab366E7328B08eB 0 1578 0x0640d3eb410e90008a73afc91cba70f6e3c91c2fe7cf2b7e073506f5da565f0f 48681
0xd464E6289Af4D1b3a6faBf2dE33c2caE85dc98F3 0 1578 0x66dcd8e4a5dc606f04a874778f7d737694318bc097423dfba60bfd84d94e5dbb 48699
```


**NOTE**: 
>Technically, every transaction which does not specify the destination address (leaves `transaction.to` empty) is considered to be a contract creation transaction in Ethereum. However, a significant number of such transactions (about one third on the mainnet) are done by mistake - they neither specify the destination address (`transaction.to`) nor they supply contract creation bytecode (`transaction.input`). 
>
>The `extractContract.js` tool treats all of the transactions which do not specify the destination address as contract creation transactions. However if the "transaction input length" is 2 (the length of "0x" string) it means that no `transaction.input` was supplied and this contract was actually created by mistake.
