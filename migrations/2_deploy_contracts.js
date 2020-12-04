var insurance = artifacts.require('./P2pInsurance.sol');
var admin = artifacts.require('./Admin.sol');

module.exports = function(deployer){
    // deployer.deploy (admin);
    // deployer.deploy (insurance);
  deployer.then(async () => {
    await deployer.deploy(admin);
    await deployer.deploy(insurance);
  })
};
