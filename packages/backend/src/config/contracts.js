const OMYaiRegistryABI = require('./abi/OMYaiRegistry.json');

module.exports = {
  registry: {
    address: process.env.REGISTRY_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Default Hardhat address
    abi: OMYaiRegistryABI.abi
  }
};
