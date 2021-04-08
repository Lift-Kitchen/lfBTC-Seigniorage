Outline of all the tests across different stages of the protocol lifecycle.

**** We really really need to validate the math and fractional staking.  .008 wbtc in genesis, or 1.23748724 LIFT into Boardroom, or .00008773 lptoken in the POOL.  ****

Genesis
- Can we stake wbtc into the GenesisVault(success)
- Can we stake other tokens into the Genesis Vault (error)
- Can we transfer other tokens out of the Genesis Vault (success)
- Can we change the multiplier variable for Genesis Funds
- Is the array of staked wbtc / multiplied wbtc accurately reflecting the staked wbtc and multiplied wbtc?
- does the terminate staking function stop the ability to take in funds?
- At genesis
    - do we create the wbtc/lfbtc pair and successfully send it to the ideafund
    - do we create the lfbtc/lift pair correctly for each staker * the multplied value they earned?
    - do we successfully stake it in the liquidity pool on their behalf?
- after genesis do we transfer the token ownership to the proper contracts? 
    - out to treasury

Distributor
- did migration mint and give distributor enough LIFT tokens?
- did the distributor push out enough LIFT to both of the LP pools?

Two LP Pools - BANK tab on a website
- if I was a genesis staker am I locked in for 30 days?
- if I stake LP after genesis does it track my staking correctly
- does it show me my rewards earned correctly
- does it let me withdraw my stake
- does it let me withdraw my rewards with a 60% discount?
- does it let me transfer my rewards to the boardroom?
- do they return total staked supply for each?

Oracle
- after the creation of both Liquidity Pools on Uniswap
- do we have pricing correctly for all 5 of our tokens wbtc, lfbtc, lift, ctrl, haif?

Treasury
- Is the pegPrice correct?
    - do we only expand above 1.05 of wBTC?
    - do we only expand 10% of supply per expansion regardless of the peg (1.10+)
- validate the multiple pricing calls return real prices
    - wbtc, lfbtc, ctrl
- at expansion
    - Did we put lfbtc in dev fund?
    - did we put lfbtc into idea fund?
    - did we put ctrl into boardroom?
- do the set functions work
    - Dev & Idea fund Address
done
    - Dev & Idea fund rate of allocation
done
    - modified rates reflect appropriately in allocateSeign?
	
Boardroom
- do we properly track the staked share and control separately? - totalSupply and Balances
done
- do we properly report out as a view totalSupply and Balances?
done
- do we properly track the staked share and control rewards earned?
done
- do we allow people to redeem their earned control properly?
done
- do we allow people to stake shares and control tokens?
done
- do we allow the third party staking of share and control correctly?
i think this is wonky. addr1 has to approve the boardroom, but NOT the person calling stakeShareForThirdParty()? how are the owners of addr1 and addr2 even connected? i don't see how you'd specify who you want to be able to call this on your behalf, or in the other direction, how you'd know someone wants you to call this for them. also, why wouldn't addr1 just stake directly? if approval still goes to the boardroom, this seems like it's not gaining us anything.
- do the 3 update reward functions work properly?
- can the website show the staked amount and date staked properly?
    - getStakedAmountsShare - we need to remind people that they lose a % if they withdraw prior to 60 days
- does the withdrawShare function punish appropriately for early withdraw?
    - does it work properly for after 60 day withdraw?
    - can we see each unique "staking" event?

DevFund
- does it take in tokens at expansion
- can we get the tokens out at will? (operator only)
done

IdeaFund
- at genesis does it get the initial wbtc / lfbtc Token from GenesisVault
- can it transfer those LP tokens to the HedgeFund and get Haif back
done
- can it accurately report the CTRL token value price?
- can we turn on / off CTRL redemption flag?
partially done - tested turning it on
- can we redeem CTRL for wBTC if flag is on and we have wbtc?
- can we convert lfBTC and LIFT for CTRL?
partially done - can buy both 
    - does the call to mint from the treasury work and send? 
    - can only ideafund call this?
- can withdrawl from hedgefund and get wbtc?
- can migrate?
- all set variables work?
- can cleanupDust?
- does this function work and let us move tokens around?
    - ideaFundBuyingTokenAwithTokenB - test with all combos?
    - the pathTo is complex
- does this let us sell lfbtc and lift?
    - ideaFundSellingToken

HedgeFund
- does it take in the variety of tokens that the IdeaFund might send it?
- can we transfer funds out to our private wallet for actual investing (this wallet must be listed on the website for watching)
- does it allow us to put wbtc back into the hedgefund for calls to withdraw funds?
- does it migrate
- does the pricing function increase .25% per day on the value of $500? (hedgePrice)
- does the increase / decrease of _haifBalances work when funds come in and out?
