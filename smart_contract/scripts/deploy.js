const hre = require("hardhat");

// deploy the contract
const main = async() => {

  // same as the contract name (a factory for generating instances of the contract)
  const Transactions = await hre.ethers.getContractFactory("Transactions");

  // produce one specific instance
  const transactions = await Transactions.deploy();

  await transactions.deployed();

  console.log("Transaction deployed to:", transactions.address);
}

const runMain = async () => {
  try{
    await main();
    process.exit(0);
  } catch (error){
    console.error(error);
    process.exit(1)
  }
}

runMain();