import {expect} from "chai";
import * as hre from "hardhat";
import {TransactionResponse} from "@ethersproject/abstract-provider";
import {BigNumber} from "ethers";
import * as moment from "moment";

describe('Junkeng', () => {
    beforeEach(async () => {
        await hre.deployments.fixture();
    })

    const getContracts = async () => {
        const { tester1, tester2 } = await hre.getNamedAccounts();
        // @ts-ignore
        const Junkeng1 = await hre.ethers.getContract('Junkeng', tester1);
        // @ts-ignore
        const Junkeng2 = await hre.ethers.getContract('Junkeng', tester2);

        return { Junkeng1, Junkeng2, tester1, tester2 };
    }

    describe('Regular run', () => {
        it('Join Succeed', async () => {
            const { Junkeng1, Junkeng2, tester1, tester2 } = await getContracts();

            await Junkeng1.join().then((tx: TransactionResponse) => tx.wait());
            await Junkeng2.join().then((tx: TransactionResponse) => tx.wait());

            const status1 = await Junkeng1.getStatus();
            const status1op = await Junkeng1.getOpponentStatus();
            const status2 = await Junkeng2.getStatus();
            const status2op = await Junkeng2.getOpponentStatus();

            expect(status1.addr).equal(tester1);
            expect(status1.index).equal(0);
            expect(status1.status).equal(1);
            expect(status1.handShape).equal(0);
            expect(status1.index).equal(status2op.index);

            expect(status2.addr).equal(tester2);
            expect(status2.index).equal(1);
            expect(status2.status).equal(1);
            expect(status2.handShape).equal(0);
            expect(status2.index).equal(status1op.index);
        })

        it('Disclose Succeed', async () => {
            const { Junkeng1, Junkeng2, tester1, tester2 } = await getContracts();

            await Junkeng1.join().then((tx: TransactionResponse) => tx.wait());
            await Junkeng2.join().then((tx: TransactionResponse) => tx.wait());
            await Junkeng1.disclose(1).then((tx: TransactionResponse) => tx.wait());
            await Junkeng2.disclose(2).then((tx: TransactionResponse) => tx.wait());

            const status1 = await Junkeng1.getStatus();
            const status1op = await Junkeng1.getOpponentStatus();
            const status2 = await Junkeng2.getStatus();
            const status2op = await Junkeng2.getOpponentStatus();

            expect(status1.addr).equal(tester1);
            expect(status1.index).equal(BigNumber.from(0));
            expect(status1.status).equal(3);
            expect(status1.handShape).equal(1);
            expect(status1.index).equal(status2op.index);

            expect(status2.addr).equal(tester2);
            expect(status2.index).equal(BigNumber.from(1));
            expect(status2.status).equal(3);
            expect(status2.handShape).equal(2);
            expect(status2.index).equal(status1op.index);
        })

        it('Coin was earned', async () => {
            const {Junkeng1, Junkeng2, tester1} = await getContracts();
            // @ts-ignore
            const Coin1 = await hre.ethers.getContract('JunkCoinERC20', tester1);

            await Junkeng1.join().then((tx: TransactionResponse) => tx.wait());
            await Junkeng2.join().then((tx: TransactionResponse) => tx.wait());
            await Junkeng1.disclose(1).then((tx: TransactionResponse) => tx.wait());
            await Junkeng2.disclose(2).then((tx: TransactionResponse) => tx.wait());
            await Junkeng1.withdraw().then((tx: TransactionResponse) => tx.wait());

            expect(await Coin1.balanceOf(tester1)).equal(BigNumber.from(1));
        })

        it('Get coin balance Succeed', async () => {
            const { Junkeng1, Junkeng2 } = await getContracts();

            await Junkeng1.join().then((tx: TransactionResponse) => tx.wait());
            await Junkeng2.join().then((tx: TransactionResponse) => tx.wait());
            await Junkeng1.disclose(1).then((tx: TransactionResponse) => tx.wait());
            await Junkeng2.disclose(2).then((tx: TransactionResponse) => tx.wait());

            const coins = await Junkeng1.getCoinBalance(moment().unix());

            expect(coins).equal(1);
        })
    })

    describe("Irregular run", () => {
        it('Errors (1)', async () => {
            const { Junkeng1, Junkeng2 } = await getContracts();

            expect(await Junkeng1.disclose(2)
                .then((tx: TransactionResponse) => tx.wait())
                .catch((e: Error) => {
                    console.log(e.message);
                    return e.message;
                }))
                .to.have.string('Not participants');
        })

        it('Errors (2)', async () => {
            const { Junkeng1, Junkeng2 } = await getContracts();

            expect(await Junkeng1.withdraw()
                .then((tx: TransactionResponse) => tx.wait())
                .catch((e: Error) => {
                    console.log(e.message);
                    return e.message;
                }))
                .to.have.string('No coins');
        })

        it('Errors (3)', async () => {
            const { Junkeng1, Junkeng2 } = await getContracts();

            // Join succeed
            await Junkeng1.join().then((tx: TransactionResponse) => tx.wait());

            expect(await Junkeng1.disclose(1)
                .then((tx: TransactionResponse) => tx.wait())
                .catch((e: Error) => {
                    console.log(e.message);
                    return e.message;
                }))
                .to.have.string('Opponent not ready');

            expect(await Junkeng1.join()
                .then((tx: TransactionResponse) => tx.wait())
                .catch((e: Error) => {
                    console.log(e.message);
                    return e.message;
                }))
                .to.have.string('Already participated');
        })

        it('Errors (4)', async () => {
            const { Junkeng1, Junkeng2 } = await getContracts();

            // Join succeed
            await Junkeng1.join().then((tx: TransactionResponse) => tx.wait());
            // Join succeed
            await Junkeng2.join().then((tx: TransactionResponse) => tx.wait());

            expect(await Junkeng1.disclose(5)
                .then((tx: TransactionResponse) => tx.wait())
                .catch((e: Error) => {
                    console.log(e.message);
                    return e.message;
                }))
                .to.have.string('Invalid hand shape');

            // Disclose succeed
            await Junkeng1.disclose(3).then((tx: TransactionResponse) => tx.wait());

            expect(await Junkeng1.disclose(2)
                .then((tx: TransactionResponse) => tx.wait())
                .catch((e: Error) => {
                    console.log(e.message);
                    return e.message;
                }))
                .to.have.string('Already disclosed');
        })

        it('Errors (5)', async () => {
            const { Junkeng1, Junkeng2 } = await getContracts();

            expect(await Junkeng1.getStatus()
                .catch((e: Error) => {
                    console.log(e.message);
                    return e.message;
                }))
                .to.have.string('No registration')
        })
    })
})
