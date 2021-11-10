// SPDX-License-Identifier: MIT
pragma solidity >=0.5.16 <0.9.0;

contract SignMeUp {

  SignUpEntry[] public entries;
  
  // mapping (address => SignUpEntry[]) private organizerEntries;

  enum State {Active, Expired}

  struct SignUpEntry {
    uint256 id;
    address organizer;
    string title;
    uint totalSpots;
    uint registrationDueDate;
    // address[] registrants;
    // address[] participants;
    State state;
  }

  constructor() public {
    // Test entries
    createNewSignUpEntry("Event 1", 10, 10000);
    createNewSignUpEntry("Event 2", 12, 100000);
  }

  function getEntriesCount() public view returns(uint256) {
    return entries.length;
  }

  function createNewSignUpEntry(string memory _title, uint _totalSpots, uint _registrationDueDate)
    public
    returns (uint256) {

    SignUpEntry memory entry = SignUpEntry({
      id: nonSecureRandom(),
      organizer: msg.sender,
      title: _title,
      totalSpots: _totalSpots,
      registrationDueDate: _registrationDueDate,
      state: State.Active
    });

    entries.push(entry);

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

  // ##########################
  // Simple storage
  uint storedData = 44;
  function set(uint x) public {
    storedData = x;
  }

  function get() public view returns (uint) {
    return storedData;
  }
}
