module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
  }) => {
    const { deploy, execute } = deployments;
    const { deployer } = await getNamedAccounts();
  
    // the following will only deploy "GenericMetaTxProcessor" if the contract was never deployed or if the code changed since last deployment
    const point = await deploy("ArigaTokenERC20", {
        from: deployer,
        args: [],
    });

    const dit = await deploy("DohitashimashiTokenERC20", {
      from: deployer,
      args: [],
    });

    console.log("Point address: " + point.address);
    console.log("DIT address: " + dit.address);

    const arigatou = await deploy("Arigatou", {
        from: deployer,
        args: [point.address, dit.address],
    });
  };
  