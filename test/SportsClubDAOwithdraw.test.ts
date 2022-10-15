import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import chai from "chai";

chai.should()

// Defaults to e18 using amount * 10^18
function getBigNumber(amount: any, decimals = 18) {
  return BigNumber.from(amount).mul(BigNumber.from(10).pow(decimals))
}

async function advanceTime(time: any) {
  await ethers.provider.send("evm_increaseTime", [time])
}

describe("Withdraw", function () {
  const wethAddress: any = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

  let SportsClub: any // SportsClubDAO contract
  let sportsclub: any // SportsClubDAO contract instance
  let PurchaseToken: any // PurchaseToken contract
  let purchaseToken: any // PurchaseToken contract instance
  let Whitelist: any // Whitelist contract
  let whitelist: any // Whitelist contract instance
  let Crowdsale: any // Crowdsale contract
  let crowdsale: any // Crowdsale contract instance
  let proposer: any // signerA -- Also acts as admin address that can withdraw ETH from DAOs
  let alice: any // signerB

  beforeEach(async () => {
    const blockNumber = await ethers.provider.getBlockNumber();
    const timestamp = (await ethers.provider.getBlock(blockNumber)).timestamp;
    const oneHourInTheFuture = timestamp + 3600;

    ;[proposer, alice] = await ethers.getSigners()

    SportsClub = await ethers.getContractFactory("SportsClubDAO")
    sportsclub = await SportsClub.deploy()
    await sportsclub.deployed()

    PurchaseToken = await ethers.getContractFactory("SportsClubERC20")
    purchaseToken = await PurchaseToken.deploy()
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

    Whitelist = await ethers.getContractFactory("SportsClubAccessManager")
    whitelist = await Whitelist.deploy()
    await whitelist.deployed()
    
    Crowdsale = await ethers.getContractFactory("SportsClubDAOcrowdsale")
    crowdsale = await Crowdsale.deploy(whitelist.address, wethAddress)
    await crowdsale.deployed()

    // Instantiate SportsClubDAO
    await sportsclub.init(
      "SPORTSCLUB",
      "SPORTSCLUB",
      "DOCS",
      false,
      [],
      [],
      [proposer.address],
      [getBigNumber(10)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      proposer.address
    )

    // Set up payload for extension proposal
    let payload = ethers.utils.defaultAbiCoder.encode(
        ["uint256", "uint8", "address", "uint32", "uint96", "uint96", "string"],
            [
                0,
                2,
                "0x0000000000000000000000000000000000000000",
                oneHourInTheFuture,
                getBigNumber(200),
                getBigNumber(100),
                "DOCS"
            ]
    )

    await sportsclub.propose(9, "TEST", [crowdsale.address], [1], [payload])
    await sportsclub.vote(1, true)
    await advanceTime(35)
    await sportsclub.processProposal(1)
    await crowdsale 
        .callExtension(sportsclub.address, getBigNumber(50), {
            value: getBigNumber(50),
    })
    await crowdsale 
        .connect(alice)
        .callExtension(sportsclub.address, getBigNumber(50), {
            value: getBigNumber(50),
    })
    expect(await ethers.provider.getBalance(sportsclub.address)).to.equal(
        getBigNumber(100)
    )
    expect(await sportsclub.balanceOf(proposer.address)).to.equal(getBigNumber(110))
    expect(await sportsclub.balanceOf(alice.address)).to.equal(getBigNumber(100))
  })

  it("Reward Distributor address should be set", async function () {
    expect(await sportsclub.rewardDistributor()).to.equal(proposer.address);
  })

  it("Reward Distributor can withdraw ETH from a SportsClubDAO", async function () {
    const balanceBeforeWithdraw = await ethers.provider.getBalance(proposer.address);

    const tx = await sportsclub.withdraw(proposer.address, getBigNumber(50));
    const receipt = await tx.wait();
    const ethSpentForGas = receipt.gasUsed.mul(receipt.effectiveGasPrice);

    expect(await ethers.provider.getBalance(sportsclub.address)).to.equal(getBigNumber(50));
    expect(await ethers.provider.getBalance(proposer.address))
      .to.equal(balanceBeforeWithdraw.sub(ethSpentForGas).add(getBigNumber(50)));
  })
});