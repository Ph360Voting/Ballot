module.exports = {
  networks: {
      // See <http://truffleframework.com/docs/advanced/configuration>
      // for more about customizing your Truffle configuration!
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
    },
    rinkeby: {
      host: "localhost", // Connect to geth on the specified
      port: 8545,
      from: "0xBBAFad45E1ae07285Bf5627D810065859dc318e8", // default address to use for any transaction Truffle makes during migrations
      network_id: 4,
      gas: 2692389 // Gas limit used for deploys
    }
  }
};
