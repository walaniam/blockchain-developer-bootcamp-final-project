// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SignMeUp is ERC20, Ownable {

  SignUpEntry[] public entries;

  /**
   * State enums
   */
  enum State {Active, Closed}

  /**
   * Events
   */
  event SignMeUpEntryCreated(uint256 id);

  struct SignUpEntry {
    uint256 id;
    address organizer;
    string title;
    uint spots;
    uint registrationDueDate;
    // address[] registrants;
    // address[] participants;
    State state;
  }

  constructor() ERC20("SignMeUp", "SMU") {
    // Test entries
    createNewSignUpEntry("Event 1", 10, 10000);
    createNewSignUpEntry("Event 2", 12, 100000);
    createNewSignUpEntry("Event 3", 23, 10000000);
  }

  function getEntriesCount() public view returns(uint256) {
    return entries.length;
  }

  function createNewSignUpEntry(string memory _title, uint _spots, uint _registrationDueDate)
    public
    returns (uint256) {

      uint256 nextId = entries.length;

      SignUpEntry memory entry = SignUpEntry({
        id: nextId,
        organizer: msg.sender,
        title: _title,
        spots: _spots,
        registrationDueDate: _registrationDueDate,
        state: State.Active
      });

      entries.push(entry);

      emit SignMeUpEntryCreated(entry.id);
      return entry.id;
  }


  // ### Utils ###
  // #############

  function nonSecureRandom() private view returns (uint256) {
    return uint256(keccak256(
      abi.encodePacked(block.timestamp, block.difficulty)
    ));
  }
  // ### Utils - end ###
}
