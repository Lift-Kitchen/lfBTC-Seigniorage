Genesis Steps
--------------------------------------------------------------------------------------
Execute Begin Genesis
 - https://etherscan.io/address/0x2114E25d458BF42deb21432BcCC01f2d88a1dC7C#contracts

 Validate Both LP Pools
 - wBTC - https://etherscan.io/address/0x4DB2fa451e1051A013A42FaD98b04C2aB81043Af#contracts
    - validate LP token 
 - lfBTC - https://etherscan.io/address/0xC3C79869ED93c88E1227a1Ca3542c9B947BA9e0c#contracts
    - validate LP token

Genesis Migrate to LIFT Deployer
    - Mint LIFT - https://etherscan.io/address/0xf9209d900f7ad1DC45376a2caA61c78f6dEA53B6#contracts
    - 250k USD / Final price
    - send to each shortStakeContract

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

- Validate Oracle Pricing Contract
    Verifying old Oracle
    https://etherscan.io/address/0x30216adbbF2958a73C5930721Fd96Fec3030EdeB#contracts

    Verifying new Oracle
    https://etherscan.io/address/0x19631167bf0FE463fE52173f6ce0ceA9C3c08641#contracts


- Update ORACLES
    Verifying IdeaFund
    https://etherscan.io/address/0x918b4FDbC30B628564E07fd2120009b0078F4343#contracts
    
    Verifying Treasury
    https://etherscan.io/address/0x0F756a496813455dEcf2B8992a716039A5df64F1#contracts
    
    Verifying Boardroom
    https://etherscan.io/address/0x3223689b39Db8a897a9A9F0907C8a75d42268787#contracts

- Migrate LFBTC/LIFT/CTRL operator/ownership to Treasury Contract
    - Verifying lfBTC
    https://etherscan.io/address/0xafcE9B78D409bF74980CACF610AFB851BF02F257#contracts

    - Verifying LIFT
    https://etherscan.io/address/0xf9209d900f7ad1DC45376a2caA61c78f6dEA53B6#contracts

    - Verifying CTRL
    https://etherscan.io/address/0xA31fDbaA772745D11843EFEDA9922dcbf5460672#contracts

- IdeaFund will be holding wBTC/lfBTC tokens
    - Transfer LP tokens to HedgeFund
    - Transfer LP tokens to HedgeFund private wallet
    - Stake LP into LiquidityPool

    - Update HedgeFund
    Verifying new HedgeFund
    https://etherscan.io/address/0xF3fA224dfF32DAFc9332803e880aB250AB6B0A68#contracts


    - Verifying IdeaFund
    https://etherscan.io/address/0x918b4FDbC30B628564E07fd2120009b0078F4343#contracts


5/1
    MUST UPDATE HEDGE AND ORACLEs
    MUST DISTRIBUTE CTRL TOKENS
    MUST REDO Single Stake calculations