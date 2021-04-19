import chai, { expect } from 'chai';
import { ethers } from 'hardhat';
import { solidity } from 'ethereum-waffle';
import { Contract, ContractFactory, BigNumber, utils } from 'ethers';
import UniswapV2Factory from '@uniswap/v2-core/build/UniswapV2Factory.json';
import UniswapV2Router from '@uniswap/v2-periphery/build/UniswapV2Router02.json';
import { Provider } from '@ethersproject/providers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';

chai.use(solidity);

const ZERO_ADDR = '0x0000000000000000000000000000000000000000';
const ETH = utils.parseEther('1');

async function latestBlockNumber(provider: Provider): Promise<number> {
    const { number } = await provider.getBlock('latest');
    return await provider.getBlockNumber();
}

async function latestBlocktime(provider: Provider): Promise<number> {
    const { timestamp, number } = await provider.getBlock('latest');
    return timestamp;
}

describe('Treasury', () => {
    const { provider } = ethers;
    const period = 0;
    const startTime = 0;

    let lfBTCTokenFactory: ContractFactory;
    let liftTokenFactory: ContractFactory;
    let ctrlTokenFactory: ContractFactory;
    let haifTokenFactory: ContractFactory;

    let mockwBTCTokenFactory: ContractFactory;
    let mockLinkOracleFactory: ContractFactory;

    let uniswapFactoryFactory: ContractFactory;
    let uniswapRouterFactory: ContractFactory;

    let hedgeFundFactory: ContractFactory;
    let ideaFundFactory: ContractFactory;
    let mockOracleFactory: ContractFactory;
    let boardroomFactory: ContractFactory;
    let devFundFactory: ContractFactory;

    let treasuryFactory: ContractFactory;

    let lfBTCToken: Contract;
    let liftToken: Contract;
    let ctrlToken: Contract;
    let haifToken: Contract;

    let mockwBTCToken: Contract;
    let mockLinkOracle: Contract;

    let hedgeFund: Contract;
    let boardroom: Contract;
    let mockOracle: Contract;
    let ideaFund: Contract;
    let devFund: Contract;

    let uniswapFactory: Contract;
    let uniswapRouter: Contract;
    
    let treasury: Contract;

    let operator: SignerWithAddress;
    let addr1: SignerWithAddress;

    before(async () => {
        [operator, addr1] = await ethers.getSigners();
        
        lfBTCTokenFactory = await ethers.getContractFactory('LFBTC');
        liftTokenFactory = await ethers.getContractFactory('LIFT');
        ctrlTokenFactory = await ethers.getContractFactory('CTRL');
        haifTokenFactory = await ethers.getContractFactory('HAIF');

        mockwBTCTokenFactory = await ethers.getContractFactory('MockwBTC');
        mockLinkOracleFactory = await ethers.getContractFactory('MockLinkOracle');

        hedgeFundFactory = await ethers.getContractFactory('HedgeFund');
        ideaFundFactory = await ethers.getContractFactory('IdeaFund');
        mockOracleFactory = await ethers.getContractFactory('MockOracle');
        boardroomFactory = await ethers.getContractFactory('Boardroom');
        devFundFactory = await ethers.getContractFactory('DevFund');

        uniswapFactoryFactory = new ContractFactory (
            UniswapV2Factory.abi,
            UniswapV2Factory.bytecode
        );

        uniswapRouterFactory = new ContractFactory (
            UniswapV2Router.abi,
            UniswapV2Router.bytecode
        );

        treasuryFactory = await ethers.getContractFactory('Treasury');
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
        ctrlToken = await ctrlTokenFactory.deploy();
        liftToken = await liftTokenFactory.deploy();
        haifToken = await haifTokenFactory.deploy();

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

        mockOracle = await mockOracleFactory.deploy(
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

        hedgeFund.updateOracle(mockOracle.address);
        ideaFund.updateOracle(mockOracle.address);

        boardroom = await boardroomFactory.deploy(
            liftToken.address,
            ctrlToken.address,
            ideaFund.address,
            mockOracle.address
        );

        devFund = await devFundFactory.deploy();

        treasury = await treasuryFactory.deploy(
            lfBTCToken.address,
            liftToken.address,
            ctrlToken.address,
            mockOracle.address,
            boardroom.address,
            ideaFund.address,
            devFund.address,
            startTime
        );
    });

    describe('Deployment', async () => {
        describe('Treasury', async () => {
            it('should allow setting the ideaFund', async () => {
                await expect(treasury.setIdeaFund(ZERO_ADDR))
                    .to.emit(treasury, "IdeaFundChanged")
                    .withArgs(operator.address, ZERO_ADDR);

                expect(await treasury.ideafund()).to.be.eq(ZERO_ADDR);
            });

            it('should allow setting the devFund', async () => {
                await expect(treasury.setDevFund(ZERO_ADDR))
                    .to.emit(treasury, "DevFundChanged")
                    .withArgs(operator.address, ZERO_ADDR);

                expect(await treasury.devfund()).to.be.eq(ZERO_ADDR);
            });

            it('should allow setting the boardroom', async () => {
                await expect(treasury.setBoardroom(ZERO_ADDR))
                    .to.emit(treasury, "BoardroomChanged")
                    .withArgs(operator.address, ZERO_ADDR);

                expect(await treasury.boardroom()).to.be.eq(ZERO_ADDR);
            });

            it('should allow setting the ideafund allocation Rate', async () => {
                const currentAllocationRate = await treasury.ideafundAllocationRate();
                const newAllocationRate = currentAllocationRate + 1;

                await expect(treasury.setIdeaFundAllocationRate(newAllocationRate))
                    .to.emit(treasury, "IdeaFundRateChanged")
                    .withArgs(operator.address, newAllocationRate);

                expect(await treasury.ideafundAllocationRate()).to.be.eq(newAllocationRate);
            });

            it('should allow setting the devfund allocation Rate', async () => {
                const currentAllocationRate = await treasury.devfundAllocationRate();
                const newAllocationRate = currentAllocationRate + 1;

                await expect(treasury.setDevFundAllocationRate(newAllocationRate))
                    .to.emit(treasury, "DevFundRateChanged")
                    .withArgs(operator.address, newAllocationRate);

                expect(await treasury.devfundAllocationRate()).to.be.eq(newAllocationRate);
            });

            it('should NOT expand when peg <= price ceiling', async () => {
                const price = await mockOracle.priceOf(lfBTCToken.address);
                mockOracle.setPrice(price);

                await lfBTCToken.mint(treasury.address, ETH.mul(25));
                await mockwBTCToken.mint(ideaFund.address, ETH.mul(33));
                await ctrlToken.mint(treasury.address, ETH.mul(6));

                const amountToStake = ETH.mul(10);

                await liftToken.mint(addr1.address, amountToStake.mul(4000));
                await ctrlToken.mint(addr1.address, amountToStake.mul(2));

                await liftToken.connect(addr1).approve(boardroom.address, amountToStake.mul(4000));
                await ctrlToken.connect(addr1).approve(boardroom.address, amountToStake.mul(2));
                await boardroom.connect(addr1).stakeShare(amountToStake.mul(4000));
                await boardroom.connect(addr1).stakeControl(amountToStake.mul(2));

                await lfBTCToken.transferOperator(treasury.address);
                await liftToken.transferOperator(treasury.address);
                await ctrlToken.transferOperator(treasury.address);
                await boardroom.transferOperator(treasury.address);

                await mockOracle.setPrice(ETH.mul(56000));

                await expect(treasury.allocateSeigniorage())
                    .to.not.emit(treasury, "DevFundFunded")
                    .to.not.emit(treasury, "IdeaFundFunded")
                    .to.not.emit(treasury, "BoardroomFunded");
            });

            it('should allow expansion when peg > price ceiling', async () => {
                const price = await mockOracle.priceOf(lfBTCToken.address);
                mockOracle.setPrice(price);

                await lfBTCToken.mint(treasury.address, ETH.mul(25));
                await mockwBTCToken.mint(ideaFund.address, ETH.mul(33));
                await ctrlToken.mint(treasury.address, ETH.mul(6));

                const amountToStake = ETH.mul(10);

                await liftToken.mint(addr1.address, amountToStake.mul(4000));
                await ctrlToken.mint(addr1.address, amountToStake.mul(2));

                await liftToken.connect(addr1).approve(boardroom.address, amountToStake.mul(4000));
                await ctrlToken.connect(addr1).approve(boardroom.address, amountToStake.mul(2));
                await boardroom.connect(addr1).stakeShare(amountToStake.mul(4000));
                await boardroom.connect(addr1).stakeControl(amountToStake.mul(2));

                await lfBTCToken.transferOperator(treasury.address);
                await liftToken.transferOperator(treasury.address);
                await ctrlToken.transferOperator(treasury.address);
                await boardroom.transferOperator(treasury.address);

                await expect(treasury.allocateSeigniorage())
                    .to.emit(treasury, "DevFundFunded")
                    .to.emit(treasury, "IdeaFundFunded")
                    .to.emit(treasury, "BoardroomFunded");
            });
        });
    });
});