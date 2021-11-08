const SignMeUp = artifacts.require("./SignMeUp.sol");

contract("SignMeUp", accounts => {
  it("...should store the value 89.", async () => {
    const signMeUpInstance = await SignMeUp.deployed();

    // Set value of 89
    await signMeUpInstance.set(89, { from: accounts[0] });

    // Get stored value
    const storedData = await signMeUpInstance.get.call();

    assert.equal(storedData, 89, "The value 89 was not stored.");
  });
});
