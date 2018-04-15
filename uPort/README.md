# Registering an Application with uPort

```
npm install --save uport-connect
```

The Client_ID and Signing Key are provided and inserted:

```
const uport = new Connect('NAME_OF_DAPP', {
  clientId: 'CLIENT_ID',
  signer: SimpleSigner('SIGNING KEY')
})
```
