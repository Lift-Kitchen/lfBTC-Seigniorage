# LiftDAO aka Lift.kitchen
truffle run verify MockwBTC GenesisVault IdeaFund HedgeFund Treasury Boardroom  wBTClfBTCLPTokenSharePool lfBTCLIFTLPTokenSharePool Oracle lfBTC LIFT CTRL HAIF DevFund --network rinkeby

Genesis Steps
--------------------------------------------------------------------------------------
Execute Begin Genesis
- Individual LPs will be auto staked into lfBTC/LIFT Pool
- Validate Oracle Pricing Contract
- Migrate GenesisVault to DeployerWallet
    - Mint LIFT needed for 4 Single Stake Pools (2% APY a day - .5% APY per pool per day)
    - Migrate LFBTC/LIFT operator/ownership to Treasury Contract
- Determine if more CTRL is needed for first 8 hours of staking .02 per 1 wbtc.
    - Mint needed CTRL
    - Transfer CTRL ownership to Treasury
- IdeaFund will be holding wBTC/lfBTC tokens
    - Transfer LP tokens to HedgeFund
    - Transfer LP tokens to HedgeFund wallet
    - Deconstruct LP 50% 
        - 50% of total exchanged wbtc is paired in LP
        - 50% of total exchanged wbtc is turned into wbtc/lftbt tokens
        - Wallet stakes LP tokens into wbtc/lfbtc pool 
        - Wallet sends wbtc and lfbtc single tokens back to IdeaFund



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
