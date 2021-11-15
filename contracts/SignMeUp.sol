// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SignMeUp is ERC20, Ownable {

  uint public entryPriceWei;

  // All event entries
  SignUpEventEntry[] public entries;

  // Mapping of registered addresses by registration date for given entry
  mapping (uint => mapping(address => uint)) private entryRegistrationTimestamps;

  // Entries which user registered for
  mapping (address => uint[]) private registrantEntries;

  // Entries which user was selected for
  mapping (address => uint[]) private participantEntries;

  // Registrants for given SignUpEventEntry
  mapping (uint => address[]) private entryRegistrants;

  // Participants for given SignUpEventEntry
  mapping (uint => address[]) private entryParticipants;

  // Number of entries organized by user
  mapping (address => uint) private organizerEntriesCount;

  // Organizer of given SignUpEventEntry
  mapping (uint => address) public entryOrganizer;

  ////// Events //////
  event LogEntryCreated(uint id, address organizer);
  event LogRegistered(uint id, address who, uint when);
  event LogEntryClosed(uint id, address[] participants);

  ////// Modifiers //////
  modifier isBeforeRegistrationDate(uint _eventId) {
    SignUpEventEntry memory entry = entries[_eventId];
    require(block.timestamp < entry.registrationDueDate);
    _;
  }

  modifier canSelectParticipants(uint _eventId) {
    SignUpEventEntry memory entry = entries[_eventId];
    require(entryParticipants[_eventId].length == 0 
      && entry.registrationDueDate != 0 
      && block.timestamp >= entry.registrationDueDate);
    _;
  }

  modifier isNotRegistered(uint _eventId) {
    mapping(address => uint) storage registrationTimestamps = entryRegistrationTimestamps[_eventId];
    require(registrationTimestamps[msg.sender] == 0);
    _;
  }

  modifier isOrganizer(uint _eventId) {
    require(entryOrganizer[_eventId] == msg.sender);
    _;
  }

  modifier isNotOrganizer(uint _eventId) {
    require(entryOrganizer[_eventId] != msg.sender);
    _;
  }

  modifier paidEnough() {
    require(msg.value >= entryPriceWei);
    _;
  }

  ////// Structs //////
  struct SignUpEventEntry {
    uint id;
    address organizer;
    string title;
    uint spots;
    uint64 registrationDueDate;
    uint64 eventDate;
  }

  constructor() ERC20("SignMeUp", "SMU") {
    entryPriceWei = 50_000 * 1_000_000_000;
  }

  ////// Common functions //////

  function getEntriesCount() public view returns(uint) {
    return entries.length;
  }

  ////// Organizer functions
  function createNewSignUpEventEntry(
    string memory _title,
    uint _spots,
    uint64 _registrationDueDate,
    uint64 _eventDate
  )
    public
    payable
    paidEnough()
    returns (uint)
  {
    SignUpEventEntry memory entry = newSignUpEventEntryOf(_title, _spots, _registrationDueDate, _eventDate);

    address payable _owner = payable(owner());
    _owner.transfer(msg.value);

    emit LogEntryCreated(entry.id, entry.organizer);

    return entry.id;
  }

  function newSignUpEventEntryOf(
    string memory _title,
    uint _spots,
    uint64 _registrationDueDate,
    uint64 _eventDate
  )
    private
    returns (SignUpEventEntry memory)
  {
    uint newId = nextEntryId();
    address organizer = msg.sender;

    SignUpEventEntry memory entry = SignUpEventEntry({
      id: newId,
      organizer: organizer,
      title: _title,
      spots: _spots,
      registrationDueDate: _registrationDueDate,
      eventDate: _eventDate
    });
    
    entryOrganizer[newId] = organizer;
    organizerEntriesCount[organizer] += 1;

    entries.push(entry);

    return entry;
  }

  function nextEntryId() private view returns(uint) {
    return entries.length;
  }

  function getOrganizerEntriesCount() public view returns(uint) {
    return organizerEntriesCount[msg.sender];
  }

  function getOrganizerEntries()
    public
    view
    returns(SignUpEventEntry[] memory)
  {
    address organizer = msg.sender;

    SignUpEventEntry[] memory result = new SignUpEventEntry[](organizerEntriesCount[organizer]);
    uint targetIndex = 0;
    for (uint i = 0; i < entries.length; i++) {
      if (entries[i].organizer == organizer) {
        result[targetIndex++] = entries[i];
      }
    }

    return result;
  }

  function randomlyChooseEventParticipants(uint _eventId)
    public
    isOrganizer(_eventId)
    canSelectParticipants(_eventId)
  {
    // TODO use some 'random' oracle, choose participants from registeres users and change state to Closed
    address[] memory registrants = entryRegistrants[_eventId];
    address[] memory participants = new address[](registrants.length);
    for (uint i = 0; i < registrants.length; i++) {
      participants[i] = registrants[i];
    }
    entryParticipants[_eventId] = participants;
    emit LogEntryClosed(_eventId, participants);
  }

  ////// Registrant functions //////
  function registerForEvent(uint _eventId)
    public
    isBeforeRegistrationDate(_eventId)
    isNotRegistered(_eventId)
    isNotOrganizer(_eventId)
    returns(uint)
  {
    uint registrationTimestamp = block.timestamp;

    mapping(address => uint) storage registrationTimestamps = entryRegistrationTimestamps[_eventId];
    registrationTimestamps[msg.sender] = registrationTimestamp;
    registrantEntries[msg.sender].push(_eventId);
    entryRegistrants[_eventId].push(msg.sender);

    emit LogRegistered(_eventId, msg.sender, registrationTimestamp);

    return registrationTimestamp;
  }

  function getEntriesUserRegisteredFor() public view returns(uint[] memory) {
    return registrantEntries[msg.sender];
  }

  function getEntriesUserSelectedFor() public view returns(uint[] memory) {
    return participantEntries[msg.sender];
  }

  // ### Utils ###
  // #############

  function nonSecureRandom() private view returns (uint) {
    return uint(keccak256(
      abi.encodePacked(block.timestamp, block.difficulty)
    ));
  }
  // ### Utils - end ###
}
