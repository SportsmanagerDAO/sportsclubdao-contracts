const { BigNumber } = require("ethers")
const chai = require("chai")
const { expect } = require("chai")

const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

chai.should()

// Defaults to e18 using amount * 10^18
function getBigNumber(amount, decimals = 18) {
  return BigNumber.from(amount).mul(BigNumber.from(10).pow(decimals))
}

async function advanceTime(time) {
  await ethers.provider.send("evm_increaseTime", [time])
}

describe("Crowdsale", function () {
    let SportsClub // SportsClubDAO contract
    let sportsclub // SportsClubDAO contract instance
    let PurchaseToken // PurchaseToken contract
    let purchaseToken // PurchaseToken contract instance
    let Whitelist // Whitelist contract
    let whitelist // Whitelist contract instance
    let Crowdsale // Crowdsale contract
    let crowdsale // Crowdsale contract instance
    let proposer // signerA
    let alice // signerB
    let bob // signerC
  
    beforeEach(async () => {
      ;[proposer, alice, bob] = await ethers.getSigners()
  
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
    })
  
    it("Should allow unrestricted ETH crowdsale", async function () {
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
          [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        )

        // Set up payload for extension proposal
        let payload = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint8", "address", "uint32", "uint96", "uint96", "string"],
                [
                    0,
                    2,
                    "0x0000000000000000000000000000000000000000",
                    1672174799,
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

    it("Should allow restricted ETH crowdsale", async function () {
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
          [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        )

        // Set up whitelist
        await whitelist.createList(
            [proposer.address, alice.address],
            "0x074b43252ffb4a469154df5fb7fe4ecce30953ba8b7095fe1e006185f017ad10",
            "TEST_META"
        )

        // Set up payload for extension proposal
        let payload = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint8", "address", "uint32", "uint96", "uint96", "string"],
                [
                    1,
                    2,
                    "0x0000000000000000000000000000000000000000",
                    1672174799,
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

    it("Should forbid non-whitelisted participation in ETH crowdsale", async function () {
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
          [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        )

        // Set up whitelist
        await whitelist.createList(
            [proposer.address],
            "0x074b43252ffb4a469154df5fb7fe4ecce30953ba8b7095fe1e006185f017ad10",
            "TEST_META"
        )

        // Set up payload for extension proposal
        let payload = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint8", "address", "uint32", "uint96", "uint96", "string"],
                [
                    1,
                    2,
                    "0x0000000000000000000000000000000000000000",
                    1672174799,
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
        expect(await crowdsale 
            .connect(alice)
            .callExtension(sportsclub.address, getBigNumber(50), {
                value: getBigNumber(50),
        }).should.be.reverted)
        expect(await ethers.provider.getBalance(sportsclub.address)).to.equal(
            getBigNumber(50)
        )
        expect(await sportsclub.balanceOf(proposer.address)).to.equal(getBigNumber(110))
        expect(await sportsclub.balanceOf(alice.address)).to.equal(getBigNumber(0))
    })

    it("Should enforce personal purchase limit in ETH crowdsale", async function () {
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
          [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        )

        // Set up whitelist
        await whitelist.createList(
            [proposer.address],
            "0x074b43252ffb4a469154df5fb7fe4ecce30953ba8b7095fe1e006185f017ad10",
            "TEST_META"
        )

        // Set up payload for extension proposal
        let payload = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint8", "address", "uint32", "uint96", "uint96", "string"],
                [
                    1,
                    2,
                    "0x0000000000000000000000000000000000000000",
                    1672174799,
                    getBigNumber(1000),
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
        expect(await crowdsale 
            .callExtension(sportsclub.address, getBigNumber(50), {
                value: getBigNumber(50),
        }).should.be.reverted)
        expect(await ethers.provider.getBalance(sportsclub.address)).to.equal(
            getBigNumber(50)
        )
        expect(await sportsclub.balanceOf(proposer.address)).to.equal(getBigNumber(110))
    })

    it("Should enforce total purchase limit in ETH crowdsale", async function () {
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
          [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        )

        // Set up whitelist
        await whitelist.createList(
            [proposer.address],
            "0x074b43252ffb4a469154df5fb7fe4ecce30953ba8b7095fe1e006185f017ad10",
            "TEST_META"
        )

        // Set up payload for extension proposal
        let payload = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint8", "address", "uint32", "uint96", "uint96", "string"],
                [
                    1,
                    2,
                    "0x0000000000000000000000000000000000000000",
                    1672174799,
                    getBigNumber(150),
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
        expect(await crowdsale
            .connect(alice) 
            .callExtension(sportsclub.address, getBigNumber(50), {
                value: getBigNumber(50),
        }).should.be.reverted)
        expect(await ethers.provider.getBalance(sportsclub.address)).to.equal(
            getBigNumber(50)
        )
        expect(await sportsclub.balanceOf(proposer.address)).to.equal(getBigNumber(110))
        expect(await sportsclub.balanceOf(alice.address)).to.equal(getBigNumber(0))
    })

    it("Should allow unrestricted ERC20 crowdsale", async function () {
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
          [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        )

        await purchaseToken.approve(crowdsale.address, getBigNumber(50))

        // Set up payload for extension proposal
        let payload = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint8", "address", "uint32", "uint96", "uint96", "string"],
                [
                    0,
                    2,
                    purchaseToken.address,
                    1672174799,
                    getBigNumber(200),
                    getBigNumber(100),
                    "DOCS"
                ]
        )

        await sportsclub.propose(9, "TEST", [crowdsale.address], [1], [payload])
        await sportsclub.vote(1, true)
        await advanceTime(35)
        await sportsclub.processProposal(1)
        await crowdsale.callExtension(sportsclub.address, getBigNumber(50))
        expect(await purchaseToken.balanceOf(proposer.address)).to.equal(
            getBigNumber(950)
        )
        expect(await purchaseToken.balanceOf(sportsclub.address)).to.equal(
            getBigNumber(50)
        )
        expect(await sportsclub.balanceOf(proposer.address)).to.equal(getBigNumber(110))
    })

    it("Should allow restricted ERC20 crowdsale", async function () {
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
          [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        )

        await purchaseToken.approve(crowdsale.address, getBigNumber(50))

        // Set up whitelist
        await whitelist.createList(
            [proposer.address],
            "0x074b43252ffb4a469154df5fb7fe4ecce30953ba8b7095fe1e006185f017ad10",
            "TEST_META"
        )

        // Set up payload for extension proposal
        let payload = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint8", "address", "uint32", "uint96", "uint96", "string"],
                [
                    1,
                    2,
                    purchaseToken.address,
                    1672174799,
                    getBigNumber(200),
                    getBigNumber(100),
                    "DOCS"
                ]
        )

        await sportsclub.propose(9, "TEST", [crowdsale.address], [1], [payload])
        await sportsclub.vote(1, true)
        await advanceTime(35)
        await sportsclub.processProposal(1)
        await crowdsale.callExtension(sportsclub.address, getBigNumber(50))
        expect(await purchaseToken.balanceOf(proposer.address)).to.equal(
            getBigNumber(950)
        )
        expect(await purchaseToken.balanceOf(sportsclub.address)).to.equal(
            getBigNumber(50)
        )
        expect(await sportsclub.balanceOf(proposer.address)).to.equal(getBigNumber(110))
    })

    it("Should forbid non-whitelisted participation in ERC20 crowdsale", async function () {
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
          [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        )

        await purchaseToken.approve(crowdsale.address, getBigNumber(50))

        // Set up whitelist
        await whitelist.createList(
            [alice.address],
            "0x074b43252ffb4a469154df5fb7fe4ecce30953ba8b7095fe1e006185f017ad10",
            "TEST_META"
        )

        // Set up payload for extension proposal
        let payload = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint8", "address", "uint32", "uint96", "uint96", "string"],
                [
                    1,
                    2,
                    purchaseToken.address,
                    1672174799,
                    getBigNumber(200),
                    getBigNumber(100),
                    "DOCS"
                ]
        )

        await sportsclub.propose(9, "TEST", [crowdsale.address], [1], [payload])
        await sportsclub.vote(1, true)
        await advanceTime(35)
        await sportsclub.processProposal(1)
        expect(await crowdsale.callExtension(sportsclub.address, getBigNumber(50)).should.be.reverted)
        expect(await purchaseToken.balanceOf(proposer.address)).to.equal(
            getBigNumber(1000)
        )
        expect(await purchaseToken.balanceOf(sportsclub.address)).to.equal(
            getBigNumber(0)
        )
        expect(await sportsclub.balanceOf(proposer.address)).to.equal(getBigNumber(10))
    })

    it("Should enforce personal purchase limit in ERC20 crowdsale", async function () {
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
          [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        )

        await purchaseToken.approve(crowdsale.address, getBigNumber(500))

        // Set up whitelist
        await whitelist.createList(
            [proposer.address],
            "0x074b43252ffb4a469154df5fb7fe4ecce30953ba8b7095fe1e006185f017ad10",
            "TEST_META"
        )

        // Set up payload for extension proposal
        let payload = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint8", "address", "uint32", "uint96", "uint96", "string"],
                [
                    1,
                    2,
                    purchaseToken.address,
                    1672174799,
                    getBigNumber(1000),
                    getBigNumber(100),
                    "DOCS"
                ]
        )

        await sportsclub.propose(9, "TEST", [crowdsale.address], [1], [payload])
        await sportsclub.vote(1, true)
        await advanceTime(35)
        await sportsclub.processProposal(1)
        await crowdsale.callExtension(sportsclub.address, getBigNumber(50))
        expect(await crowdsale.callExtension(sportsclub.address, getBigNumber(50)).should.be.reverted)
        expect(await purchaseToken.balanceOf(proposer.address)).to.equal(
            getBigNumber(950)
        )
        expect(await purchaseToken.balanceOf(sportsclub.address)).to.equal(
            getBigNumber(50)
        )
        expect(await sportsclub.balanceOf(proposer.address)).to.equal(getBigNumber(110))
    })

    it("Should enforce total purchase limit in ERC20 crowdsale", async function () {
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
          [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        )

        await purchaseToken.approve(crowdsale.address, getBigNumber(500))

        // Set up whitelist
        await whitelist.createList(
            [proposer.address],
            "0x074b43252ffb4a469154df5fb7fe4ecce30953ba8b7095fe1e006185f017ad10",
            "TEST_META"
        )

        // Set up payload for extension proposal
        let payload = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint8", "address", "uint32", "uint96", "uint96", "string"],
                [
                    1,
                    2,
                    purchaseToken.address,
                    1672174799,
                    getBigNumber(150),
                    getBigNumber(100),
                    "DOCS"
                ]
        )

        await sportsclub.propose(9, "TEST", [crowdsale.address], [1], [payload])
        await sportsclub.vote(1, true)
        await advanceTime(35)
        await sportsclub.processProposal(1)
        await crowdsale.callExtension(sportsclub.address, getBigNumber(50))
        expect(await crowdsale.connect(alice.address).callExtension(sportsclub.address, getBigNumber(50)).should.be.reverted)
        expect(await purchaseToken.balanceOf(proposer.address)).to.equal(
            getBigNumber(950)
        )
        expect(await purchaseToken.balanceOf(sportsclub.address)).to.equal(
            getBigNumber(50)
        )
        expect(await sportsclub.balanceOf(proposer.address)).to.equal(getBigNumber(110))
        expect(await sportsclub.balanceOf(alice.address)).to.equal(getBigNumber(0))
    })

    it("Should enforce purchase time limit", async function () {
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
          [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        )

        // Set up payload for extension proposal
        let payload = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint8", "address", "uint32", "uint96", "uint96", "string"],
                [
                    0,
                    2,
                    "0x0000000000000000000000000000000000000000",
                    1672174799,
                    getBigNumber(200),
                    getBigNumber(100),
                    "DOCS"
                ]
        )

        await sportsclub.propose(9, "TEST", [crowdsale.address], [1], [payload])
        await sportsclub.vote(1, true)
        await advanceTime(35)
        await sportsclub.processProposal(1)
        await advanceTime(1672174799)
        expect(await crowdsale 
            .callExtension(sportsclub.address, getBigNumber(50), {
                value: getBigNumber(50),
        }).should.be.reverted)
        expect(await ethers.provider.getBalance(sportsclub.address)).to.equal(
            getBigNumber(0)
        )
    })

    it("Should allow SportsClub fee to be set", async function () {  
        await crowdsale.setSportsClubRate(5)
    })

    it("Should forbid non-owner from setting SportsClub fee", async function () {
        expect(await crowdsale.connect(alice.address).setSportsClubRate(5).should.be.reverted)
    })
})
