import chai, { expect } from 'chai';
import { ethers } from 'hardhat';
import { solidity } from 'ethereum-waffle';
import { Contract, ContractFactory, BigNumber, utils } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { Provider } from '@ethersproject/providers';

chai.use(solidity);

const ETH = utils.parseEther('1');

async function latestBlocktime(provider: Provider): Promise<number> {
    const { timestamp } = await provider.getBlock('latest');
    return timestamp;
}

describe('HedgeFund', () => {
    const { provider } = ethers;

    let liftTokenFactory: ContractFactory;
    let devFundFactory: ContractFactory;

    let liftToken: Contract;
    let devFund: Contract;

    let operator: SignerWithAddress;
    let addr1: SignerWithAddress;

    before(async () => {
        [operator, addr1] = await ethers.getSigners();

        liftTokenFactory = await ethers.getContractFactory('LIFT');
        devFundFactory = await ethers.getContractFactory('DevFund');
    });

    beforeEach(async () => {
        liftToken = await liftTokenFactory.deploy();
        devFund = await devFundFactory.deploy();
    });

    describe('Deployment', async () => {
        describe('DevFund', async () => {
            it('should not allow deposits greater than balance', async () => {
                const amountToDeposit = ETH.mul(10);

                await expect(devFund.connect(addr1).deposit(liftToken.address, amountToDeposit, 'why not'))
                    .to.be.revertedWith(
                        "VM Exception while processing transaction: revert ERC20: transfer amount exceeds balance"
                    );
            });

            it('should not allow deposits without allowance', async () => {
                const amountToDeposit = ETH.mul(10);

                await liftToken.mint(addr1.address, amountToDeposit);

                await expect(devFund.connect(addr1).deposit(liftToken.address, amountToDeposit, 'why not'))
                    .to.be.revertedWith(
                        "VM Exception while processing transaction: revert ERC20: transfer amount exceeds allowance"
                    );
            });

            it('should allow deposits', async () => {
                const amountToDeposit = ETH.mul(10);

                await liftToken.mint(addr1.address, amountToDeposit);
                await liftToken.connect(addr1).approve(devFund.address, amountToDeposit);

                await expect(devFund.connect(addr1).deposit(liftToken.address, amountToDeposit, 'why not'))
                    .to.emit(devFund, "Deposit")
                    .withArgs(addr1.address, await latestBlocktime(provider), 'why not');
            });

            it('should only allow withdraw if operator', async () => {
                const amountToWithdraw = ETH.mul(10);

                await expect(devFund.connect(addr1).withdraw(liftToken.address, amountToWithdraw, addr1.address, 'why not'))
                    .to.be.revertedWith(
                        "VM Exception while processing transaction: revert operator: caller is not the operator"
                    );
            });

            it('should not allow withdraw greater than DevFund balance', async () => {
                const amountToDeposit = ETH.mul(10);
                const amountToWithdraw = ETH.mul(20);

                await liftToken.mint(addr1.address, amountToDeposit);
                await liftToken.connect(addr1).approve(devFund.address, amountToDeposit);

                devFund.connect(addr1).deposit(liftToken.address, amountToDeposit, 'why not')

                await expect(devFund.withdraw(liftToken.address, amountToWithdraw, addr1.address, 'why not'))
                    .to.be.revertedWith(
                        "VM Exception while processing transaction: revert ERC20: transfer amount exceeds balance"
                    );
            });

            it('should allow withdraw as operator', async () => {
                const amountToDeposit = ETH.mul(10);

                await liftToken.mint(addr1.address, amountToDeposit);
                await liftToken.connect(addr1).approve(devFund.address, amountToDeposit);

                await devFund.connect(addr1).deposit(liftToken.address, amountToDeposit, 'why not')

                await expect(devFund.withdraw(liftToken.address, amountToDeposit, addr1.address, 'why not'))
                    .to.emit(devFund, "Withdrawal")
                    .withArgs(operator.address, addr1.address, await latestBlocktime(provider), 'why not');
            });
        });
    });
});