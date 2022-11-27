require('dotenv').config()

const hre = require("hardhat");
const {encodePriceSqrt} = require("../util");
const {getPoolData} = require("../util");
const {ethers} = require("hardhat");
const {Contract} = require("ethers")
const {Token} = require('@uniswap/sdk-core')

const {Pool, Position, nearestUsableTick} = require('@uniswap/v3-sdk')

const {abi: IUniswapV3PoolABI} = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json')
const {abi: SwapRouterABI} = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json');
const {abi: INonfungiblePositionManagerABI} = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/INonfungiblePositionManager.sol/INonfungiblePositionManager.json')
const {abi: FactoryABI} = require('@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json')

const routerAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564"
const managerAddress = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"
const factoryAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984"

const provider = new ethers.providers.JsonRpcProvider("YOUR_ALCHEMY_URL")

describe("Uniswap: FirstToken and SecondToken", function () {
    it("process", async function () {
        let deployer = (await hre.ethers.getSigners())[0]

        const fst = await hre.ethers.getContractFactory("FirstToken", deployer);
        let first = await fst.deploy();

        await first.deployed();

        console.log(
            `FirstToken deployed to ${first.address}`
        );

        const snd = await hre.ethers.getContractFactory("SecondToken", deployer);
        let second = await snd.deploy();

        await second.deployed();

        console.log(
            `SecondToken deployed to ${second.address}`
        );

        const factoryContract = new Contract(factoryAddress, FactoryABI, provider)
        const nonfungiblePositionManager = new Contract(managerAddress, INonfungiblePositionManagerABI, provider)

        await nonfungiblePositionManager.connect(deployer).createAndInitializePoolIfNecessary(second.address, first.address, 500,
            encodePriceSqrt(1, 1), {gasLimit: 5000000})

        const fsPoolAddress = await factoryContract.connect(deployer).getPool(second.address, first.address, 500)
        console.log("FirstSecond pool deployed to", fsPoolAddress)

        let fsPoolContract = new Contract(fsPoolAddress, IUniswapV3PoolABI, deployer)

        const data = await getPoolData(fsPoolContract)

        await first.connect(deployer).approve(managerAddress, ethers.utils.parseEther('10000000000000000'))
        await second.connect(deployer).approve(managerAddress, ethers.utils.parseEther('10000000000000000'))

        const FirstToken = new Token(1, first.address, 1, 'FST', 'FirstToken')
        const SecondToken = new Token(1, second.address, 1, 'SND', 'SecondToken')

        const pool = new Pool(SecondToken, FirstToken, data.fee, data.sqrtPriceX96.toString(), data.liquidity.toString(), data.tick)

        const position = new Position({
            pool: pool, liquidity: '10000000',
            tickLower: nearestUsableTick(data.tick - data.tickSpacing * 2, data.tickSpacing),
            tickUpper: nearestUsableTick(data.tick + data.tickSpacing * 2, data.tickSpacing)
        })

        const {amount0: amount0Desired, amount1: amount1Desired} = position.mintAmounts

        let params = {
            token0: second.address,
            token1: first.address,
            fee: data.fee,
            tickLower: nearestUsableTick(data.tick - data.tickSpacing * 2, data.tickSpacing),
            tickUpper: nearestUsableTick(data.tick + data.tickSpacing * 2, data.tickSpacing),
            amount0Desired: amount0Desired.toString(),
            amount1Desired: amount1Desired.toString(),
            amount0Min: 0,
            amount1Min: 0,
            recipient: deployer.address,
            deadline: Math.floor(Date.now() / 1000) + (60 * 10)
        }

        console.log("tokens before adding liquidity - first: ", (await first.balanceOf(deployer.address)).toString(),
            "second: ", (await second.balanceOf(deployer.address)).toString())
        await nonfungiblePositionManager.connect(deployer).mint(params, {gasLimit: '1000000'})
        console.log("tokens after adding liquidity - first: ", (await first.balanceOf(deployer.address)).toString(),
            "second: ", (await second.balanceOf(deployer.address)).toString())

        const poolData = await getPoolData(fsPoolContract)
        console.log("liquidity in pool: ", poolData.liquidity.toString())

        const swapRouterContract = new Contract(routerAddress, SwapRouterABI, provider)

        await first.connect(deployer).approve(routerAddress, (10000000).toString())

        params = {
            tokenIn: first.address, tokenOut: second.address, fee: poolData.fee, recipient: deployer.address,
            deadline: Math.floor(Date.now() / 1000) + (60 * 10), amountIn: 10000,
            amountOutMinimum: 0, sqrtPriceLimitX96: 0,
        }

        console.log("amount before swap - first: ", (await first.balanceOf(deployer.address)).toString(),
            "second: ", (await second.balanceOf(deployer.address)).toString())
       console.log("swap 10000 first tokens to second tokens")
        await swapRouterContract.connect(deployer).exactInputSingle(params, {gasLimit: ethers.utils.hexlify(1000000)})
        console.log("amount after swap - first: ", (await first.balanceOf(deployer.address)).toString(),
            "second: ", (await second.balanceOf(deployer.address)).toString())
    })
})