pragma solidity >=0.4.21 <0.9.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/SignMeUp.sol";

contract TestSignMeUp {

  function testItStoresAValue() public {
    SignMeUp signMeUp = SignMeUp(DeployedAddresses.SignMeUp());

    signMeUp.set(89);

    uint expected = 89;

    Assert.equal(signMeUp.get(), expected, "It should store the value 89.");
  }

}
