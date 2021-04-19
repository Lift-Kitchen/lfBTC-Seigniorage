import chai, { expect } from 'chai';
import { ethers } from 'hardhat';
import { solidity } from 'ethereum-waffle';
import { Contract, ContractFactory, BigNumber, utils } from 'ethers';
import UniswapV2Factory from '@uniswap/v2-core/build/UniswapV2Factory.json';
import UniswapV2Router from '@uniswap/v2-periphery/build/UniswapV2Router02.json';
import { Provider } from '@ethersproject/providers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { advanceTimeAndBlock } from './shared/utilities';

chai.use(solidity);

const DAY = 86400;
const ZERO_ADDR = '0x0000000000000000000000000000000000000000';
const ETH = utils.parseEther('1');

async function latestBlocktime(provider: Provider): Promise<number> {
    const { timestamp } = await provider.getBlock('latest');
    return timestamp;
}

async function addLiquidity(
    provider: Provider,
    operator: SignerWithAddress,
    router: Contract,
    tokenA: Contract,
    tokenB: Contract,
    amount: BigNumber
): Promise<void> {
await router
    .connect(operator)
    .addLiquidity(
    tokenA.address,
    tokenB.address,
    amount,
    amount,
    amount,
    amount,
    operator.address,
    (await latestBlocktime(provider)) + 1800
    );
}

describe('lfBTCLIFTLPTokenSharePool', () => {
    const { provider } = ethers;
    const startTime = 0;
    const period = 0;
    const lockoutPeriod = 30;

    let lfBTCTokenFactory: ContractFactory;
    let liftTokenFactory: ContractFactory;
    let ctrlTokenFactory: ContractFactory;
    let haifTokenFactory: ContractFactory;

    let mockLPTokenFactory: ContractFactory;
    let mockwBTCTokenFactory: ContractFactory;
    let mockLinkOracleFactory: ContractFactory;

    let uniswapFactoryFactory: ContractFactory;
    let uniswapRouterFactory: ContractFactory;

    let hedgeFundFactory: ContractFactory;
    let ideaFundFactory: ContractFactory;
    let oracleFactory: ContractFactory;
    let boardroomFactory: ContractFactory;
    let lfBTCLIFTLPTokenSharePoolFactory: ContractFactory;

    let lfBTCToken: Contract;
    let liftToken: Contract;
    let ctrlToken: Contract;
    let haifToken: Contract;
    let lfBTCLIFTLPTokenSharePool: Contract;

    let mockLPToken: Contract;
    let mockwBTCToken: Contract;
    let mockLinkOracle: Contract;

    let hedgeFund: Contract;
    let boardroom: Contract;
    let oracle: Contract;
    let ideaFund: Contract;

    let uniswapFactory: Contract;
    let uniswapRouter: Contract;

    let operator: SignerWithAddress;
    let addr1: SignerWithAddress;

    before(async () => {
        [operator, addr1] = await ethers.getSigners();

        lfBTCTokenFactory = await ethers.getContractFactory('LFBTC');
        liftTokenFactory = await ethers.getContractFactory('LIFT');
        ctrlTokenFactory = await ethers.getContractFactory('CTRL');
        haifTokenFactory = await ethers.getContractFactory('HAIF');

        mockLPTokenFactory = await ethers.getContractFactory('MLP');
        mockwBTCTokenFactory = await ethers.getContractFactory('MockwBTC');
        mockLinkOracleFactory = await ethers.getContractFactory('MockLinkOracle');

        hedgeFundFactory = await ethers.getContractFactory('HedgeFund');
        ideaFundFactory = await ethers.getContractFactory('IdeaFund');
        oracleFactory = await ethers.getContractFactory('Oracle');
        boardroomFactory = await ethers.getContractFactory('Boardroom');
        lfBTCLIFTLPTokenSharePoolFactory = await ethers.getContractFactory('lfBTCLIFTLPTokenSharePool');

        uniswapFactoryFactory = new ContractFactory (
            UniswapV2Factory.abi,
            UniswapV2Factory.bytecode
        );

        uniswapRouterFactory = new ContractFactory (
            UniswapV2Router.abi,
            UniswapV2Router.bytecode
        );
    });

    before(async () => {
        uniswapFactory = await uniswapFactoryFactory.connect(operator).deploy(operator.address);
        uniswapRouter = await uniswapRouterFactory.connect(operator).deploy(
            uniswapFactory.address,
            operator.address
        );
    });

    beforeEach(async () => {
        lfBTCToken = await lfBTCTokenFactory.deploy();
        liftToken = await liftTokenFactory.deploy();
        ctrlToken = await ctrlTokenFactory.deploy();
        haifToken = await haifTokenFactory.deploy();

        mockLPToken = await mockLPTokenFactory.deploy();
        mockwBTCToken = await mockwBTCTokenFactory.deploy();
        mockLinkOracle = await mockLinkOracleFactory.deploy();

        hedgeFund = await hedgeFundFactory.deploy(
            mockwBTCToken.address,
            lfBTCToken.address,
            liftToken.address,
            ctrlToken.address,
            haifToken.address,
            startTime
        );

        ideaFund = await ideaFundFactory.deploy(
            mockwBTCToken.address,
            lfBTCToken.address,
            liftToken.address,
            ctrlToken.address,
            haifToken.address,
            hedgeFund.address,
            uniswapRouter.address
        );

        oracle = await oracleFactory.deploy(
            uniswapFactory.address,
            mockwBTCToken.address,
            lfBTCToken.address,
            liftToken.address,
            ctrlToken.address,
            haifToken.address,
            hedgeFund.address,
            ideaFund.address,
            mockLinkOracle.address
        );

        boardroom = await boardroomFactory.deploy(
            liftToken.address,
            ctrlToken.address,
            ideaFund.address,
            oracle.address
        );

        lfBTCLIFTLPTokenSharePool = await lfBTCLIFTLPTokenSharePoolFactory.deploy(
            boardroom.address,
            liftToken.address,
            mockLPToken.address,
            startTime
        );
    });

    describe('Deployment', async () => {
        describe('lfBTCLIFTLPTokenSharePool', async () => {
            it('should not allow staking 0 lpt', async () => {
                await expect(lfBTCLIFTLPTokenSharePool.stake(0))
                .to.be.revertedWith(
                    "VM Exception while processing transaction: revert lfBTCLIFTLPTokenSharePool: Cannot stake 0"
                );
            });

            it('should allow staking lpt', async () => {
                const amountToStake = ETH.mul(10);

                await lfBTCToken.mint(addr1.address, amountToStake);
                await lfBTCToken.connect(addr1).approve(uniswapRouter.address, amountToStake);

                await liftToken.mint(addr1.address, amountToStake);
                await liftToken.connect(addr1).approve(uniswapRouter.address, amountToStake);

                //adding liquidity with the lpToken from the oracle.pairFor() returns an address, but the address
                //isn't recognized as a contract for some reason during unit tests (But works fine on rinkeby) so
                //for now, mocking the lpToken and just minting directly for test
                //await addLiquidity(provider, addr1, uniswapRouter, lfBTCToken, liftToken, amountToStake);

                await mockLPToken.connect(operator).mint(addr1.address, amountToStake);
                await mockLPToken.connect(addr1).approve(lfBTCLIFTLPTokenSharePool.address, amountToStake);

                await expect(lfBTCLIFTLPTokenSharePool.connect(addr1).stake(amountToStake))
                     .to.emit(lfBTCLIFTLPTokenSharePool, "Staked")
                     .withArgs(addr1.address, amountToStake);

                expect(await mockLPToken.balanceOf(lfBTCLIFTLPTokenSharePool.address)).to.be.eq(amountToStake);
            });

            it('should allow staking lpt on behalf of a staker (used by GenesisVault)', async () => {
                const amountToStake = ETH.mul(10);

                await lfBTCToken.mint(operator.address, amountToStake);
                await lfBTCToken.approve(uniswapRouter.address, amountToStake);

                await liftToken.mint(operator.address, amountToStake);
                await liftToken.approve(uniswapRouter.address, amountToStake);

                await mockLPToken.mint(operator.address, amountToStake);
                await mockLPToken.approve(lfBTCLIFTLPTokenSharePool.address, amountToStake);

                await expect(lfBTCLIFTLPTokenSharePool.stakeLP(addr1.address, operator.address, amountToStake, 2))
                     .to.emit(lfBTCLIFTLPTokenSharePool, "Staked")
                     .withArgs(addr1.address, amountToStake);

                expect(await mockLPToken.balanceOf(lfBTCLIFTLPTokenSharePool.address)).to.be.eq(amountToStake);
            });

            it('should not allow withdrawing more lpt than staked ', async () => {
                const amountToStake = ETH.mul(10);

                await lfBTCToken.mint(addr1.address, amountToStake);
                await lfBTCToken.connect(addr1).approve(uniswapRouter.address, amountToStake);

                await liftToken.mint(addr1.address, amountToStake);
                await liftToken.connect(addr1).approve(uniswapRouter.address, amountToStake);

                await mockLPToken.connect(operator).mint(addr1.address, amountToStake);
                await mockLPToken.connect(addr1).approve(lfBTCLIFTLPTokenSharePool.address, amountToStake);

                await lfBTCLIFTLPTokenSharePool.connect(addr1).stake(amountToStake);

                await expect(lfBTCLIFTLPTokenSharePool.connect(addr1).withdraw(amountToStake.add(1)))
                    .to.be.revertedWith(
                        "VM Exception while processing transaction: revert lfBTCLIFTLPTokenSharePool: Cannot withdraw more than staked"
                    );
            });

            it('should allow withdrawing lpt', async () => {
                const amountToStake = ETH.mul(10);

                await lfBTCToken.mint(addr1.address, amountToStake);
                await lfBTCToken.connect(addr1).approve(uniswapRouter.address, amountToStake);

                await liftToken.mint(addr1.address, amountToStake);
                await liftToken.connect(addr1).approve(uniswapRouter.address, amountToStake);

                await mockLPToken.connect(operator).mint(addr1.address, amountToStake);
                await mockLPToken.connect(addr1).approve(lfBTCLIFTLPTokenSharePool.address, amountToStake);

                await lfBTCLIFTLPTokenSharePool.connect(addr1).stake(amountToStake);

                await expect(lfBTCLIFTLPTokenSharePool.connect(addr1).withdraw(amountToStake))
                     .to.emit(lfBTCLIFTLPTokenSharePool, "Withdrawn")
                     .withArgs(addr1.address, amountToStake);
            });

            it('should not allow withdrawing staked lpt on behalf of a staker during lockout', async () => {
                const amountToStake = ETH.mul(10);

                await lfBTCToken.mint(operator.address, amountToStake);
                await lfBTCToken.approve(uniswapRouter.address, amountToStake);

                await liftToken.mint(operator.address, amountToStake);
                await liftToken.approve(uniswapRouter.address, amountToStake);

                await mockLPToken.mint(operator.address, amountToStake);
                await mockLPToken.approve(lfBTCLIFTLPTokenSharePool.address, amountToStake);

                await lfBTCLIFTLPTokenSharePool.stakeLP(addr1.address, operator.address, amountToStake, 1);

                await expect(lfBTCLIFTLPTokenSharePool.connect(addr1).withdraw(amountToStake))
                    .to.be.revertedWith(
                        "VM Exception while processing transaction: revert lfBTCLiftLPTokenSharePool: still in lockout period"
                    );
            });

            it('should return daysElapsed since staking', async () => {
                const amountToStake = ETH.mul(10);

                await lfBTCToken.mint(operator.address, amountToStake);
                await lfBTCToken.approve(uniswapRouter.address, amountToStake);

                await liftToken.mint(operator.address, amountToStake);
                await liftToken.approve(uniswapRouter.address, amountToStake);

                await mockLPToken.mint(operator.address, amountToStake);
                await mockLPToken.approve(lfBTCLIFTLPTokenSharePool.address, amountToStake);

                await lfBTCLIFTLPTokenSharePool.stakeLP(addr1.address, operator.address, amountToStake, 2);

                const daysToWait = 7;
                await advanceTimeAndBlock(
                    provider,
                    BigNumber.from(DAY * daysToWait).toNumber()
                  );
                
                const daysElapsed = await lfBTCLIFTLPTokenSharePool.connect(addr1).daysElapsed();
                expect(daysElapsed).to.be.eq(daysToWait);
            });

            it('should allow withdrawing staked lpt on behalf of a staker after lockoutPeriod has passed', async () => {
                const amountToStake = ETH.mul(10);

                await lfBTCToken.mint(operator.address, amountToStake);
                await lfBTCToken.approve(uniswapRouter.address, amountToStake);

                await liftToken.mint(operator.address, amountToStake);
                await liftToken.approve(uniswapRouter.address, amountToStake);

                await mockLPToken.mint(operator.address, amountToStake);
                await mockLPToken.approve(lfBTCLIFTLPTokenSharePool.address, amountToStake);

                await lfBTCLIFTLPTokenSharePool.stakeLP(addr1.address, operator.address, amountToStake, true);

                await advanceTimeAndBlock(
                    provider,
                    BigNumber.from(DAY * lockoutPeriod).toNumber()
                  );

                await expect(lfBTCLIFTLPTokenSharePool.connect(addr1).withdraw(amountToStake))
                    .to.emit(lfBTCLIFTLPTokenSharePool, "Withdrawn")
                    .withArgs(addr1.address, amountToStake);
            });
        });
    });
});