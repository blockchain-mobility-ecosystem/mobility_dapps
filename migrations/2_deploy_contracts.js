//var ConvertLib = artifacts.require("./ConvertLib.sol");
//var MetaCoin = artifacts.require("./MetaCoin.sol");
var CarSharing = artifacts.require("./CarSharing.sol");
var MultiOwnship = artifacts.require("./MultiOwnership.sol");

module.exports = function(deployer) {
  //deployer.deploy(ConvertLib);
  //deployer.link(ConvertLib, MetaCoin);
  //deployer.deploy(MetaCoin);
  deployer.deploy(CarSharing);
  deployer.deploy(MultiOwnship);
};
