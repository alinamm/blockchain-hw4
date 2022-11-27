Set your alchemy url instead of "YOUR_ALCHEMY_URL" in test\Test.js 21 line 

Run:

```shell
npx hardhat test
```

Logs:

```angular2html
FirstToken deployed to 0x707531c9999AaeF9232C8FEfBA31FBa4cB78d84a
SecondToken deployed to 0x2538a10b7fFb1B78c890c870FC152b10be121f04
FirstSecond pool deployed to 0x4774127CBBeC8faa05125ec9bd6dF316D665ee50
tokens before adding liquidity - first:  2000000 second:  2000000
tokens after adding liquidity - first:  1990005 second:  1990005
liquidity in pool:  10000498
amount before swap - first:  1990005 second:  1990005
swap 10000 first tokens to second tokens
amount after swap - first:  1980005 second:  1999990
    √ process (9606ms)

  1 passing (10s)
```
