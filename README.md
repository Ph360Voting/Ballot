# A decentralized Voting dApp built using Truffle 

### Made by Shifra and Guy as part of our final project for Ph360

Ballot is a decentralized voting application.
As is, the UI will run on port 4200 and try to connect to the blockchain through port 8545.
If you wanna change this you can update your preferences in bs-config.json and truffle.js respectivly.

## To run the full dApp, download and run in the dApp folder:
```
npm install
truffle compile
truffle migrate
npm run dev
```

## To run on a local test network (Ganache is the recommended default), the network needs to be running and then you can use the command:
```
truffle migrate
```
## To run on a test network like Rinkeby, first you need to have an account with ether in it (fake rinkeby-test-ether) and then run a node of it (like with geth). For exmple you can download geth and run:
```
geth --rinkeby --rpc --rpcapi db,eth,net,web3,personal --unlock="0xACCOUNT_NAME_HERE" --password /PATH/TO/FILE/WITH/THE/PASSWORD/OF/ACCOUNT --rpccorsdomain http://localhost:3000
```
Then you can execute truffle migrate, but with an added network flag:
```
truffle migrate --network rinkeby
```
## To simply see the front-end, one can download and simply run in the dApp folder
```
npm run dev
```

