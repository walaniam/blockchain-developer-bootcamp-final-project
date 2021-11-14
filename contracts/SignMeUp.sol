// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SignMeUp is ERC20, Ownable {

  uint256 public entryPriceWei;

  // All entries
  SignUpEventEntry[] public entries;

  // Mapping of registered addresses by registration date for given entry
  mapping (uint256 => mapping(address => uint256)) private entryRegistrationTimestamps;

  // Entries which user registered for
  mapping (address => uint256[]) private registrantEntries;

  // Entries which user was selected for
  mapping (address => uint256[]) private participantEntries;

  // Registrants for given SignUpEventEntry
  mapping (uint256 => address[]) private entryParticipants;

  // Number of entries organized by user
  mapping (address => uint256) private organizerEntriesCount;

  // Organizer of given SignUpEventEntry
  mapping (uint256 => address) public entryOrganizer;

  ////// Enums //////
  enum State {Active, Closed}

  ////// Events //////
  event LogEntryCreated(uint256 id);
  event LogRegistered(uint256 id, address who, uint256 when);

  ////// Modifiers //////
  modifier isActive(uint256 _eventId) {
    SignUpEventEntry memory eventEntry = entries[_eventId];
    require(eventEntry.state == State.Active && block.timestamp < eventEntry.registrationDueDate);
    _;
  }

  modifier isNotClosed(uint256 _eventId) {
    SignUpEventEntry memory eventEntry = entries[_eventId];
    require(eventEntry.state != State.Closed);
    _;
  }

  modifier notYetRegistered(uint256 _eventId) {
    mapping(address => uint256) storage registrationTimestamps = entryRegistrationTimestamps[_eventId];
    require(registrationTimestamps[msg.sender] == 0);
    _;
  }

  modifier isOrganizer(uint256 _eventId) {
    require(entryOrganizer[_eventId] == msg.sender);
    _;
  }

  modifier isNotOrganizer(uint256 _eventId) {
    require(entryOrganizer[_eventId] != msg.sender);
    _;
  }

  modifier paidEnough() {
    require(msg.value >= entryPriceWei);
    _;
  }

  ////// Structs //////
  struct SignUpEventEntry {
    uint256 id;
    address organizer;
    string title;
    uint256 spots;
    uint256 registrationDueDate;
    uint256 eventDate;
    State state;
  }

  struct EntryList {
    bool isPresent;
    uint256 ids;
  }

  constructor() ERC20("SignMeUp", "SMU") {
    entryPriceWei = 50_000 * 1_000_000_000;
    // Test entries
    // newSignUpEventEntryOf("Event 1", 10, 10000, 20000);
    // newSignUpEventEntryOf("Event 2", 12, 100000, 200000);
    // newSignUpEventEntryOf("Event 3", 23, 10000000, 20000000);
  }

  // fallback() external payable {
  //   revert();
  // }

  ////// Common functions //////

  function getEntriesCount() public view returns(uint256) {
    return entries.length;
  }

// payable
//     paidEnough()

  ////// Organizer functions
  function createNewSignUpEventEntry(string memory _title, uint _spots, uint _registrationDueDate, uint _eventDate)
    public
    
    returns (uint256) {

      uint256 id = newSignUpEventEntryOf(_title, _spots, _registrationDueDate, _eventDate);

      // TODO test it
      // address payable _owner = payable(owner());
      // _owner.transfer(msg.value);

      emit LogEntryCreated(id);

      return id;
  }

  function newSignUpEventEntryOf(string memory _title, uint _spots, uint _registrationDueDate, uint _eventDate)
    private
    returns (uint256) {

      uint256 newId = nextEntryId();
      address organizer = msg.sender;

      SignUpEventEntry memory entry = SignUpEventEntry({
        id: newId,
        organizer: organizer,
        title: _title,
        spots: _spots,
        registrationDueDate: _registrationDueDate,
        eventDate: _eventDate,
        state: State.Active
      });
      
      entryOrganizer[newId] = organizer;
      organizerEntriesCount[organizer] += 1;

      entries.push(entry);

      return entry.id;
  }

  function nextEntryId() private view returns(uint256) {
    return entries.length;
  }

  function getOrganizerEntriesCount() public view returns(uint256) {
    return organizerEntriesCount[msg.sender];
  }

  function getOrganizerEntries()
    public
    view
    returns(SignUpEventEntry[] memory) {

    address organizer = msg.sender;

    SignUpEventEntry[] memory result = new SignUpEventEntry[](organizerEntriesCount[organizer]);
    uint256 targetIndex = 0;
    for (uint256 i = 0; i < entries.length; i++) {
      if (entries[i].organizer == organizer) {
        result[targetIndex++] = entries[i];
      }
    }

    return result;
  }

  function randomlyChooseEventParticipants(uint256 _eventId)
    public
    isOrganizer(_eventId)
    isNotClosed(_eventId) {
      // TODO use some 'random' oracle, choose participants from registeres users and change state to Closed
  }

  ////// Registrant functions //////
  function registerForEvent(uint256 _eventId)
    public
    isActive(_eventId)
    notYetRegistered(_eventId)
    isNotOrganizer(_eventId)
    returns(uint256) {

    uint256 registrationTimestamp = block.timestamp;

    mapping(address => uint) storage registrationTimestamps = entryRegistrationTimestamps[_eventId];
    registrationTimestamps[msg.sender] = registrationTimestamp;
    registrantEntries[msg.sender].push(_eventId);

    emit LogRegistered(_eventId, msg.sender, registrationTimestamp);

    return registrationTimestamp;
  }

  function getEntriesUserRegisteredFor() public view returns(uint256[] memory) {
    return registrantEntries[msg.sender];
  }

  function getEntriesUserSelectedFor() public view returns(uint256[] memory) {
    return participantEntries[msg.sender];
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
