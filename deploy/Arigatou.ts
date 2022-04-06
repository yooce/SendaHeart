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
        gasLimit: 1000000,
        args: [],
    });

    const arigatou = await deploy("Arigatou", {
        from: deployer,
        gasLimit: 1500000,
        args: [coin.address],
    });

    await execute("ArigaTokenERC20", {from: deployer}, 'increaseAllowance', arigatou.address, '100000000');
  };
  