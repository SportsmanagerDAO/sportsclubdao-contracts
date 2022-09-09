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

describe("SportsClubDAO", function () {
  let SportsClub // SportsClubDAO contract
  let sportsclub // SportsClubDAO contract instance
  let proposer // signerA
  let alice // signerB
  let bob // signerC

  beforeEach(async () => {
    ;[proposer, alice, bob] = await ethers.getSigners()

    SportsClub = await ethers.getContractFactory("SportsClubDAO")
    sportsclub = await SportsClub.deploy()
    await sportsclub.deployed()
    // console.log(sportsclub.address)
    // console.log("alice eth balance", await alice.getBalance())
    // console.log("bob eth balance", await bob.getBalance())
  })

  it("Should initialize with correct params", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      false,
      [],
      [],
      [proposer.address],
      [getBigNumber(10)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 0, 1]
    )
    expect(await sportsclub.name()).to.equal("KALI")
    expect(await sportsclub.symbol()).to.equal("KALI")
    expect(await sportsclub.docs()).to.equal("DOCS")
    expect(await sportsclub.paused()).to.equal(false)
    expect(await sportsclub.balanceOf(proposer.address)).to.equal(getBigNumber(10))
    expect(await sportsclub.votingPeriod()).to.equal(30)
    expect(await sportsclub.gracePeriod()).to.equal(0)
    expect(await sportsclub.quorum()).to.equal(0)
    expect(await sportsclub.supermajority()).to.equal(60)
    expect(await sportsclub.proposalVoteTypes(0)).to.equal(0)
    expect(await sportsclub.proposalVoteTypes(1)).to.equal(0)
    expect(await sportsclub.proposalVoteTypes(2)).to.equal(0)
    expect(await sportsclub.proposalVoteTypes(3)).to.equal(0)
    expect(await sportsclub.proposalVoteTypes(4)).to.equal(0)
    expect(await sportsclub.proposalVoteTypes(5)).to.equal(0)
    expect(await sportsclub.proposalVoteTypes(6)).to.equal(0)
    expect(await sportsclub.proposalVoteTypes(7)).to.equal(1)
    expect(await sportsclub.proposalVoteTypes(8)).to.equal(2)
    expect(await sportsclub.proposalVoteTypes(9)).to.equal(3)
    expect(await sportsclub.proposalVoteTypes(10)).to.equal(0)
    expect(await sportsclub.proposalVoteTypes(11)).to.equal(1)
  })
  it("Should revert if initialization gov settings exceed bounds", async function () {
    expect(await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      false,
      [],
      [],
      [proposer.address],
      [getBigNumber(10)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 0, 1, 1]
    ).should.be.reverted)
    expect(await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      false,
      [],
      [],
      [proposer.address],
      [getBigNumber(10)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 0, 9]
    ).should.be.reverted)
  })
  it("Should revert if initialization arrays don't match", async function () {
    expect(await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      false,
      [bob.address],
      [],
      [bob.address],
      [getBigNumber(10)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ).should.be.reverted)
    expect(await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      false,
      [],
      [],
      [bob.address, alice.address],
      [getBigNumber(10)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ).should.be.reverted)
  })
  it("Should revert if already initialized", async function () {
    expect(await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      false,
      [],
      [],
      [bob.address],
      [getBigNumber(10)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ))
    expect(await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      false,
      [],
      [],
      [bob.address],
      [getBigNumber(10)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ).should.be.reverted)
  })
  it("Should revert if voting period is initialized null or longer than year", async function () {
    expect(await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      false,
      [],
      [],
      [bob.address],
      [getBigNumber(10)],
      [0, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ).should.be.reverted)
    expect(await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      false,
      [],
      [],
      [bob.address],
      [getBigNumber(10)],
      [31536001, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ).should.be.reverted)
  })
  it("Should revert if grace period is initialized longer than year", async function () {
    expect(await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      false,
      [],
      [],
      [bob.address],
      [getBigNumber(10)],
      [30, 31536001, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ).should.be.reverted)
  })
  it("Should revert if quorum is initialized greater than 100", async function () {
    expect(await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      false,
      [],
      [],
      [bob.address],
      [getBigNumber(10)],
      [30, 0, 101, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ).should.be.reverted)
  })
  it("Should revert if supermajority is initialized less than 52 or greater than 100", async function () {
    expect(await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      false,
      [],
      [],
      [bob.address],
      [getBigNumber(10)],
      [30, 0, 0, 51, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ).should.be.reverted)
    expect(await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      false,
      [],
      [],
      [bob.address],
      [getBigNumber(10)],
      [30, 0, 0, 101, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ).should.be.reverted)
  })
  it("Should revert if proposal arrays don't match", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [bob.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    expect(await sportsclub.propose(
      0,
      "TEST",
      [bob.address, alice.address],
      [getBigNumber(1000)],
      [0x00]
    ).should.be.reverted)
  })
  it("Should revert if period proposal is for null or longer than year", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [bob.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    // normal
    await sportsclub.propose(
      3,
      "TEST",
      [bob.address],
      [9000],
      [0x00]
    )
    expect(await sportsclub.propose(
      3,
      "TEST",
      [bob.address],
      [0],
      [0x00]
    ).should.be.reverted)
    expect(await sportsclub.propose(
      3,
      "TEST",
      [bob.address],
      [31536001],
      [0x00]
    ).should.be.reverted)
  })
  it("Should revert if grace proposal is for longer than year", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [bob.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    // normal
    await sportsclub.propose(
      4,
      "TEST",
      [bob.address],
      [9000],
      [0x00]
    )
    expect(await sportsclub.propose(
      4,
      "TEST",
      [bob.address],
      [31536001],
      [0x00]
    ).should.be.reverted)
  })
  it("Should revert if quorum proposal is for greater than 100", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [bob.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    // normal
    await sportsclub.propose(
      5,
      "TEST",
      [bob.address],
      [20],
      [0x00]
    )
    expect(await sportsclub.propose(
      5,
      "TEST",
      [bob.address],
      [101],
      [0x00]
    ).should.be.reverted)
  })
  it("Should revert if supermajority proposal is for less than 52 or greater than 100", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [bob.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    // normal
    await sportsclub.propose(
      6,
      "TEST",
      [bob.address],
      [60],
      [0x00]
    )
    expect(await sportsclub.propose(
      6,
      "TEST",
      [bob.address],
      [51],
      [0x00]
    ).should.be.reverted)
    expect(await sportsclub.propose(
      6,
      "TEST",
      [bob.address],
      [101],
      [0x00]
    ).should.be.reverted)
  })
  it("Should revert if type proposal has proposal type greater than 10, vote type greater than 3, or setting length isn't 2", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [bob.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    // normal
    await sportsclub.propose(
      7,
      "TEST",
      [bob.address, alice.address],
      [0, 1],
      [0x00, 0x00]
    )
    expect(await sportsclub.propose(
      7,
      "TEST",
      [bob.address, alice.address],
      [12, 2],
      [0x00, 0x00]
    ).should.be.reverted)
    expect(await sportsclub.propose(
      7,
      "TEST",
      [bob.address, alice.address],
      [0, 5],
      [0x00, 0x00]
    ).should.be.reverted)
    expect(await sportsclub.propose(
      7,
      "TEST",
      [proposer.address, bob.address, alice.address],
      [0, 1, 0],
      [0x00, 0x00, 0x00]
    ).should.be.reverted)
  })
  it("Should allow proposer to cancel unsponsored proposal", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.connect(alice).propose(
      0,
      "TEST",
      [alice.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await sportsclub.connect(alice).cancelProposal(1)
  })
  it("Should forbid non-proposer from cancelling unsponsored proposal", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.connect(alice).propose(
      0,
      "TEST",
      [alice.address],
      [getBigNumber(1000)],
      [0x00]
    )
    expect(await sportsclub.cancelProposal(0).should.be.reverted)
  })
  it("Should forbid proposer from cancelling sponsored proposal", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.connect(alice).propose(
      0,
      "TEST",
      [alice.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await sportsclub.sponsorProposal(1)
    expect(await sportsclub.connect(alice).cancelProposal(1).should.be.reverted)
  })
  it("Should forbid cancelling non-existent proposal", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.connect(alice).propose(
      0,
      "TEST",
      [alice.address],
      [getBigNumber(1000)],
      [0x00]
    )
    expect(await sportsclub.connect(alice).cancelProposal(10).should.be.reverted)
  })
  it("Should allow sponsoring proposal and processing", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.connect(alice).propose(
      0,
      "TEST",
      [alice.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await sportsclub.sponsorProposal(1)
    await sportsclub.vote(1, true)
    await advanceTime(35)
    await sportsclub.processProposal(1)
    expect(await sportsclub.balanceOf(alice.address)).to.equal(getBigNumber(1000))
  })
  it("Should forbid non-member from sponsoring proposal", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.connect(alice).propose(
      0,
      "TEST",
      [alice.address],
      [getBigNumber(1000)],
      [0x00]
    )
    expect(await sportsclub.connect(alice).sponsorProposal(0).should.be.reverted)
  })
  it("Should forbid sponsoring non-existent or processed proposal", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.connect(alice).propose(
      0,
      "TEST",
      [alice.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await sportsclub.sponsorProposal(1)
    await sportsclub.vote(1, true)
    await advanceTime(35)
    await sportsclub.processProposal(1)
    expect(await sportsclub.balanceOf(alice.address)).to.equal(getBigNumber(1000))
    expect(await sportsclub.sponsorProposal(1).should.be.reverted)
    expect(await sportsclub.sponsorProposal(100).should.be.reverted)
  })
  it("Should forbid sponsoring an already sponsored proposal", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.connect(alice).propose(
      0,
      "TEST",
      [alice.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await sportsclub.sponsorProposal(1)
    expect(await sportsclub.sponsorProposal(1).should.be.reverted)
  })
  it("Should allow self-sponsorship by a member", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.propose(
      0,
      "TEST",
      [proposer.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await sportsclub.vote(1, true)
  })
  it("Should forbid a member from voting again on proposal", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.propose(
      0,
      "TEST",
      [proposer.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await sportsclub.vote(1, true)
    expect(await sportsclub.vote(1, true).should.be.reverted)
  })
  it("Should forbid voting after period ends", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.propose(
      0,
      "TEST",
      [proposer.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await advanceTime(35)
    expect(await sportsclub.vote(1, true).should.be.reverted)
  })
  it("Should forbid processing before voting period ends", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.propose(
      0,
      "TEST",
      [proposer.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await sportsclub.vote(1, true)
    await advanceTime(29)
    expect(await sportsclub.processProposal(1).should.be.reverted)
  })
  it("Should forbid processing before grace period ends", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 30, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.propose(
      0,
      "TEST",
      [proposer.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await advanceTime(29)
    await sportsclub.vote(1, true)
    expect(await sportsclub.processProposal(1).should.be.reverted)
  })
  it("Should process membership proposal", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.propose(
      0,
      "TEST",
      [proposer.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await sportsclub.vote(1, true)
    await advanceTime(35)
    await sportsclub.processProposal(1)
    expect(await sportsclub.balanceOf(proposer.address)).to.equal(getBigNumber(1001))
  })
  it("voteBySig should revert if the signature is invalid", async () => {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.propose(0, "TEST", [alice.address], [0], [0x00])
    const rs = ethers.utils.formatBytes32String("rs")
    expect(
      sportsclub.voteBySig(proposer.address, 0, true, 0, rs, rs).should.be.reverted
    )
  })
  it("Should process membership proposal via voteBySig", async () => {
    const domain = {
      name: "KALI",
      version: "1",
      chainId: 31337,
      verifyingContract: sportsclub.address,
    }
    const types = {
      SignVote: [
        { name: "signer", type: "address" },
        { name: "proposal", type: "uint256" },
        { name: "approve", type: "bool" },
      ],
    }
    const value = {
      signer: proposer.address,
      proposal: 1,
      approve: true,
    }

    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.propose(0, "TEST", [alice.address], [getBigNumber(1000)], [0x00])

    const signature = await proposer._signTypedData(domain, types, value)
    const { r, s, v } = ethers.utils.splitSignature(signature)

    await sportsclub.voteBySig(proposer.address, 1, true, v, r, s)
    await advanceTime(35)
    await sportsclub.processProposal(1)
    expect(await sportsclub.balanceOf(alice.address)).to.equal(getBigNumber(1000))
  })
  it("Should process burn (eviction) proposal", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.propose(1, "TEST", [proposer.address], [getBigNumber(1)], [0x00])
    await sportsclub.vote(1, true)
    await advanceTime(35)
    await sportsclub.processProposal(1)
    expect(await sportsclub.balanceOf(proposer.address)).to.equal(0)
  })
  it("Should process contract call proposal - Single", async function () {
    let SportsClubERC20 = await ethers.getContractFactory("SportsClubERC20")
    let sportsclubERC20 = await SportsClubERC20.deploy()
    await sportsclubERC20.deployed()
    await sportsclubERC20.init(
      "KALI",
      "KALI",
      "DOCS",
      [sportsclub.address],
      [getBigNumber(100)],
      false,
      sportsclub.address
    )
    let payload = sportsclubERC20.interface.encodeFunctionData("transfer", [
      alice.address,
      getBigNumber(15)
    ])
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.propose(2, "TEST", [sportsclubERC20.address], [0], [payload])
    await sportsclub.vote(1, true)
    await advanceTime(35)
    await sportsclub.processProposal(1)
    expect(await sportsclubERC20.totalSupply()).to.equal(getBigNumber(100))
    expect(await sportsclubERC20.balanceOf(alice.address)).to.equal(getBigNumber(15))
  })
  it("Should process contract call proposal - Multiple", async function () {
    // Send Eth to SportsClub
    proposer.sendTransaction({
      to: sportsclub.address,
      value: getBigNumber(10),
    })
    // Instantiate 1st contract
    let SportsClubERC20 = await ethers.getContractFactory("SportsClubERC20")
    let sportsclubERC20 = await SportsClubERC20.deploy()
    await sportsclubERC20.deployed()
    await sportsclubERC20.init(
      "KALI",
      "KALI",
      "DOCS",
      [sportsclub.address],
      [getBigNumber(100)],
      false,
      sportsclub.address
    )
    let payload = sportsclubERC20.interface.encodeFunctionData("transfer", [
      alice.address,
      getBigNumber(15)
    ])
    // Instantiate 2nd contract
    let DropETH = await ethers.getContractFactory("DropETH")
    let dropETH = await DropETH.deploy()
    await dropETH.deployed()
    let payload2 = dropETH.interface.encodeFunctionData("dropETH", [
      [alice.address, bob.address],
      "hello",
    ])
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.propose(
      2,
      "TEST",
      [sportsclubERC20.address, dropETH.address],
      [0, getBigNumber(4)],
      [payload, payload2]
    )
    await sportsclub.vote(1, true)
    await advanceTime(35)
    await sportsclub.processProposal(1)
    expect(await sportsclubERC20.totalSupply()).to.equal(getBigNumber(100))
    expect(await sportsclubERC20.balanceOf(alice.address)).to.equal(getBigNumber(15))
    expect(await dropETH.amount()).to.equal(getBigNumber(2))
    expect(await dropETH.recipients(1)).to.equal(bob.address)
  })
  it("Should process voting period proposal", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    expect(await sportsclub.votingPeriod()).to.equal(30)
    await sportsclub.propose(3, "TEST", [proposer.address], [90], [0x00])
    await sportsclub.vote(1, true)
    await advanceTime(35)
    await sportsclub.processProposal(1)
    expect(await sportsclub.votingPeriod()).to.equal(90)
  })
  it("Should process grace period proposal", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [90, 30, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    expect(await sportsclub.gracePeriod()).to.equal(30)
    await sportsclub.propose(4, "TEST", [proposer.address], [60], [0x00])
    await sportsclub.vote(1, true)
    await advanceTime(125)
    await sportsclub.processProposal(1)
    expect(await sportsclub.gracePeriod()).to.equal(60)
  })
  it("Should process quorum proposal", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.propose(5, "TEST", [proposer.address], [100], [0x00])
    await sportsclub.vote(1, true)
    await advanceTime(35)
    await sportsclub.processProposal(1)
    expect(await sportsclub.quorum()).to.equal(100)
  })
  it("Should process supermajority proposal", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.propose(6, "TEST", [proposer.address], [52], [0x00])
    await sportsclub.vote(1, true)
    await advanceTime(35)
    await sportsclub.processProposal(1)
    expect(await sportsclub.supermajority()).to.equal(52)
  })
  it("Should process type proposal", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.propose(
      7,
      "TEST",
      [proposer.address, proposer.address],
      [0, 3],
      [0x00, 0x00]
    )
    await sportsclub.vote(1, true)
    await advanceTime(35)
    await sportsclub.processProposal(1)
    expect(await sportsclub.proposalVoteTypes(0)).to.equal(3)
  })
  it("Should process pause proposal", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.propose(8, "TEST", [proposer.address], [0], [0x00])
    await sportsclub.vote(1, true)
    await advanceTime(35)
    await sportsclub.processProposal(1)
    expect(await sportsclub.paused()).to.equal(false)
  })
  it("Should process extension proposal - General", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.propose(9, "TEST", [wethAddress], [0], [0x00])
    await sportsclub.vote(1, true)
    await advanceTime(35)
    await sportsclub.processProposal(1)
    expect(await sportsclub.extensions(wethAddress)).to.equal(false)
  })
  it("Should toggle extension proposal", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.propose(9, "TEST", [wethAddress], [1], [0x00])
    await sportsclub.vote(1, true)
    await advanceTime(35)
    await sportsclub.processProposal(1)
    expect(await sportsclub.extensions(wethAddress)).to.equal(true)
  })
  it("Should process extension proposal - SportsClubDAOcrowdsale with ETH", async function () {
    // Instantiate SportsClubDAO
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    // Instantiate SportsClubWhiteListManager
    let SportsClubWhitelistManager = await ethers.getContractFactory(
      "SportsClubAccessManager"
    )
    let sportsclubWhitelistManager = await SportsClubWhitelistManager.deploy()
    await sportsclubWhitelistManager.deployed()
    // Instantiate extension contract
    let SportsClubDAOcrowdsale = await ethers.getContractFactory("SportsClubDAOcrowdsale")
    let sportsclubDAOcrowdsale = await SportsClubDAOcrowdsale.deploy(
      sportsclubWhitelistManager.address,
      wethAddress
    )
    await sportsclubDAOcrowdsale.deployed()
    // Set up whitelist
    await sportsclubWhitelistManager.createList(
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
        "0x0000000000000000000000000000000000000000",
        1672174799,
        getBigNumber(1000),
        getBigNumber(100),
        "DOCS"
      ]
    )
    await sportsclub.propose(9, "TEST", [sportsclubDAOcrowdsale.address], [1], [payload])
    await sportsclub.vote(1, true)
    await advanceTime(35)
    await sportsclub.processProposal(1)
    await sportsclubDAOcrowdsale 
      .connect(alice)
      .callExtension(sportsclub.address, getBigNumber(50), {
        value: getBigNumber(50),
      })
    expect(await ethers.provider.getBalance(sportsclub.address)).to.equal(
      getBigNumber(50)
    )
    expect(await sportsclub.balanceOf(alice.address)).to.equal(getBigNumber(100))
  })
  it("Should process extension proposal - SportsClubDAOcrowdsale with ERC20", async function () {
    // Instantiate purchaseToken
    let PurchaseToken = await ethers.getContractFactory("SportsClubERC20")
    let purchaseToken = await PurchaseToken.deploy()
    await purchaseToken.deployed()
    await purchaseToken.init(
      "KALI",
      "KALI",
      "DOCS",
      [alice.address],
      [getBigNumber(1000)],
      false,
      alice.address
    )
    await purchaseToken.deployed()
    // Instantiate SportsClubDAO
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    // Instantiate SportsClubWhiteListManager
    let SportsClubWhitelistManager = await ethers.getContractFactory(
      "SportsClubAccessManager"
    )
    let sportsclubWhitelistManager = await SportsClubWhitelistManager.deploy()
    await sportsclubWhitelistManager.deployed()
    // Instantiate extension contract
    let SportsClubDAOcrowdsale = await ethers.getContractFactory("SportsClubDAOcrowdsale")
    let sportsclubDAOcrowdsale = await SportsClubDAOcrowdsale.deploy(
      sportsclubWhitelistManager.address,
      wethAddress
    )
    await sportsclubDAOcrowdsale.deployed()
    // Set up whitelist
    await sportsclubWhitelistManager.createList(
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
        getBigNumber(1000),
        getBigNumber(100),
        "DOCS"
      ]
    )
    await sportsclub.propose(9, "TEST", [sportsclubDAOcrowdsale.address], [1], [payload])
    await sportsclub.vote(1, true)
    await advanceTime(35)
    await sportsclub.processProposal(1)
    await purchaseToken
      .connect(alice)
      .approve(sportsclubDAOcrowdsale.address, getBigNumber(50))
    await sportsclubDAOcrowdsale
      .connect(alice)
      .callExtension(sportsclub.address, getBigNumber(50))
    expect(await purchaseToken.balanceOf(sportsclub.address)).to.equal(
      getBigNumber(50)
    )
    expect(await sportsclub.balanceOf(alice.address)).to.equal(getBigNumber(100))
  })
  it("Should process escape proposal", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.propose(
      0,
      "TEST",
      [proposer.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await sportsclub.vote(1, true)
    await sportsclub.propose(
      0,
      "TEST",
      [proposer.address],
      [getBigNumber(99)],
      [0x00]
    )
    await sportsclub.vote(2, false)
    await sportsclub.propose(10, "TEST", [proposer.address], [2], [0x00])
    await sportsclub.vote(3, true)
    await advanceTime(35)
    await sportsclub.processProposal(3)
    // Proposal #1 remains intact
    // console.log(await sportsclub.proposals(0))
    // Proposal #2 deleted
    // console.log(await sportsclub.proposals(1))
  })
  it("Should process docs proposal", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.propose(11, "TEST", [], [], [])
    await sportsclub.vote(1, true)
    await advanceTime(35)
    await sportsclub.processProposal(1)
    expect(await sportsclub.docs()).to.equal("TEST")
  })
  it("Should forbid processing a non-existent proposal", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    expect(await sportsclub.processProposal(2).should.be.reverted)
  })
  it("Should forbid processing a proposal that was already processed", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.propose(
      0,
      "TEST",
      [proposer.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await sportsclub.vote(1, true)
    await advanceTime(35)
    await sportsclub.processProposal(1)
    expect(await sportsclub.processProposal(1).should.be.reverted)
  })
  it("Should forbid processing a proposal before voting period ends", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.propose(
      0,
      "TEST",
      [proposer.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await sportsclub.vote(1, true)
    await advanceTime(20)
    expect(await sportsclub.processProposal(1).should.be.reverted)
  })
  it("Should forbid processing a proposal before previous processes", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    // normal
    await sportsclub.propose(
      0,
      "TEST",
      [proposer.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await sportsclub.vote(1, true)
    await advanceTime(35)
    await sportsclub.processProposal(1)
    // check case
    await sportsclub.propose(
      0,
      "TEST",
      [proposer.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await sportsclub.vote(2, true)
    await sportsclub.propose(
      0,
      "TEST",
      [proposer.address],
      [getBigNumber(1000)],
      [0x00]
    )
    await sportsclub.vote(3, true)
    await advanceTime(35)
    expect(await sportsclub.processProposal(3).should.be.reverted)
    await sportsclub.processProposal(2)
    await sportsclub.processProposal(3)
  })
  it("Should forbid calling a non-whitelisted extension", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    expect(await sportsclub.callExtension(wethAddress, 10, 0x0).should.be.reverted)
  })
  it("Should forbid non-whitelisted extension calling DAO", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    expect(await sportsclub.connect(alice).callExtension(bob.address, 10, 0x0).should.be.reverted)
  })
  it("Should allow a member to transfer shares", async function () {
    let sender, receiver
    ;[sender, receiver] = await ethers.getSigners()

    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      false,
      [],
      [],
      [sender.address],
      [getBigNumber(10)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.transfer(receiver.address, getBigNumber(4))
    expect(await sportsclub.balanceOf(sender.address)).to.equal(getBigNumber(6))
    expect(await sportsclub.balanceOf(receiver.address)).to.equal(getBigNumber(4))
    // console.log(await sportsclub.balanceOf(sender.address))
    // console.log(await sportsclub.balanceOf(receiver.address))
  })
  it("Should not allow a member to transfer excess shares", async function () {
    let sender, receiver
    ;[sender, receiver] = await ethers.getSigners()

    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      false,
      [],
      [],
      [sender.address],
      [getBigNumber(10)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    expect(
      await sportsclub.transfer(receiver.address, getBigNumber(11)).should.be.reverted
    )
  })
  it("Should not allow a member to transfer shares if paused", async function () {
    let sender, receiver
    ;[sender, receiver] = await ethers.getSigners()

    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [sender.address],
      [getBigNumber(10)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    expect(
      await sportsclub.transfer(receiver.address, getBigNumber(1)).should.be.reverted
    )
  })
  it("Should allow a member to burn shares", async function () {
    let sender, receiver
    ;[sender, receiver] = await ethers.getSigners()

    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [sender.address],
      [getBigNumber(10)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.burn(getBigNumber(1))
  })
  it("Should not allow a member to burn excess shares", async function () {
    let sender, receiver
    ;[sender, receiver] = await ethers.getSigners()

    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [sender.address],
      [getBigNumber(10)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    expect(
      await sportsclub.burn(getBigNumber(11)).should.be.reverted
    )
  })
  it("Should allow a member to approve burn of shares (burnFrom)", async function () {
    let sender, receiver
    ;[sender, receiver] = await ethers.getSigners()

    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [sender.address],
      [getBigNumber(10)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.approve(receiver.address, getBigNumber(1))
    expect(await sportsclub.allowance(sender.address, receiver.address)).to.equal(getBigNumber(1))
    await sportsclub.connect(receiver).burnFrom(sender.address, getBigNumber(1))
  })
  it("Should not allow a member to approve excess burn of shares (burnFrom)", async function () {
    let sender, receiver
    ;[sender, receiver] = await ethers.getSigners()

    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [sender.address],
      [getBigNumber(10)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.approve(receiver.address, getBigNumber(1))
    expect(await sportsclub.allowance(sender.address, receiver.address)).to.equal(getBigNumber(1))
    expect(await sportsclub.connect(receiver).burnFrom(sender.address, getBigNumber(8)).should.be.reverted)
    expect(await sportsclub.connect(receiver).burnFrom(sender.address, getBigNumber(11)).should.be.reverted)
  })
  it("Should allow a member to approve pull transfers", async function () {
    let sender, receiver
    ;[sender, receiver] = await ethers.getSigners()

    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      false,
      [],
      [],
      [sender.address],
      [getBigNumber(10)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.approve(receiver.address, getBigNumber(4))
    expect(await sportsclub.allowance(sender.address, receiver.address)).to.equal(getBigNumber(4))
  })
  it("Should allow an approved account to pull transfer (transferFrom)", async function () {
    let sender, receiver
    ;[sender, receiver] = await ethers.getSigners()

    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      false,
      [],
      [],
      [sender.address],
      [getBigNumber(10)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.approve(receiver.address, getBigNumber(4))
    expect(await sportsclub.allowance(sender.address, receiver.address)).to.equal(getBigNumber(4))
    await sportsclub.connect(receiver).transferFrom(sender.address, receiver.address, getBigNumber(4))
  })
  it("Should not allow an account to pull transfer (transferFrom) beyond approval", async function () {
    let sender, receiver
    ;[sender, receiver] = await ethers.getSigners()

    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      false,
      [],
      [],
      [sender.address],
      [getBigNumber(10)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.approve(receiver.address, getBigNumber(4))
    expect(await sportsclub.allowance(sender.address, receiver.address)).to.equal(getBigNumber(4))
    expect(await sportsclub.connect(receiver).transferFrom(sender.address, receiver.address, getBigNumber(5)).should.be.reverted)
  })
  it("Should not allow an approved account to pull transfer (transferFrom) if paused", async function () {
    let sender, receiver
    ;[sender, receiver] = await ethers.getSigners()

    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [sender.address],
      [getBigNumber(10)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.approve(receiver.address, getBigNumber(4))
    expect(await sportsclub.allowance(sender.address, receiver.address)).to.equal(getBigNumber(4))
    expect(await sportsclub.connect(receiver).transferFrom(sender.address, receiver.address, getBigNumber(4)).should.be.reverted)
  })
  it("Should not allow vote tally after current timestamp", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [bob.address],
      [getBigNumber(10)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    expect(
      await sportsclub.getPriorVotes(bob.address, 1941275221).should.be.reverted
    )
  })
  it("Should list member as 'delegate' if no delegation to others", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [bob.address],
      [getBigNumber(10)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    expect(await sportsclub.delegates(bob.address)).to.equal(bob.address)
  })
  it("Should match current votes to undelegated balance", async function () {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [bob.address],
      [getBigNumber(10)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    expect(await sportsclub.getCurrentVotes(bob.address)).to.equal(getBigNumber(10))
  })
  it("Should allow vote delegation", async function () {
    let sender, receiver
    ;[sender, receiver] = await ethers.getSigners()

    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [sender.address],
      [getBigNumber(10)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.delegate(receiver.address)
    expect(await sportsclub.delegates(sender.address)).to.equal(receiver.address)
    expect(await sportsclub.getCurrentVotes(sender.address)).to.equal(0)
    expect(await sportsclub.getCurrentVotes(receiver.address)).to.equal(getBigNumber(10))
    expect(await sportsclub.balanceOf(sender.address)).to.equal(getBigNumber(10))
    expect(await sportsclub.balanceOf(receiver.address)).to.equal(0)
    await sportsclub.delegate(sender.address)
    expect(await sportsclub.delegates(sender.address)).to.equal(sender.address)
    expect(await sportsclub.getCurrentVotes(sender.address)).to.equal(getBigNumber(10))
    expect(await sportsclub.getCurrentVotes(receiver.address)).to.equal(0)
  })
  it("Should update delegated balance after transfer", async function () {
    let sender, receiver, receiver2
    ;[sender, receiver, receiver2] = await ethers.getSigners()

    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      false,
      [],
      [],
      [sender.address],
      [getBigNumber(10)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.delegate(receiver.address)
    expect(await sportsclub.getCurrentVotes(sender.address)).to.equal(0)
    expect(await sportsclub.getCurrentVotes(receiver.address)).to.equal(getBigNumber(10))
    await sportsclub.transfer(receiver2.address, getBigNumber(5))
    expect(await sportsclub.getCurrentVotes(receiver2.address)).to.equal(getBigNumber(5))
    expect(await sportsclub.getCurrentVotes(sender.address)).to.equal(0)
    expect(await sportsclub.getCurrentVotes(receiver.address)).to.equal(getBigNumber(5))
    await sportsclub.delegate(sender.address)
    expect(await sportsclub.getCurrentVotes(sender.address)).to.equal(getBigNumber(5))
  })
  it("Should update delegated balance after pull transfer (transferFrom)", async function () {
    let sender, receiver, receiver2
    ;[sender, receiver, receiver2] = await ethers.getSigners()

    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      false,
      [],
      [],
      [sender.address],
      [getBigNumber(10)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    await sportsclub.delegate(receiver.address)
    expect(await sportsclub.getCurrentVotes(sender.address)).to.equal(0)
    expect(await sportsclub.getCurrentVotes(receiver.address)).to.equal(getBigNumber(10))
    await sportsclub.approve(receiver.address, getBigNumber(5))
    await sportsclub.connect(receiver).transferFrom(sender.address, receiver2.address, getBigNumber(5))
    expect(await sportsclub.getCurrentVotes(receiver2.address)).to.equal(getBigNumber(5))
    expect(await sportsclub.getCurrentVotes(sender.address)).to.equal(0)
    expect(await sportsclub.getCurrentVotes(receiver.address)).to.equal(getBigNumber(5))
    await sportsclub.delegate(sender.address)
    expect(await sportsclub.getCurrentVotes(sender.address)).to.equal(getBigNumber(5))
  })
  it("Should allow permit if the signature is valid", async () => {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    const domain = {
      name: "KALI",
      version: "1",
      chainId: 31337,
      verifyingContract: sportsclub.address,
    }
    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    }
    const value = {
      owner: proposer.address,
      spender: bob.address,
      value: getBigNumber(1),
      nonce: 0,
      deadline: 1941543121
    }

    const signature = await proposer._signTypedData(domain, types, value)
    const { r, s, v } = ethers.utils.splitSignature(signature)
    
    await sportsclub.permit(proposer.address, bob.address, getBigNumber(1), 1941543121, v, r, s)

    // Unpause to unblock transferFrom
    await sportsclub.propose(8, "TEST", [proposer.address], [0], [0x00])
    await sportsclub.vote(1, true)
    await advanceTime(35)
    await sportsclub.processProposal(1)
    expect(await sportsclub.paused()).to.equal(false)

    // console.log(
    //   "Proposer's balance before delegation: ",
    //   await sportsclub.balanceOf(proposer.address)
    // )
    // console.log(
    //   "Bob's balance before delegation: ",
    //   await sportsclub.balanceOf(bob.address)
    // )
    await sportsclub.connect(bob).transferFrom(proposer.address, bob.address, getBigNumber(1))
    // console.log(
    //   "Proposer's balance after delegation: ",
    //   await sportsclub.balanceOf(proposer.address)
    // )
    // console.log(
    //   "Bob's balance after delegation: ",
    //   await sportsclub.balanceOf(bob.address)
    // )
    expect(await sportsclub.balanceOf(bob.address)).to.equal(getBigNumber(1))
  })
  it("Should revert permit if the signature is invalid", async () => {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    const rs = ethers.utils.formatBytes32String("rs")
    expect(
      await sportsclub.permit(proposer.address, bob.address, getBigNumber(1), 1941525801, 0, rs, rs).should.be.reverted
    )
  })
  it("Should allow delegateBySig if the signature is valid", async () => {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    const domain = {
      name: "KALI",
      version: "1",
      chainId: 31337,
      verifyingContract: sportsclub.address,
    }
    const types = {
      Delegation: [
        { name: "delegatee", type: "address" },
        { name: "nonce", type: "uint256" },
        { name: "expiry", type: "uint256" },
      ],
    }
    const value = {
      delegatee: bob.address,
      nonce: 0,
      expiry: 1941543121
    }

    const signature = await proposer._signTypedData(domain, types, value)
    const { r, s, v } = ethers.utils.splitSignature(signature)

    sportsclub.delegateBySig(bob.address, 0, 1941525801, v, r, s)
  })
  it("Should revert delegateBySig if the signature is invalid", async () => {
    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    const rs = ethers.utils.formatBytes32String("rs")
    expect(
      await sportsclub.delegateBySig(bob.address, 0, 1941525801, 0, rs, rs).should.be.reverted
    )
  })
  it("Should revert reentrant calls", async () => {
    let ReentrantMock // ReentrantMock contract
    let reentrantMock // ReentrantMock contract instance

    Reentrant = await ethers.getContractFactory("ReentrantMock")
    reentrant = await Reentrant.deploy()
    await reentrant.deployed()

    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [],
      [],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
    
    await sportsclub.propose(9, "TEST", [reentrant.address], [1], [0x0])
    await sportsclub.vote(1, true)
    await advanceTime(35)
    await sportsclub.processProposal(1)
    expect(await sportsclub.extensions(reentrant.address)).to.equal(true)
    
    expect(await sportsclub.callExtension(reentrant.address, 0, "").should.be.reverted)
  })
  it("Should not call if null length payload", async () => {
    let CallMock // CallMock contract
    let callMock // CallMock contract instance

    CallMock = await ethers.getContractFactory("CallMock")
    callMock = await CallMock.deploy()
    await callMock.deployed()

    await sportsclub.init(
      "KALI",
      "KALI",
      "DOCS",
      true,
      [callMock.address],
      [0x00],
      [proposer.address],
      [getBigNumber(1)],
      [30, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )

    expect(await callMock.called()).to.equal(false)
  })
})
