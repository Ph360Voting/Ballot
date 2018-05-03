# A decentralized Voting dApp built using Truffle 

### Made by Shifra and Guy as part of our final project for Ph360

dApp will run on port 4200 and try to connect to the blockchain through port 8545.
If you wanna change this you can update your preferences in bs-config.json and truffle.js respectivly.

## To run the full dApp, download and run in the dApp folder:
```
npm install
truffle compile
truffle migrate
npm run dev
```

## To run on a local test network (Ganache is the recommended default), use the command:
```
truffle migrate
```
## To run on a test network like Rinkeby, change command to:
```
truffle migrate --network rinkeby
```

## To simply see the front-end, one can download and simply run in the dApp folder
```
npm run dev
```

