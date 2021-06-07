# LiftDAO aka Lift.kitchen
WBTC - 0x2260fac5e5542a773aa44fbcfedf7c193bc2c599
Verifying IdeaFund
https://etherscan.io/address/0x918b4FDbC30B628564E07fd2120009b0078F4343#contracts
Verifying IdeaFund – New 6/6
https://etherscan.io/address/0x0598B812F79df854409641bce01392FeA921f11E#contracts
Verifying new HedgeFund
https://etherscan.io/address/0xF3fA224dfF32DAFc9332803e880aB250AB6B0A68#contracts
Verifying Boardroom
https://etherscan.io/address/0x3223689b39Db8a897a9A9F0907C8a75d42268787#contracts
Verifying wBTClfBTCLPTokenSharePool
https://etherscan.io/address/0x4DB2fa451e1051A013A42FaD98b04C2aB81043Af#contracts
Verifying lfBTCLIFTLPTokenSharePool
https://etherscan.io/address/0xC3C79869ED93c88E1227a1Ca3542c9B947BA9e0c#contracts
Verifying wETHlfETHLPTokenSharePool
https://etherscan.io/address/0xBd2B271150332628fEd8269217b88cC7A31283E4#contracts
Verifying New Treasury – 6/1
https://etherscan.io/address/0x5dc17A9FA19e4c0aFF2df59b0878a0d0ff78Ba3D#contracts
Verifying New Oracle – 6/1
https://etherscan.io/address/0x126aE6EF73C8CDA33a08B4F8C3410D02089A1AAf#contracts
Verifying lfBTC - 0xafcE9B78D409bF74980CACF610AFB851BF02F257
https://etherscan.io/address/0xafcE9B78D409bF74980CACF610AFB851BF02F257#contracts
Verifying lfETH
https://etherscan.io/token/0xE09B10EFA59F6E17052E9A2D947bAd6214E7CC90#readContract
Verifying LIFT
https://etherscan.io/address/0xf9209d900f7ad1DC45376a2caA61c78f6dEA53B6#contracts
Verifying CTRL
https://etherscan.io/address/0xA31fDbaA772745D11843EFEDA9922dcbf5460672#contracts
Verifying HAIF
https://etherscan.io/address/0x99A68d06b9a23eFE9885Eb723D63457aAB1633de#contracts
Verifying DevFund
https://etherscan.io/address/0xfF5B08760Da5df0Fb4cA732eE2E4F93E7AbBD901#contracts
Verifying shortStakealUSDPool
https://etherscan.io/address/0xc62e2C1E8e7078F66A989ebD47936B00aadF05f9#contracts
Verifying shortStakeBASv2Pool
https://etherscan.io/address/0x9551e5528f7D191Eb6ee45bCE4c455C2C238C9c2#contracts
Verifying shortStakeiFARMPool
https://etherscan.io/address/0xe325b9f54B35692cEd0952B0459133e200088096#contracts
Verifying shortStakeKBTCPool
https://etherscan.io/address/0xe2Cf4ab503276BC693fB05eb2Da00c997E26ee68#contracts
Verifying shortStakePICKLEPool
https://etherscan.io/address/0x570CcB67cD8511f959e8842c5F78d62CeD873DF3#contracts
Verifying old HedgeFund
https://etherscan.io/address/0x8974c4f6F66AeE757515c0a745A8C4702B3aEedc#contracts
Verifying old Oracle
https://etherscan.io/address/0x30216adbbF2958a73C5930721Fd96Fec3030EdeB#contracts
Verifying new Oracle
https://etherscan.io/address/0x19631167bf0FE463fE52173f6ce0ceA9C3c08641#contracts
Verifying Treasury
https://etherscan.io/address/0x0F756a496813455dEcf2B8992a716039A5df64F1#contracts
Verifying GenesisVault 
https://etherscan.io/address/0x2114E25d458BF42deb21432BcCC01f2d88a1dC7C#contracts



truffle run verify MockwBTC GenesisVault IdeaFund HedgeFund Treasury Boardroom  wBTClfBTCLPTokenSharePool lfBTCLIFTLPTokenSharePool Oracle lfBTC LIFT CTRL HAIF DevFund --network rinkeby

Genesis Steps
--------------------------------------------------------------------------------------
Execute Begin Genesis
- Individual LPs will be auto staked into lfBTC/LIFT Pool
- Validate Oracle Pricing Contract
- Migrate GenesisVault to DeployerWallet
    - Mint LIFT needed for 6 Single Stake Pools (2% APY a day - .5% APY per pool per day)
    - Migrate LFBTC/LIFT operator/ownership to Treasury Contract
- Determine if more CTRL is needed for first 8 hours of staking .02 per 1 wbtc.
    - Mint needed CTRL
    - Transfer CTRL ownership to Treasury
- IdeaFund will be holding wBTC/lfBTC tokens
    - Transfer LP tokens to HedgeFund
    - Transfer LP tokens to HedgeFund private wallet
    - Stake LP into LiquidityPool


At Launch
--------------------------------------------------------------------------------------
- After Genesis - Migrate to Treasury
- VALIDATE ORACLE BEFORE Moving UniTokens from IdeaFund to HedgeFund
- Set Staking dates start to one day after the genesis "conversion"
- Update the UniswapLibrary Hex code
- Update the migration deployment TimeStamps
- Update the TIME LOCKS on lfBTCLIFTLPTokenPool
- Token Tasks:  Each coin needs to be listed on on CoinGecko - https://docs.google.com/forms/d/e/1FAIpQLScIlVCl2qIc9SMPxHZCuZAZkRCxCNZugjNmHZISswAeodlc0A/viewform

Ready for Testing:
--------------------------------------------------------------------------------------
Tenants of Testing
- Everything needs to be migratable (treasury, boardroom, devfund, ideafund, hedgefund)
- Everything needs to have a viable test case
- Everything needs to be ownable/operator - can the tokens have multiple operators?
- DOUBLE CHECK ALL token.balanceOf calls this is misleading in what it might return!!!

GenesisVault.sol - 3/16/2021 by CryptoGamblers
- A staking vault that accepts wbtc
- Call Terminated to end Staking
- At Genesis
    - mints lfbtc = wbtc staked (generates IdeaFund wbtc/lfbtc LP)
    - mints multiplied value of wbtc into proper values of lfbtc/lift, adds pair to liqudity token, stakes into LquidityProvider Vault on behalf of staker
- Final step call Migrate to migrate token ownership to Treasury

Treasury.sol - 3/16/2021
- runs the daily expansion checking process
- function should be logic complete 
    - 5% (devfundallocationrate) of expansion in lfbtc goes to DevFund
    - 80% (ideafundallocationrate) of expansion in lfbtc goes to IdeaFund
    - 15% remainder of expansion in CTRL goes to Boardroom 

DevFund.sol - 3/16/2021
- allows for the desposit (if you want to emit the desposit reason to chain)
- allows for the widthdrawl (token, amount, reason)

Boardroom.sol - 3/17/2021
- Setup the staking / withdrawl functions 
- Setup the earnings calculation for allocateSeignoraige (sp)
- validating the earnings payout is going to be critical

IdeaFund.sol - 3/17/2021
    - Fund to redeem CTRL and Invest in Crypto Concepts 
    - Takes lfBTC/lift and sells it for wbtc 
    - Buys lfBTC/lift when below peg 
    - Redeems CTRL Tokens @ (IdeaFund Value) - (lfBTC holdings) / 4 (needs to be programmable) / SUPPLY of CTRL
        - 1m in IdeaFund (50% is lfBTC Tokens) = 500k / 4 = 125k / (CTRL = 200) = $625 per CTRL

    - Reports CTRL value growth (ala hedge fund style - see hedgefund.sol and the HAIF usage)
    - CTRL Tokens can not be redeemed until we say so...  
    - This must also be the ORACLE for the CTRL value (Oracle will call ideafund for CTRL value and HedgeFund for HAIF value)

util/Oracle.sol - 3/18/2021
    - lots of pricing changes
    - need to validate the consult and priceOf function both work across all 5 tokens
    - wbtc, lfbtc, lift, ctrl, haif

lfBTCLIFTLPTokenSharePool.sol\wBTClfBTCLPTokenSharePool - 3/18/2021
    - will have a VERY large quanity of lift in it
    - will allow for people to stake their matching LP token into this pool
    - will allow for people to withdraw their LP token 
        - has a X day (30) timer, on the initial genesis investors
    - will allow people to stake their rewards directly to the boardroom
    - will allow the operator to update the reward amount so we can control the outflow of emissions if needed

distributor/InitialShareDistrubtion.sol - 3/18/2021
    - hands out shares to the two pools above (very simple)

hedgefund.sol - 3/18/2021
    - can take in the ideafund investment
    - can calculate the initial value of investment
    - can return a HAIF price to functions
    - HAS A LOT OF OPPORUTNITY FOR IMPROVEMENT

Extra Credit
--------------------------------------------------------------------------------------
if we have time - migrate from UniSwap to SushiSwap Onsen
(1)
We stake LP at Sushi Swap for lfBTC & LIFT - sushiswap (need to make LP migration trivial?)
We stake LP Tokens into BANKVAULT (collects LP fees and Onsen Sushi) - https://app.sushi.com/onsen
(2)
A good example of a Ownable/Operator type contract model with a multisig wallet. Implemented Across Contracts
(3)
Abstract out the liquidity pool / pricing stuff for an abstract layer


PHASE 2 Enhancements
--------------------------------------------------------------------------------------
Staking the LPs in BANKVAULT pays us in LIFT (continously) (options for emissions, normal, push to boardroom, lockup in boardroom, convert to more LP)
    - LOOK At Zapper.fi - we need a one click staking capability from any Token into either LP from the website
    - Issue 10k/week - Can be redeemed immediately at a 90% reduction, or can one button click into Boardroom (no reduction), dropium method in boardroom over 90 days - meaning if I withdraw immediately I lose 90%, a day later 89% - This is measured each time the individual moves their emmissions into boardroom or withdraws
    - what ever % of LIFT a person abandons by early redemptions will be transferred to the IdeaFund for selling no penalty
    - This code is the LP / Distribution / Distributors / Vault / Strategies

    BANKVAULT / Distributor / Distribution
    VAULTS - Need to update the vaults
    DEXLP (uni / sushi) -> VAULT -> sushi Onsen (additional income)
    https://github.com/yearn/vaults/tree/master/contracts
    https://app.sushi.com/onsen

--------------------------------------------------------------------------------------
Governance
    Older Build - https://etherscan.io/address/0x5A6eBeB61A80B2a2a5e0B4D893D731358d888583#readContract
    New DAO - https://github.com/PhoenixDAO/DAO-contracts/blob/dev/contracts/DaoSmartContract.sol
