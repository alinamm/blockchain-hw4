const hre = require("hardhat");

async function main() {
    const fst = await hre.ethers.getContractFactory("FirstToken");
    const first = await fst.deploy();

    await first.deployed();

    console.log(
        `FirstToken deployed to ${first.address}`
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});