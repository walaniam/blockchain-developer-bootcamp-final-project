const SignMeUp = artifacts.require("./SignMeUp.sol");

contract("SignMeUp", accounts => {
  const [contractOwner, organizer1, organizer2] = accounts;

  beforeEach(async () => {
    instance = await SignMeUp.deployed();
  });

  it("is owned by owner", async () => {
    assert.equal(      
      await instance.owner.call(),
      contractOwner,
      "owner is not correct",
    );
  });

  it("should create new SignUpEntry", async () => {

    const price = await instance.entryPriceWei.call();

    var createResult = await instance.createNewSignUpEventEntry("test event", 3, 2236885594, 2236895594, {from: organizer1, value: price});    
    assert.equal(
      createResult.logs[0].args.id.toNumber(),
      0,
      "id should be 0"
    );
    assert.equal(
      createResult.logs[0].args.organizer,
      organizer1,
      "organizer should match"
    );

    var createResult2 = await instance.createNewSignUpEventEntry("test event", 3, 2236885594, 2236895594, {from: organizer2, value: price});
    assert.equal(
      createResult2.logs[0].args.id.toNumber(),
      1,
      "id should be 1"
    );
    assert.equal(
      createResult2.logs[0].args.organizer,
      organizer2,
      "organizer should match"
    );
  });

  it("should fail if not paid enough for new SignUpEntry", async () => {

    const price = await instance.entryPriceWei.call();
    const payment = price - 1;

    try {
      var createResult = await instance.createNewSignUpEventEntry("test event", 4, 2236885594, 2236895594, {from: organizer1, value: payment});
      assert.fail("Should have failed with incorrect payment");
    } catch(err) {
      assert.isTrue(err.message.includes("Expected: 50000000000000 got: 49999999999999"));
    }
  });

  it("should fail if registration date in the past", async () => {

    const price = await instance.entryPriceWei.call();

    try {
      var createResult = await instance.createNewSignUpEventEntry("test event", 3, 1000, 2236895594, {from: organizer1, value: price});
      assert.fail("Should have failed with date validation");
    } catch(err) {
      assert.isTrue(err.message.includes("eventDate > registrationDueDate > now()"));
    }
  });

  it("should have default price of 50_000 Gwei", async () => {
    const price = await instance.entryPriceWei.call();
    assert.equal(price.toString(), 50_000 * 1_000_000_000, "Default price is NOT 50_000 Gwei");
  });

  it("should set price to 100_000 Gwei", async () => {

    var setPriceResult = await instance.setPrice(100_000 * 1_000_000_000);
    const oldPrice = setPriceResult.logs[0].args.oldPrice.toNumber();
    const newPrice = setPriceResult.logs[0].args.newPrice.toNumber();
    assert.equal(oldPrice, 50_000 * 1_000_000_000, "Old price should be 50_000 Gwei");
    assert.equal(newPrice, 100_000 * 1_000_000_000, "New price should be 100_000 Gwei");

    const price = await instance.entryPriceWei.call();    
    assert.equal(price.toString(), 100_000 * 1_000_000_000, "Price is NOT 100_000 Gwei");
  });

});
