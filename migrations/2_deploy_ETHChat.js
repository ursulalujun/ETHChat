const ETHChat = artifacts.require("ETHChat.sol");
// const funcDef = artifacts.require("funcDef.sol");

module.exports = function (deployer) {
//   deployer.deploy(funcDef);
//   ETHChat.link(funcDef, ETHChat);
  deployer.deploy(ETHChat);
};
