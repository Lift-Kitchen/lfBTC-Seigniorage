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

describe('IdeaFund', () => {
    const { provider } = ethers;
    const period = 0;
    const startTime = 1618018953;

    let lfBTCTokenFactory: ContractFactory;
    let liftTokenFactory: ContractFactory;
    let ctrlTokenFactory: ContractFactory;
    let haifTokenFactory: ContractFactory;
    let lfBTCLIFTLPTokenSharePoolFactory: ContractFactory;
    let wBTClfBTCLPTokenSharePoolFactory: ContractFactory;

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
    let lfBTCLIFTLPTokenSharePool: Contract;
    let wBTClfBTCLPTokenSharePool: Contract;

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
        lfBTCLIFTLPTokenSharePoolFactory = await ethers.getContractFactory('lfBTCLIFTLPTokenSharePool');
        wBTClfBTCLPTokenSharePoolFactory = await ethers.getContractFactory('wBTClfBTCLPTokenSharePool');

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

        lfBTCLIFTLPTokenSharePool = await lfBTCLIFTLPTokenSharePoolFactory.deploy(
            boardroom.address,
            liftToken.address,
            mockOracle.pairFor(uniswapFactory.address, lfBTCToken.address, liftToken.address),
            startTime
        );

        wBTClfBTCLPTokenSharePool = await wBTClfBTCLPTokenSharePoolFactory.deploy(
            boardroom.address,
            liftToken.address,
            mockOracle.pairFor(uniswapFactory.address, mockwBTCToken.address, lfBTCToken.address),
            startTime
        );

        hedgeFund.setLPPoolValues(wBTClfBTCLPTokenSharePool.address, lfBTCLIFTLPTokenSharePool.address)

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

        ideaFund.updateAddresses(treasury.address, hedgeFund.address);
    });

    describe('Deployment', async () => {
        describe('IdeaFund', async () => {
            it('should have zero supply upon creation', async () => {
                expect(await haifToken.balanceOf(ideaFund.address)).to.be.eq(0);
            });

            it('should not allow buying control when not redeemable', async () => {
                await expect(ideaFund.connect(addr1).buyCTRL(lfBTCToken.address, 100))
                    .to.be.revertedWith(
                        "VM Exception while processing transaction: revert Idea Fund: cannot currently redeem CTRL"
                    );
            });

            it('should not allow buying 0 control', async () => {
                await ideaFund.setRedemptions(treasury.address, true);
                
                await expect(ideaFund.connect(addr1).buyCTRL(lfBTCToken.address, 0))
                    .to.be.revertedWith(
                        "VM Exception while processing transaction: revert Idea Fund: cannot sell you zero ctrl"
                    );
            });

            it('should not allow buying control without enough allowance', async () => {
                await ideaFund.setRedemptions(treasury.address, true);
                
                await expect(ideaFund.connect(addr1).buyCTRL(lfBTCToken.address, 100))
                    .to.be.revertedWith(
                        "VM Exception while processing transaction: revert Idea Fund: You have not approved the transfer of your token to Idea Fund"
                    );
            });

            it('should not allow buying control with tokens other than lfbtc or lift', async () => {
                const amountToFund = ETH.mul(10);
                
                await ideaFund.setRedemptions(treasury.address, true);
                
                await haifToken.mint(addr1.address, amountToFund);
                await haifToken.connect(addr1).approve(ideaFund.address, amountToFund);

                await expect(ideaFund.connect(addr1).buyCTRL(haifToken.address, amountToFund))
                    .to.be.revertedWith(
                        "VM Exception while processing transaction: revert Idea Fund: We only buy the protocol peg token and share token"
                    );
            });

            it('should not allow buying more control than ideafund has', async () => {
                const amountToFund = ETH.mul(10);
                
                await ideaFund.setRedemptions(treasury.address, true);
                
                await lfBTCToken.mint(addr1.address, amountToFund);
                await lfBTCToken.connect(addr1).approve(ideaFund.address, amountToFund);

                await expect(ideaFund.connect(addr1).buyCTRL(lfBTCToken.address, amountToFund))
                    .to.be.revertedWith(
                        "VM Exception while processing transaction: revert Idea Fund: Sorry we dont have enough control token to cover this"
                    );
            });

            it('should allow buying control with lfbtc', async () => {
                const tokenAmount = 10;
                const amountToFund = ETH.mul(tokenAmount);
                
                await ideaFund.setRedemptions(treasury.address, true);
                
                await lfBTCToken.mint(addr1.address, amountToFund);
                await lfBTCToken.connect(addr1).approve(ideaFund.address, amountToFund);

                const pegPrice = await mockOracle.priceOf(lfBTCToken.address);
                const ctrlPrice = await mockOracle.priceOf(ctrlToken.address);

                const totalInvestment = tokenAmount * pegPrice;
                const controlNeeded = Math.ceil(totalInvestment / ctrlPrice);

                await ctrlToken.mint(ideaFund.address, ETH.mul(controlNeeded));
                await ctrlToken.transferOperator(treasury.address);

                await expect(ideaFund.connect(addr1).buyCTRL(lfBTCToken.address, amountToFund))
                    .to.emit(ideaFund, "SoldCTRL");
            });

            it('should allow buying control with lift', async () => {
                const tokenAmount = 10;
                const amountToFund = ETH.mul(tokenAmount);
                
                await ideaFund.setRedemptions(treasury.address, true);
                
                await liftToken.mint(addr1.address, amountToFund);
                await liftToken.connect(addr1).approve(ideaFund.address, amountToFund);

                const sharePrice = await mockOracle.priceOf(liftToken.address);
                const ctrlPrice = await mockOracle.priceOf(ctrlToken.address);

                const totalInvestment = tokenAmount * sharePrice;
                const controlNeeded = Math.ceil(totalInvestment / ctrlPrice);

                await ctrlToken.mint(ideaFund.address, ETH.mul(controlNeeded));
                await ctrlToken.transferOperator(treasury.address);

                await expect(ideaFund.connect(addr1).buyCTRL(liftToken.address, amountToFund))
                    .to.emit(ideaFund, "SoldCTRL");
            });

            it('should allow ideafund to invest in hedge fund', async () => {
                const amountToInvest = ETH.mul(10);
                
                await ideaFund.setRedemptions(treasury.address, true);
                
                await lfBTCToken.mint(ideaFund.address, amountToInvest.mul(2));
                await haifToken.transferOperator(hedgeFund.address);

                await expect(ideaFund.investInHedgeFund(lfBTCToken.address, amountToInvest))
                    .to.emit(hedgeFund, "DepositIntoHedgeFund")
                    .withArgs(ideaFund.address, amountToInvest);

                expect(await lfBTCToken.balanceOf(ideaFund.address)).to.be.eq(amountToInvest);

                expect(await haifToken.balanceOf(hedgeFund.address)).to.be.eq(0);

                expect(await lfBTCToken.balanceOf(hedgeFund.address)).to.be.eq(amountToInvest);
           
                expect(await haifToken.balanceOf(ideaFund.address)).to.be.gt(0);
            });

            it('should not allow redeeming control with 0 amount', async () => {
                await ideaFund.setRedemptions(treasury.address, true);

                await expect(ideaFund.connect(addr1).redeemCTRL(0))
                    .to.be.revertedWith(
                        "VM Exception while processing transaction: revert Idea Fund: cannot redeem CTRL with zero amount"
                    );
            });

            it('should not allow redeeming control when when supply is 0', async () => {
                await ideaFund.setRedemptions(treasury.address, true);
                
                await expect(ideaFund.connect(addr1).redeemCTRL(1))
                    .to.be.revertedWith(
                        "VM Exception while processing transaction: revert Idea Fund: cannot redeem CTRL when supply is 0"
                    );
            });

            it('should not allow redeeming control when treasury has no wbtc', async () => {
                await ideaFund.setRedemptions(treasury.address, true);

                await ctrlToken.mint(ideaFund.address, ETH.mul(1));
                
                await expect(ideaFund.connect(addr1).redeemCTRL(1))
                    .to.be.revertedWith(
                        "VM Exception while processing transaction: revert Idea Fund: Treasury does not currently hold any wBTC"
                    );
            });

            // it('should not allow redeeming control when treasury lacks enough funds', async () => {
            //     const tokenAmount = 1;
            //     const amountToFund = ETH.mul(tokenAmount).div(2);

            //     await ctrlToken.mint(ideaFund.address, amountToFund);
            //     await mockwBTCToken.mint(ideaFund.address, 50);

            //     await ideaFund.setRedemptions(treasury.address, true);

            //     await ideaFund.connect(addr1).redeemCTRL(amountToFund);
            // });

            it('should not allow redeeming control when treasury lacks approval to burn funds', async () => {
                const tokenAmount = 1;
                const amountToFund = ETH.mul(tokenAmount).div(2);

                await ctrlToken.mint(ideaFund.address, amountToFund);
                await mockwBTCToken.mint(ideaFund.address, 50);

                await ideaFund.setRedemptions(treasury.address, true);

                await expect(ideaFund.connect(addr1).redeemCTRL(1))
                    .to.be.revertedWith(
                        "VM Exception while processing transaction: revert Treasury: is not approved to burn your CTRL"
                    );
            });

            it('should not allow redeeming control amount greater than owned', async () => {
                const tokenAmount = 10;
                const amountToFund = ETH.mul(tokenAmount);

                await mockwBTCToken.mint(ideaFund.address, 50);
              
                await lfBTCToken.mint(addr1.address, amountToFund);
                await lfBTCToken.connect(addr1).approve(ideaFund.address, amountToFund);

                const pegPrice = await mockOracle.priceOf(lfBTCToken.address);
                const ctrlPrice = await mockOracle.priceOf(ctrlToken.address);

                const totalInvestment = tokenAmount * pegPrice;
                const controlNeeded = Math.ceil(totalInvestment / ctrlPrice);

                await ctrlToken.mint(ideaFund.address, ETH.mul(controlNeeded));
                await ctrlToken.transferOperator(treasury.address);

                await ideaFund.setRedemptions(treasury.address, true);

                await ideaFund.connect(addr1).buyCTRL(lfBTCToken.address, amountToFund);
                let ctrlPurchased : BigNumber;
                ctrlPurchased = await ctrlToken.balanceOf(addr1.address);
                ctrlPurchased = ctrlPurchased.mul(2);

                await ctrlToken.connect(addr1).approve(treasury.address, ctrlPurchased);
                await expect(ideaFund.connect(addr1).redeemCTRL(ctrlPurchased))
                    .to.be.revertedWith(
                        "VM Exception while processing transaction: revert ERC20: burn amount exceeds balance"
                    );
            });

            it('should allow redeeming control', async () => {
                const tokenAmount = 10;
                const amountToFund = ETH.mul(tokenAmount);

                await mockwBTCToken.mint(ideaFund.address, 50);
              
                await lfBTCToken.mint(addr1.address, amountToFund);
                await lfBTCToken.connect(addr1).approve(ideaFund.address, amountToFund);

                const pegPrice = await mockOracle.priceOf(lfBTCToken.address);
                const ctrlPrice = await mockOracle.priceOf(ctrlToken.address);

                const totalInvestment = tokenAmount * pegPrice;
                const controlNeeded = Math.ceil(totalInvestment / ctrlPrice);

                await ctrlToken.mint(ideaFund.address, ETH.mul(controlNeeded));
                await ctrlToken.transferOperator(treasury.address);

                await ideaFund.setRedemptions(treasury.address, true);

                await ideaFund.connect(addr1).buyCTRL(lfBTCToken.address, amountToFund);
                const ctrlPurchased = await ctrlToken.balanceOf(addr1.address);

                await ctrlToken.connect(addr1).approve(treasury.address, ctrlPurchased);
                await ideaFund.connect(addr1).redeemCTRL(ctrlPurchased);
            });
        });
    });
});