import chai, { expect } from 'chai';
import { ethers } from 'hardhat';
import { solidity } from 'ethereum-waffle';
import { Contract, ContractFactory, BigNumber, utils } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';

chai.use(solidity);

const ZERO_ADDR = '0x0000000000000000000000000000000000000000';
const ETH = utils.parseEther('1');

describe('CTRL token contract', () => {
  let ctrlTokenFactory: ContractFactory;
  let operator: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let ctrlToken: Contract;

  before(async () => {
    [operator, addr1, addr2] = await ethers.getSigners();
    ctrlTokenFactory = await ethers.getContractFactory('CTRL');
  });

  beforeEach(async () => {
    ctrlToken = await ctrlTokenFactory.deploy();
  });

  describe('Deployment', async () => {

    it('Should have the correct operator', async () => {
      expect(await ctrlToken.operator()).to.be.eq(operator.address);
    });

    it('Should identify if operator is operator', async () => {
      expect(await ctrlToken.isOperator()).to.be.true;
    });

    it('Should know other address is not operator', async () => {
      expect(await ctrlToken.connect(addr1).isOperator()).to.be.false;
    });

    it('Should have minted correct initial supply', async () => {
      expect(await ctrlToken.totalSupply()).to.be.eq(0);
    });

    it('operator should have balance equal to the minted supply', async () => {
      expect(await ctrlToken.balanceOf(operator.address)).to.be.eq(0);
    });

    it('should mint coins and assign them to recipient', async () => {
      const amountToMint = utils.parseEther('5');
 
      expect(await ctrlToken.mint(addr1.address, amountToMint))
        .to.emit(ctrlToken, 'Transfer')
        .withArgs(ZERO_ADDR, addr1.address, amountToMint);

      const currentBalance = await ctrlToken.balanceOf(addr1.address);
      expect(currentBalance).to.be.eq(amountToMint);
    });

    it('should burn coins from operator', async () => {
      const amountToMint = utils.parseEther('5');
      const amountToBurn = utils.parseEther('1');

      await ctrlToken.mint(operator.address, amountToMint)

      const balanceBefore = await ctrlToken.balanceOf(operator.address);
      expect(await ctrlToken.burn(amountToBurn))
        .to.emit(ctrlToken, 'Transfer')
        .withArgs(operator.address, ZERO_ADDR, amountToBurn);

      const expectedBalance = balanceBefore.sub(amountToBurn);
      const currentBalance = await ctrlToken.balanceOf(operator.address);
      expect(currentBalance).to.be.eq(expectedBalance);
    });

    it('should NOT burn coins from target without approval', async () => {
      const amountToMint = utils.parseEther('5');
      const amountToBurn = utils.parseEther('1');

      await ctrlToken.mint(addr1.address, amountToMint);

      await expect(ctrlToken.burnFrom(addr1.address, amountToBurn))
        .to.be.revertedWith(
          "VM Exception while processing transaction: revert ERC20: burn amount exceeds allowance"
      );

      expect(await ctrlToken.allowance(addr1.address, operator.address)).to.be.eq(0);
    });

    it('should burn coins from target account allowance', async () => {
      const amountToMint = utils.parseEther('5');
      const amountToBurn = utils.parseEther('1');

      await ctrlToken.mint(addr1.address, amountToMint);
      await ctrlToken.connect(addr1).approve(operator.address, amountToBurn);

      expect(await ctrlToken.burnFrom(addr1.address, amountToBurn))
        .to.emit(ctrlToken, 'Transfer')
        .withArgs(addr1.address, ZERO_ADDR, amountToBurn);

      expect(await ctrlToken.allowance(addr1.address, operator.address)).to.be.eq(0);
    });
  });
});

describe('HAIF token contract', () => {
  let haifTokenFactory: ContractFactory;
  let operator: SignerWithAddress;
  let addr1: SignerWithAddress;
  let haifToken: Contract;

  before(async () => {
    [operator, addr1] = await ethers.getSigners();
    haifTokenFactory = await ethers.getContractFactory('HAIF');
  });

  beforeEach(async () => {
    haifToken = await haifTokenFactory.deploy();
  });

  describe('Deployment', async () => {
    it('Should have the correct operator', async () => {
      expect(await haifToken.operator()).to.be.eq(operator.address);
    });

    it('Should identify if operator is operator', async () => {
      expect(await haifToken.isOperator()).to.be.true;
    });

    it('Should know other address is not operator', async () => {
      expect(await haifToken.connect(addr1).isOperator()).to.be.false;
    });

    it('should mint coins and assign them to recipient', async () => {
      const amountToMint = utils.parseEther('5');

      expect(await haifToken.mint(addr1.address, amountToMint))
        .to.emit(haifToken, 'Transfer')
        .withArgs(ZERO_ADDR, addr1.address, amountToMint);

      const currentBalance = await haifToken.balanceOf(addr1.address);
      expect(currentBalance).to.be.eq(amountToMint);
    });

    it('should burn coins from operator', async () => {
      const amountToMint = utils.parseEther('5');
      const amountToBurn = utils.parseEther('1');

      await haifToken.mint(operator.address, amountToMint)

      const balanceBefore = await haifToken.balanceOf(operator.address);
      expect(await haifToken.burn(amountToBurn))
        .to.emit(haifToken, 'Transfer')
        .withArgs(operator.address, ZERO_ADDR, amountToBurn);

      const expectedBalance = balanceBefore.sub(amountToBurn);
      const currentBalance = await haifToken.balanceOf(operator.address);
      expect(currentBalance).to.be.eq(expectedBalance);
    });

    it('should NOT burn coins from target without approval', async () => {
      const amountToMint = utils.parseEther('5');
      const amountToBurn = utils.parseEther('1');

      await haifToken.mint(addr1.address, amountToMint);

      await expect(haifToken.burnFrom(addr1.address, amountToBurn))
        .to.be.revertedWith(
          "VM Exception while processing transaction: revert ERC20: burn amount exceeds allowance"
      );

      expect(await haifToken.allowance(addr1.address, operator.address)).to.be.eq(0);
    });

    it('should burn coins from target account allowance', async () => {
      const amountToMint = utils.parseEther('5');
      const amountToBurn = utils.parseEther('1');

      await haifToken.mint(addr1.address, amountToMint);
      await haifToken.connect(addr1).approve(operator.address, amountToBurn);

      expect(await haifToken.burnFrom(addr1.address, amountToBurn))
        .to.emit(haifToken, 'Transfer')
        .withArgs(addr1.address, ZERO_ADDR, amountToBurn);

      expect(await haifToken.allowance(addr1.address, operator.address)).to.be.eq(0);
    });
  });
});

describe('lfBTC token contract', () => {
  let lfBTCTokenFactory: ContractFactory;
  let operator: SignerWithAddress;
  let addr1: SignerWithAddress;
  let lfBTCToken: Contract;

  before(async () => {
    [operator, addr1] = await ethers.getSigners();
    lfBTCTokenFactory = await ethers.getContractFactory('LFBTC');
  });

  beforeEach(async () => {
    lfBTCToken = await lfBTCTokenFactory.deploy();
  });

  describe('Deployment', async () => {
    it('Should have the correct operator', async () => {
      expect(await lfBTCToken.operator()).to.be.eq(operator.address);
    });

    it('Should identify if operator is operator', async () => {
      expect(await lfBTCToken.isOperator()).to.be.true;
    });

    it('Should know other address is not operator', async () => {
      expect(await lfBTCToken.connect(addr1).isOperator()).to.be.false;
    });

    it('should mint coins and assign them to recipient', async () => {
      const amountToMint = utils.parseEther('5');
  
      expect(await lfBTCToken.mint(addr1.address, amountToMint))
        .to.emit(lfBTCToken, 'Transfer')
        .withArgs(ZERO_ADDR, addr1.address, amountToMint);

      const currentBalance = await lfBTCToken.balanceOf(addr1.address);
      expect(currentBalance).to.be.eq(amountToMint);
    });

    it('should burn coins from operator', async () => {
      const amountToMint = utils.parseEther('5');
      const amountToBurn = utils.parseEther('1');

      await lfBTCToken.mint(operator.address, amountToMint);

      const balanceBefore = await lfBTCToken.balanceOf(operator.address);
      expect(await lfBTCToken.burn(amountToBurn))
        .to.emit(lfBTCToken, 'Transfer')
        .withArgs(operator.address, ZERO_ADDR, amountToBurn);

      const expectedBalance = balanceBefore.sub(amountToBurn);
      const currentBalance = await lfBTCToken.balanceOf(operator.address);
      expect(currentBalance).to.be.eq(expectedBalance);
    });

    it('should NOT burn coins from target without approval', async () => {
      const amountToMint = utils.parseEther('5');
      const amountToBurn = utils.parseEther('1');

      await lfBTCToken.mint(addr1.address, amountToMint);

      await expect(lfBTCToken.burnFrom(addr1.address, amountToBurn))
        .to.be.revertedWith(
          "VM Exception while processing transaction: revert ERC20: burn amount exceeds allowance"
      );

      expect(await lfBTCToken.allowance(addr1.address, operator.address)).to.be.eq(0);
    });

    it('should burn coins from target account allowance', async () => {
      const amountToMint = utils.parseEther('5');
      const amountToBurn = utils.parseEther('1');

      await lfBTCToken.mint(addr1.address, amountToMint);
      await lfBTCToken.connect(addr1).approve(operator.address, amountToBurn);

      expect(await lfBTCToken.burnFrom(addr1.address, amountToBurn))
        .to.emit(lfBTCToken, 'Transfer')
        .withArgs(addr1.address, ZERO_ADDR, amountToBurn);

      expect(await lfBTCToken.allowance(addr1.address, operator.address)).to.be.eq(0);
    });
  });
});

describe('LIFT token contract', () => {
  let liftTokenFactory: ContractFactory;
  let operator: SignerWithAddress;
  let addr1: SignerWithAddress;
  let liftToken: Contract;

  before(async () => {
    [operator, addr1] = await ethers.getSigners();
    liftTokenFactory = await ethers.getContractFactory('LIFT');
  });

  beforeEach(async () => {
    liftToken = await liftTokenFactory.deploy();
  });

  describe('Deployment', async () => {
    it('Should have the correct operator', async () => {
      expect(await liftToken.operator()).to.be.eq(operator.address);
    });

    it('Should identify if operator is operator', async () => {
      expect(await liftToken.isOperator()).to.be.true;
    });

    it('Should know other address is not operator', async () => {
      expect(await liftToken.connect(addr1).isOperator()).to.be.false;
    });

    it('should mint coins and assign them to recipient', async () => {
      const amountToMint = utils.parseEther('5');
 
      expect(await liftToken.mint(addr1.address, amountToMint))
        .to.emit(liftToken, 'Transfer')
        .withArgs(ZERO_ADDR, addr1.address, amountToMint);

      const currentBalance = await liftToken.balanceOf(addr1.address);
      expect(currentBalance).to.be.eq(amountToMint);
    });

    it('should burn coins from operator', async () => {
      const amountToMint = utils.parseEther('5');
      const amountToBurn = utils.parseEther('1');

      await liftToken.mint(operator.address, amountToMint);

      const balanceBefore = await liftToken.balanceOf(operator.address);
      expect(await liftToken.burn(amountToBurn))
        .to.emit(liftToken, 'Transfer')
        .withArgs(operator.address, ZERO_ADDR, amountToBurn);

      const expectedBalance = balanceBefore.sub(amountToBurn);
      const currentBalance = await liftToken.balanceOf(operator.address);
      expect(currentBalance).to.be.eq(expectedBalance);
    });

    it('should NOT burn coins from target without approval', async () => {
      const amountToMint = utils.parseEther('5');
      const amountToBurn = utils.parseEther('1');

      await liftToken.mint(addr1.address, amountToMint);

      await expect(liftToken.burnFrom(addr1.address, amountToBurn))
        .to.be.revertedWith(
          "VM Exception while processing transaction: revert ERC20: burn amount exceeds allowance"
      );

      expect(await liftToken.allowance(addr1.address, operator.address)).to.be.eq(0);
    });

    it('should burn coins from target account allowance', async () => {
      const amountToMint = utils.parseEther('5');
      const amountToBurn = utils.parseEther('1');

      await liftToken.mint(addr1.address, amountToMint);
      await liftToken.connect(addr1).approve(operator.address, amountToBurn);

      expect(await liftToken.burnFrom(addr1.address, amountToBurn))
        .to.emit(liftToken, 'Transfer')
        .withArgs(addr1.address, ZERO_ADDR, amountToBurn);

      expect(await liftToken.allowance(addr1.address, operator.address)).to.be.eq(0);
    });
  });
});