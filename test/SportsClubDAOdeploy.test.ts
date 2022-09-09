import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import chai from "chai";
import { expect } from "chai";

chai.should()

// Defaults to e18 using amount * 10^18
function getBigNumber(amount: any, decimals = 18) {
  return BigNumber.from(amount).mul(BigNumber.from(10).pow(decimals))
}

describe("Deployer", function () {
    let SportsClub: any // SportsClubDAO contract
    let sportsclub: any // SportsClubDAO contract instance
    let alice: any // signerA
    let bob: any // signerB
    let carol: any // signerC
  
    beforeEach(async () => {
      ;[alice, bob, carol] = await ethers.getSigners()
  
      SportsClub = await ethers.getContractFactory("SportsClubDAO")
      sportsclub = await SportsClub.deploy()
      await sportsclub.deployed()
    })
  
    it("Should deploy SportsClub DAO", async function () {
        // Instantiate SportsClubDAO
        await sportsclub.init(
          "SPORTSCLUB",
          "SPORTSCLUB",
          "DOCS",
          false,
          [],
          [],
          [alice.address],
          [getBigNumber(10)],
          [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        )

        expect(await sportsclub.balanceOf(alice.address)).to.equal(getBigNumber(10))
    })
  })
