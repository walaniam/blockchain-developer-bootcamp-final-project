const SignMeUp = artifacts.require("./SignMeUp.sol");

function epochTime(plusSeconds) {
  var date = new Date();
  date.setSeconds(date.getSeconds() + plusSeconds);
  return Math.floor(date.getTime() / 1000);
}

contract("SignMeUp", accounts => {
  const [contractOwner, organizer1, organizer2, registrant1, registrant2, registrant3, notRegistered] = accounts;

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

  it("should create new SignUpEntry register and select participants", async () => {

    const price = await instance.entryPriceWei.call();
    var unused = await instance.createNewSignUpEventEntry("test event", 3, 2236885594, 2236895594, {from: organizer1, value: price});    

    var registrationSecondsFromNow = 2;
    const registrationDueDate = epochTime(registrationSecondsFromNow);
    const eventDate = epochTime(4);

    const spots = 2;
    var createResult = await instance.createNewSignUpEventEntry(
        "test event", spots, registrationDueDate, eventDate, {from: organizer1, value: price}
    );
    var id = createResult.logs[0].args.id.toNumber();

    // Three senders register for an event
    await instance.registerForEvent(id, {from: registrant1});
    await instance.registerForEvent(id, {from: registrant2});
    await instance.registerForEvent(id, {from: registrant3});

    // Each of three senders is registered for this event
    var registrant1Ids = await instance.getEntriesUserRegisteredFor({from: registrant1});
    var registrant2Ids = await instance.getEntriesUserRegisteredFor({from: registrant2});
    var registrant3Ids = await instance.getEntriesUserRegisteredFor({from: registrant3});
    assert.equal(registrant1Ids[0], id);
    assert.equal(registrant2Ids[0], id);
    assert.equal(registrant3Ids[0], id);
    assert.isTrue(await instance.isRegisteredForEntry(id, {from: registrant1}));
    assert.isTrue(await instance.isRegisteredForEntry(id, {from: registrant2}));
    assert.isTrue(await instance.isRegisteredForEntry(id, {from: registrant3}));
    assert.isFalse(await instance.isRegisteredForEntry(id, {from: notRegistered}));

    // Await for the registration due date
    await new Promise(r => setTimeout(r, (registrationSecondsFromNow + 1) * 1000));

    // Organizer randomly chooses participants of the event
    var chooseResult = await instance.randomlyChooseEventParticipants(id, {from: organizer1});
    assert.equal(chooseResult.logs[0].args.id, id);
    assert.equal(chooseResult.logs[0].args.participants.length, spots);

    for (let i = 0; i < chooseResult.logs[0].args.participants.length; i++) {
      var selectedParticipant = chooseResult.logs[0].args.participants[i];
      var entries = await instance.getEntriesUserSelectedFor({from: selectedParticipant});
      assert.equal(entries.length, 1);
      assert.equal(entries[0], id);
    }
  });

});
