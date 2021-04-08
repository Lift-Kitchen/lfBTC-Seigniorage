import chai, { expect } from 'chai';
import { ethers } from 'hardhat';
import { solidity } from 'ethereum-waffle';
import { Contract, ContractFactory, BigNumber, utils } from 'ethers';
import UniswapV2Factory from '@uniswap/v2-core/build/UniswapV2Factory.json';
import UniswapV2Router from '@uniswap/v2-periphery/build/UniswapV2Router02.json';
import { Provider } from '@ethersproject/providers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { formatEther } from '@ethersproject/units';

chai.use(solidity);

const ZERO_ADDR = '0x0000000000000000000000000000000000000000';
const ETH = utils.parseEther('1');

async function latestBlocktime(provider: Provider): Promise<number> {
    const { timestamp, number } = await provider.getBlock('latest');
    return timestamp;
}

describe('Boardroom', () => {
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

    let uniswapFactory: Contract;
    let uniswapRouter: Contract;

    let operator: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;

    before(async () => {
        [operator, addr1, addr2] = await ethers.getSigners();

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
            mockLinkOracle.address,
            period,
            startTime
        );

        boardroom = await boardroomFactory.deploy(
            liftToken.address,
            ctrlToken.address,
            ideaFund.address,
            mockOracle.address
        );
    });

    describe('Deployment', async () => {
        describe('BoardRoom', async () => {
          
            it('should start with no supply', async () => {
                expect(await boardroom.gettotalSupplyShare()).to.be.eq(0);
                expect(await boardroom.gettotalSupplyControl()).to.be.eq(0);
            });

            it('should start with no rewards', async () => {
                expect(await boardroom.rewardPerShare()).to.be.eq(0);
                expect(await boardroom.rewardPerControl()).to.be.eq(0);
            });

            it('should have zero balance of share for non staker', async () => {
                expect(await boardroom.getbalanceOfShare(addr1.address)).to.be.eq(0);
            });

            it('should have zero balance of control for non staker', async () => {
                expect(await boardroom.getbalanceOfControl(addr1.address)).to.be.eq(0);
            });

            it('should not allow staking 0 share', async () => {
                await expect(boardroom.stakeShare(0))
                .to.be.revertedWith(
                    "VM Exception while processing transaction: revert Boardroom: Cannot stake 0"
                );
            });

            it('should not allow staking 0 control', async () => {
                await expect(boardroom.stakeControl(0))
                .to.be.revertedWith(
                    "VM Exception while processing transaction: revert Boardroom: Cannot stake 0"
                );
            });

            it('should allow staking share and not change balance of ctrl', async () => {
                const amountToStake = ETH.mul(10);

                await liftToken.mint(addr1.address, amountToStake);

                await liftToken.connect(addr1).approve(boardroom.address, amountToStake);
                await expect(boardroom.connect(addr1).stakeShare(amountToStake))
                    .to.emit(boardroom, "Staked")
                    .withArgs(addr1.address, amountToStake);

                expect(await boardroom.gettotalSupplyShare()).to.be.eq(amountToStake);
                expect(await boardroom.gettotalSupplyControl()).to.be.eq(0);

                expect(await boardroom.getbalanceOfShare(addr1.address)).to.be.eq(amountToStake);
            });

            it('should allow staking ctrl and not change balance of share', async () => {
                const amountToStake = ETH.mul(10);

                await ctrlToken.mint(addr1.address, amountToStake);

                await ctrlToken.connect(addr1).approve(boardroom.address, amountToStake);
                await expect(boardroom.connect(addr1).stakeControl(amountToStake))
                    .to.emit(boardroom, "Staked")
                    .withArgs(addr1.address, amountToStake);

                expect(await boardroom.gettotalSupplyControl()).to.be.eq(amountToStake);
                expect(await boardroom.gettotalSupplyShare()).to.be.eq(0);

                expect(await boardroom.getbalanceOfControl(addr1.address)).to.be.eq(amountToStake);
            });

            it('should properly track staked share', async () => {
                const amountToStake = ETH.mul(10);

                await liftToken.mint(operator.address, amountToStake.mul(3));
                await liftToken.mint(addr1.address, amountToStake);

                await liftToken.connect(operator).approve(boardroom.address, amountToStake.mul(3));
                await boardroom.connect(operator).stakeShare(amountToStake.mul(3));

                await liftToken.connect(addr1).approve(boardroom.address, amountToStake);
                await boardroom.connect(addr1).stakeShare(amountToStake);

                expect(await boardroom.gettotalSupplyShare()).to.be.eq(amountToStake.mul(4));
                expect(await boardroom.gettotalSupplyControl()).to.be.eq(0);

                expect(await boardroom.getbalanceOfShare(operator.address)).to.be.eq(amountToStake.mul(3));
                expect(await boardroom.getbalanceOfShare(addr1.address)).to.be.eq(amountToStake);
            });

            it('should properly track staked ctrl', async () => {
                const amountToStake = ETH.mul(10);

                await ctrlToken.mint(operator.address, amountToStake.mul(3));
                await ctrlToken.mint(addr1.address, amountToStake);

                await ctrlToken.connect(operator).approve(boardroom.address, amountToStake.mul(3));
                await boardroom.connect(operator).stakeControl(amountToStake.mul(3));

                await ctrlToken.connect(addr1).approve(boardroom.address, amountToStake);
                await boardroom.connect(addr1).stakeControl(amountToStake);

                expect(await boardroom.gettotalSupplyControl()).to.be.eq(amountToStake.mul(4));
                expect(await boardroom.gettotalSupplyShare()).to.be.eq(0);

                expect(await boardroom.getbalanceOfControl(operator.address)).to.be.eq(amountToStake.mul(3));
                expect(await boardroom.getbalanceOfControl(addr1.address)).to.be.eq(amountToStake);
            });

            it('should allow staking share for third party', async () => {
                const amountToStake = ETH.mul(10);

                await liftToken.mint(addr1.address, amountToStake);

                await liftToken.connect(addr1).approve(boardroom.address, amountToStake);
                await boardroom.connect(addr2).stakeShareForThirdParty(addr2.address, addr1.address, amountToStake);

                expect(await boardroom.gettotalSupplyShare()).to.be.eq(amountToStake);
                expect(await boardroom.getbalanceOfShare(addr2.address)).to.be.eq(amountToStake);
                expect(await boardroom.getbalanceOfShare(addr1.address)).to.be.eq(0);
                expect(await liftToken.balanceOf(addr1.address)).to.be.eq(0);
            });

            it('should allow staking ctrl for third party', async () => {
                const amountToStake = ETH.mul(10);

                await ctrlToken.mint(addr1.address, amountToStake);

                await ctrlToken.connect(addr1).approve(boardroom.address, amountToStake);
                await boardroom.connect(addr2).stakeControlForThirdParty(addr2.address, addr1.address, amountToStake);

                expect(await boardroom.gettotalSupplyControl()).to.be.eq(amountToStake);
                expect(await boardroom.getbalanceOfControl(addr2.address)).to.be.eq(amountToStake);
                expect(await boardroom.getbalanceOfControl(addr1.address)).to.be.eq(0);
                expect(await ctrlToken.balanceOf(addr1.address)).to.be.eq(0);
            });

            it('should not allow withdraw of share from non staker', async () => {
                await expect(boardroom.connect(addr1).withdrawShare(0))
                    .to.be.revertedWith(
                    "VM Exception while processing transaction: revert Boardroom: The director does not exist"
                );
            });

            it('should not allow withdraw of ctrl from non staker', async () => {
                await expect(boardroom.connect(addr1).withdrawControl(0))
                    .to.be.revertedWith(
                    "VM Exception while processing transaction: revert Boardroom: The director does not exist"
                );
            });

            it('should allow withdraw of staked share', async () => {
                const amountToStake = ETH.mul(10);

                await liftToken.mint(addr1.address, amountToStake);

                await liftToken.connect(addr1).approve(boardroom.address, amountToStake);
                await boardroom.connect(addr1).stakeShare(amountToStake);


                let stakingSeatShares = await boardroom.connect(addr1).getStakedAmountsShare();
                for (var stakingSeatShare of stakingSeatShares) {
                    await expect(boardroom.connect(addr1).withdrawShare(stakingSeatShare[1]))
                        .to.emit(boardroom, "WithdrawnWithReductionShare");
                    expect(await liftToken.balanceOf(addr1.address)).to.be.gt(0); //may have payout penalty

                    //TODO: Would be good to be able to validate the reduction math here as well
                    //await latestBlocktime(provider)
                }

                stakingSeatShares = await boardroom.connect(addr1).getStakedAmountsShare();
                for (var stakingSeatShare of stakingSeatShares) {
                    expect(stakingSeatShare[0], 'Snapshot should be zeroed out').to.be.eq(0);
                    expect(stakingSeatShare[1], 'Snapshot should be zeroed out').to.be.eq(0);
                }
            });

            it('should allow withdraw of staked ctrl', async () => {
                const amountToStake = ETH.mul(10);
                const amountToWithdraw = ETH.mul(3);

                await ctrlToken.mint(addr1.address, amountToStake);

                await ctrlToken.connect(addr1).approve(boardroom.address, amountToStake);
                await boardroom.connect(addr1).stakeControl(amountToStake);

                await boardroom.connect(addr1).withdrawControl(amountToWithdraw);

                expect(await boardroom.getbalanceOfControl(addr1.address)).to.be.eq(amountToStake.sub(amountToWithdraw));
                expect(await boardroom.gettotalSupplyControl()).to.be.eq(amountToStake.sub(amountToWithdraw));
                expect(await ctrlToken.balanceOf(addr1.address)).to.be.eq(amountToWithdraw);
            });

            it('should not allow allocation of Seigniorage with zero amount', async () => {
                await expect(boardroom.allocateSeigniorage(0))
                    .to.not.emit(boardroom, "RewardAdded")
            });

            it('should not allow allocation of Seigniorage when no supply', async () => {
                const amountToAllocate = ETH;

                await expect(boardroom.allocateSeigniorage(0))
                    .to.not.emit(boardroom, "RewardAdded")
            });

            it('should not allow allocation of Seigniorage greater than operator control balance', async () => {
                const amountToStake = ETH.mul(10);
                const amountToAllocate = ETH;

                await ctrlToken.mint(addr1.address, amountToStake.mul(2));

                await ctrlToken.connect(addr1).approve(boardroom.address, amountToStake);
                await boardroom.connect(addr1).stakeControl(amountToStake);

                await ctrlToken.mint(operator.address, amountToAllocate);
                await ctrlToken.connect(operator).approve(boardroom.address, amountToAllocate);

                await expect(boardroom.allocateSeigniorage(amountToAllocate.mul(2)))
                    .to.be.revertedWith(
                    "VM Exception while processing transaction: revert ERC20: transfer amount exceeds balance"
                );
            });

            it('should allocate Seigniorage', async () => {
                const amountToStake = ETH.mul(10);
                const amountToAllocate = ETH;

                await ctrlToken.mint(addr1.address, amountToStake.mul(2));

                await ctrlToken.connect(addr1).approve(boardroom.address, amountToStake);
                await boardroom.connect(addr1).stakeControl(amountToStake);

                await ctrlToken.mint(operator.address, amountToAllocate.mul(2));
                await ctrlToken.connect(operator).approve(boardroom.address, amountToAllocate);

                await mockOracle.initialize();
                await expect(boardroom.allocateSeigniorage(amountToAllocate))
                    .to.emit(boardroom, "RewardAdded")
                    .withArgs(operator.address, amountToAllocate);
            });

            it('should earn rewards when staking share', async () => {
                let shareAwardEarned;
                let ctrlAwardEarned;

                const amountToStake = ETH.mul(10);
                const amountToAllocate = ETH;

                await liftToken.mint(addr1.address, amountToStake.mul(2));

                await liftToken.connect(addr1).approve(boardroom.address, amountToStake);
                await boardroom.connect(addr1).stakeShare(amountToStake);

                await ctrlToken.mint(operator.address, amountToAllocate.mul(2));
                await ctrlToken.connect(operator).approve(boardroom.address, amountToAllocate);

                await mockOracle.initialize();
                await boardroom.connect(operator).allocateSeigniorage(amountToAllocate);

                [shareAwardEarned, ctrlAwardEarned] = await boardroom.earned(addr1.address);
                expect(shareAwardEarned).to.be.gt(0);
                expect(ctrlAwardEarned).to.be.eq(0);
            });

            it('should earn rewards when staking ctrl', async () => {
                let shareAwardEarned;
                let ctrlAwardEarned;

                const amountToStake = ETH.mul(10);
                const amountToAllocate = ETH;

                await ctrlToken.mint(addr1.address, amountToStake.mul(2));

                await ctrlToken.connect(addr1).approve(boardroom.address, amountToStake);
                await expect(boardroom.connect(addr1).stakeControl(amountToStake))
                    .to.emit(boardroom, "Staked")
                    .withArgs(addr1.address, amountToStake);

                await ctrlToken.mint(operator.address, amountToAllocate.mul(2));
                await ctrlToken.connect(operator).approve(boardroom.address, amountToAllocate);

                await mockOracle.initialize();
                await expect(boardroom.allocateSeigniorage(amountToAllocate))
                    .to.emit(boardroom, "RewardAdded")
                    .withArgs(operator.address, amountToAllocate);

                [shareAwardEarned, ctrlAwardEarned] = await boardroom.earned(addr1.address);
                
                //TODO: can we strengthen the test here? or maybe add another test that validates the math
                expect(shareAwardEarned).to.be.eq(0);
                expect(ctrlAwardEarned).to.be.gt(0);
            });

            it('should be able to claim rewards and leave balance staked', async () => {
                let shareAwardEarned;
                let ctrlAwardEarned;

                const amountToStake = ETH.mul(10);
                const amountToAllocate = ETH;

                await liftToken.mint(addr1.address, amountToStake.mul(2));

                await liftToken.connect(addr1).approve(boardroom.address, amountToStake);
                await boardroom.connect(addr1).stakeShare(amountToStake);

                await ctrlToken.mint(operator.address, amountToAllocate.mul(2));
                await ctrlToken.connect(operator).approve(boardroom.address, amountToAllocate);

                await mockOracle.initialize();
                await boardroom.connect(operator).allocateSeigniorage(amountToAllocate);

                [shareAwardEarned, ctrlAwardEarned] = await boardroom.earned(addr1.address);
                
                await expect(boardroom.connect(addr1).claimReward())
                    .to.emit(boardroom, "RewardPaid")
                    .withArgs(addr1.address, shareAwardEarned.add(ctrlAwardEarned));

                expect(await ctrlToken.balanceOf(addr1.address)).to.be.eq(amountToAllocate);
                expect(await boardroom.connect(addr1).getbalanceOfShare(addr1.address)).to.be.eq(amountToStake);
            });

            it('should earn rewards when double stakes', async () => {
                let shareAwardEarned;
                let ctrlAwardEarned;

                const amountToStake = ETH.mul(10);
                const amountToAllocate = ETH.mul(3);

                await liftToken.mint(addr1.address, amountToStake.mul(4000));
                await ctrlToken.mint(addr1.address, amountToStake.mul(1));

                await liftToken.connect(addr1).approve(boardroom.address, amountToStake.mul(4000));
                await ctrlToken.connect(addr1).approve(boardroom.address, amountToStake.mul(1));
                await boardroom.connect(addr1).stakeShare(amountToStake.mul(4000));
                await boardroom.connect(addr1).stakeControl(amountToStake.mul(1));

                await ctrlToken.mint(operator.address, amountToAllocate);
                await ctrlToken.connect(operator).approve(boardroom.address, amountToAllocate);

                await mockOracle.initialize();
                await boardroom.connect(operator).allocateSeigniorage(amountToAllocate);

                [shareAwardEarned, ctrlAwardEarned] = await boardroom.earned(addr1.address);
                
                await expect(boardroom.connect(addr1).claimReward())
                    .to.emit(boardroom, "RewardPaid")
                    .withArgs(addr1.address, shareAwardEarned.add(ctrlAwardEarned));
            });
        });
    });
});