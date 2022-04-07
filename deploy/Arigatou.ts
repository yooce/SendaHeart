module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
  }) => {
    const { deploy, execute } = deployments;
    const { deployer } = await getNamedAccounts();
  
    // the following will only deploy "GenericMetaTxProcessor" if the contract was never deployed or if the code changed since last deployment
    const coin = await deploy("ArigaTokenERC20", {
        from: deployer,
        args: [],
    });

    const arigatou = await deploy("Arigatou", {
        from: deployer,
        args: [coin.address],
    });
  };
  