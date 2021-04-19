import chai, { expect } from 'chai';
import { ethers } from 'hardhat';
import { solidity } from 'ethereum-waffle';
import { Contract, ContractFactory, BigNumber, utils } from 'ethers';
//import UniswapV2Factory from '@sushiswap/sdk/'
import UniswapV2Factory from '@uniswap/v2-core/build/UniswapV2Factory.json';
import UniswapV2Router from '@uniswap/v2-periphery/build/UniswapV2Router02.json';
import { Provider } from '@ethersproject/providers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';

chai.use(solidity);

const GENESIS_START_DATE = 1618074000;

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

describe('GenesisVault', () => {
    const { provider } = ethers;
    const startTime = 0;
    const period = 0;

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
    let genesisVaultFactory: ContractFactory;

    let lfBTCToken: Contract;
    let liftToken: Contract;
    let ctrlToken: Contract;
    let haifToken: Contract;
    let lfBTCLIFTLPTokenSharePool: Contract;
    let lpToken: string;

    let mockLPToken: Contract;
    let mockwBTCToken: Contract;
    let mockLinkOracle: Contract;

    let hedgeFund: Contract;
    let boardroom: Contract;
    let oracle: Contract;
    let ideaFund: Contract;
    let genesisVault: Contract;

    let uniswapFactory: Contract;
    let uniswapRouter: Contract;

    let operator: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;
    let addr3: SignerWithAddress;

    before(async () => {
        [operator, addr1, addr2, addr3] = await ethers.getSigners();

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

        genesisVaultFactory = await ethers.getContractFactory('GenesisVault');
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

        lpToken = await oracle.pairFor(uniswapFactory.address, lfBTCToken.address, liftToken.address);

        lfBTCLIFTLPTokenSharePool = await lfBTCLIFTLPTokenSharePoolFactory.deploy(
            boardroom.address,
            liftToken.address,
            lpToken,
            startTime
        );

        genesisVault = await genesisVaultFactory.deploy(
            oracle.address,
            lfBTCToken.address,
            liftToken.address,
            mockwBTCToken.address,
            lfBTCLIFTLPTokenSharePool.address,
            uniswapRouter.address,
            ideaFund.address,
            GENESIS_START_DATE
        );
    });

    describe('Deployment', async () => {
        describe('GenesisVault', async () => {
            it('should not be terminated upon creation', async () => {
                expect(await genesisVault.terminated()).to.be.false;
            });

            it('should not be generated upon creation', async () => {
                expect(await genesisVault.generated()).to.be.false;
            });

            it('should have zero supply upon creation', async () => {
                expect(await genesisVault.totalSupply()).to.be.eq(0);
            });

            it('should have zero balance for owner upon creation', async () => {
                expect(await genesisVault.balanceOf(operator.address)).to.be.eq(0);
            });

            it('should stake correctly', async () => {
                const amountToStake = ETH.mul(1000);

                await mockwBTCToken.mint(addr1.address, amountToStake);
                await mockwBTCToken.connect(addr1).approve(genesisVault.address, amountToStake);

                await genesisVault.connect(addr1).stake(amountToStake, 1);

                expect(await genesisVault.totalSupply(), "totalSupply should have increased by amountToStake").to.be.eq(amountToStake);
                expect(await genesisVault.balanceOf(addr1.address), "staker should have balance of amountToStake").to.be.eq(amountToStake);
            });

            it('should getStakingTokenPrice', async () => {
                const kwTCAmountToMint = ETH.mul(20);

                await mockwBTCToken.connect(operator).mint(operator.address, kwTCAmountToMint);
                await mockwBTCToken.connect(operator).approve(uniswapRouter.address, kwTCAmountToMint);

                expect(await genesisVault.connect(operator).getStakingTokenPrice()).to.not.be.eq(0);
            });

            it('Can do genesis', async () => {
                const amountToStake = BigNumber.from(2221500000);

                await mockwBTCToken.mint(addr2.address, amountToStake.div(2));
                await mockwBTCToken.connect(addr2).approve(genesisVault.address, amountToStake.div(2));
                await genesisVault.connect(addr2).stake(amountToStake.div(2), 1);

                await mockwBTCToken.mint(addr3.address, amountToStake.div(5));
                await mockwBTCToken.connect(addr3).approve(genesisVault.address, amountToStake.div(5));
                await genesisVault.connect(addr3).stake(amountToStake.div(5), 3);

                await mockwBTCToken.mint(addr1.address, amountToStake);
                await mockwBTCToken.connect(addr1).approve(genesisVault.address, amountToStake);
                await genesisVault.connect(addr1).stake(amountToStake, 4);

                await lfBTCToken.connect(operator).transferOperator(genesisVault.address);
                await liftToken.connect(operator).transferOperator(genesisVault.address);
                
                await genesisVault.beginGenesis();
            });
        });
    });
});