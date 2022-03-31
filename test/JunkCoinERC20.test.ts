import {expect} from "chai";
import * as hre from "hardhat";
import {TransactionResponse} from "@ethersproject/abstract-provider";
import {BigNumber} from "ethers";

describe('JunkCoinERC20', () => {
    beforeEach(async () => {
        // @ts-ignore
        await hre.deployments.fixture();
    })

    const getContracts = async () => {
        const { deployer, tester1, tester2 } = await hre.getNamedAccounts();
        // @ts-ignore
        const JunkCoinERC20 = await hre.ethers.getContract('JunkCoinERC20', deployer);

        return { JunkCoinERC20, deployer, tester1, tester2 };
    }

    it('Transfer', async () => {
        const { JunkCoinERC20, deployer, tester1 } = await getContracts();

        expect(await JunkCoinERC20.totalSupply()).equal(BigNumber.from(100000000));
        expect(await JunkCoinERC20.balanceOf(deployer)).equal(BigNumber.from(100000000));
        expect(await JunkCoinERC20.balanceOf(tester1)).equal(BigNumber.from(0));

        await JunkCoinERC20.transfer(tester1, 100).then((tx: TransactionResponse) => tx.wait());

        expect(await JunkCoinERC20.balanceOf(deployer)).equal(BigNumber.from(99999900));
        expect(await JunkCoinERC20.balanceOf(tester1)).equal(BigNumber.from(100));
    })

    it('TransferFrom', async () => {
        const { JunkCoinERC20, deployer, tester1, tester2 } = await getContracts();
        // @ts-ignore
        const JunkCoinERC20tester1 = await hre.ethers.getContract('JunkCoinERC20', tester1);

        expect(await JunkCoinERC20.allowance(deployer, tester1)).equal(BigNumber.from(0));

        await JunkCoinERC20.approve(tester1, 100).then((tx: TransactionResponse) => tx.wait());

        expect(await JunkCoinERC20.allowance(deployer, tester1)).equal(BigNumber.from(100));

        await JunkCoinERC20tester1.transferFrom(deployer, tester2, 50).then((tx: TransactionResponse) => tx.wait());

        expect(await JunkCoinERC20.balanceOf(deployer)).equal(BigNumber.from(99999950));
        expect(await JunkCoinERC20.balanceOf(tester2)).equal(BigNumber.from(50));
        expect(await JunkCoinERC20.allowance(deployer, tester1)).equal(BigNumber.from(50));
    })

    it('Transfer Error', async () => {
        const { JunkCoinERC20, deployer, tester1, tester2 } = await getContracts();
        // @ts-ignore
        const JunkCoinERC20tester1 = await hre.ethers.getContract('JunkCoinERC20', tester1);

        expect(await JunkCoinERC20tester1.transfer(deployer, 100).catch((e: Error) => e.message))
            .to.have.string('ERC20: transfer amount exceeds balance');
        expect(await JunkCoinERC20.transferFrom(deployer, tester2, 100).catch((e: Error) => e.message))
            .to.have.string('ERC20: transfer amount exceeds allowance');
    })
})
