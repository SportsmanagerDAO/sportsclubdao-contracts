// tasks/deploy-all.ts

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Contract, ContractFactory } from "ethers";
import { task } from "hardhat/config";

// Defaults to e18 using amount * 10^18
const getBigNumber = (amount: number, decimals: number = 18): BigNumber => {
  return BigNumber.from(amount).mul(BigNumber.from(10).pow(decimals))
}

task("deploy-all", "Deploys every smart contract").setAction(
  async (_args, { ethers }) => {
    const [proposer]: SignerWithAddress[] = await ethers.getSigners()
    const wethAddress: string = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

    const SportsClub: ContractFactory = await ethers.getContractFactory("SportsClubDAO")
    const sportsclub: Contract = await SportsClub.deploy()
    await sportsclub.deployed()
    console.log('SportsClubDAO', sportsclub.address)

    const PurchaseToken: ContractFactory = await ethers.getContractFactory("SportsClubERC20")
    const purchaseToken: Contract = await PurchaseToken.deploy()
    await purchaseToken.deployed()
    await purchaseToken.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      [proposer.address],
      [getBigNumber(1000)],
      false,
      proposer.address
    )
    console.log('SportsClubERC20', purchaseToken.address)
    
    const RicardianLLC: ContractFactory = await ethers.getContractFactory("SportsClubCoRicardianLLC")
    const ricardianLLC: Contract = await RicardianLLC.deploy("RICARDIANLLC", "RLLC", "SportsClubCoRicardianLLC", "SportsClubCoRicardianLLC", 1)
    await ricardianLLC.deployed()
    console.log('SportsClubCoRicardianLLC', ricardianLLC.address)
    
    // The deployer will be act as rewardDistributor
    const SportsClubFactory: ContractFactory = await ethers.getContractFactory("SportsClubDAOfactory")
    const sportsclubFactory: Contract = await SportsClubFactory.deploy(proposer.address, ricardianLLC.address)
    await sportsclubFactory.deployed()
    console.log('SportsClubDAOfactory', sportsclubFactory.address)

    const Tribute: ContractFactory = await ethers.getContractFactory("SportsClubDAOtribute")
    const tribute: Contract = await Tribute.deploy()
    await tribute.deployed()
    console.log('SportsClubDAOtribute', tribute.address)

    const Whitelist: ContractFactory = await ethers.getContractFactory("SportsClubAccessManager")
    const whitelist: Contract = await Whitelist.deploy()
    await whitelist.deployed()
    console.log('SportsClubAccessManager', whitelist.address)
    
    const Crowdsale: ContractFactory = await ethers.getContractFactory("SportsClubDAOcrowdsale")
    const crowdsale: Contract = await Crowdsale.deploy(whitelist.address, wethAddress)
    await crowdsale.deployed()
    console.log('SportsClubDAOcrowdsale', crowdsale.address)

    const Redemption: ContractFactory = await ethers.getContractFactory("SportsClubDAOredemption")
    const redemption: Contract = await Redemption.deploy()
    await redemption.deployed()
    console.log('SportsClubDAOredemption', redemption.address)

    const SportsClubERC20factory: ContractFactory = await ethers.getContractFactory("SportsClubERC20factory")
    const sportsclubERC20Factory: Contract = await SportsClubERC20factory.deploy(proposer.address)
    await sportsclubERC20Factory.deployed()
    console.log('SportsClubERC20factory', sportsclubERC20Factory.address)
  }
);