// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SignMeUp is ERC20, Ownable {

  SignUpEntry[] public entries;
  mapping (uint => mapping(address => uint)) private eventRegistrationTimestamps;

  /**
   * State enums
   */
  enum State {Active, Closed}

  /**
   * Events
   */
  event SignMeUpEntryCreated(uint256 id);
  event LogRegistered(uint256 id, address who, uint256 when);

  /**
   * Modifiers
   */
  modifier isActive(uint _eventId) {
    SignUpEntry memory eventEntry = entries[_eventId];
    require(eventEntry.state == State.Active && block.timestamp < eventEntry.registrationDueDate);
    _;
  }

  modifier notYetRegistered(uint _eventId) {
    mapping(address => uint) storage registrationTimestamps = eventRegistrationTimestamps[_eventId];
    require(registrationTimestamps[msg.sender] == 0);
    _;
  }

  struct SignUpEntry {
    uint256 id;
    address organizer;
    string title;
    uint spots;
    uint registrationDueDate;
    uint eventDate;
    State state;
  }

  constructor() ERC20("SignMeUp", "SMU") {
    // Test entries
    createNewSignUpEntry("Event 1", 10, 10000, 20000);
    createNewSignUpEntry("Event 2", 12, 100000, 200000);
    createNewSignUpEntry("Event 3", 23, 10000000, 20000000);
  }

  function getEntriesCount() public view returns(uint256) {
    return entries.length;
  }

  function createNewSignUpEntry(string memory _title, uint _spots, uint _registrationDueDate, uint _eventDate)
    public
    returns (uint256) {

      uint256 nextId = entries.length;

      SignUpEntry memory entry = SignUpEntry({
        id: nextId,
        organizer: msg.sender,
        title: _title,
        spots: _spots,
        registrationDueDate: _registrationDueDate,
        eventDate: _eventDate,
        state: State.Active
      });

      entries.push(entry);

      emit SignMeUpEntryCreated(entry.id);
      return entry.id;
  }

  function registerForEvent(uint256 eventId)
    public
    isActive(eventId)
    returns(bool) {

    mapping(address => uint) storage registrationTimestamps = eventRegistrationTimestamps[eventId];
    registrationTimestamps[msg.sender] = block.timestamp;

    emit LogRegistered(eventId, msg.sender, block.timestamp);

    return true;
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
