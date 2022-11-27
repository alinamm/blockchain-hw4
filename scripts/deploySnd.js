const hre = require("hardhat");

async function main() {
    const snd = await hre.ethers.getContractFactory("SecondToken");
    const second = await snd.deploy();

    await second.deployed();

    console.log(
        `SecondToken deployed to ${second.address}`
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
