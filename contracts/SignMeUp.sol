// SPDX-License-Identifier: MIT
pragma solidity >=0.5.16 <0.9.0;

contract SignMeUp {
  
  uint storedData = 44;

  function set(uint x) public {
    storedData = x;
  }

  function get() public view returns (uint) {
    return storedData;
  }
}
