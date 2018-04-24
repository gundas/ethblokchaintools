# ethblokchaintools
The goal of this project is to create some tools to analyze the contracts on Ethereum public blockchain.

I it is an early work in progress. 

## Goals

### Collect and analyze statistical information

#### Implement tools to retrieve data
I am starting by creating some simple nodejs tools to extract information about every contract on ethereum blockchain:
* address
* balance
* transaction which created the contract
* transaction input (aka contract creation bytecode)
* block number
* contract bytecode

The tools are available in the `src` folder. Sea the `readme.md` there for the tools' description.
Partial data is available in `data` folder.


#### Do some statistical analysis/graphs

TBD - most probably it will be some R code to analyze the collected data and produce some insights/graphs.


### Do automated security analysis of the contracts

TBD - I am starting to play with MAYAN. Another tool might be Mythril. 

