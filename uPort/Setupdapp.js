import { Connect, SimpleSigner } from 'uport-connect'

//Create an object from the Connect function and feed in the App's name, id, and signing key.
//Client_ID is the public address of the dApp.

const uport = new Connect('NAME_OF_DAPP', {
  clientId: 'CLIENT_ID',
  signer: SimpleSigner('SIGNING KEY')
})

//For frontend API
const web3 = uport.getWeb3()
export { web3, uport }






