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

  // Entries which Organizer created
  mapping (address => uint256[]) private organizerEntries;
  // Organizer of given SignUpEventEntry
  mapping (uint256 => address) private entryOrganizer;

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

  constructor() ERC20("SignMeUp", "SMU") {
    entryPriceWei = 50_000 * 1_000_000_000;
    // Test entries
    newSignUpEventEntryOf("Event 1", 10, 10000, 20000);
    newSignUpEventEntryOf("Event 2", 12, 100000, 200000);
    newSignUpEventEntryOf("Event 3", 23, 10000000, 20000000);
  }

  // fallback() external payable {
  //   revert();
  // }

  ////// Common functions //////

  function getEntriesCount() public view returns(uint256) {
    return entries.length;
  }

  ////// Organizer functions
  function createNewSignUpEventEntry(string memory _title, uint _spots, uint _registrationDueDate, uint _eventDate)
    public
    payable
    paidEnough()
    returns (uint256) {

      uint256 id = newSignUpEventEntryOf(_title, _spots, _registrationDueDate, _eventDate);

      // TODO test it
      address payable _owner = payable(owner());
      _owner.transfer(msg.value);

      emit LogEntryCreated(id);

      return id;
  }

  function newSignUpEventEntryOf(string memory _title, uint _spots, uint _registrationDueDate, uint _eventDate)
    private
    returns (uint256) {

      uint256 newId = nextEntryId();

      SignUpEventEntry memory entry = SignUpEventEntry({
        id: newId,
        organizer: msg.sender,
        title: _title,
        spots: _spots,
        registrationDueDate: _registrationDueDate,
        eventDate: _eventDate,
        state: State.Active
      });

      entries.push(entry);
      organizerEntries[msg.sender].push(newId);
      entryOrganizer[newId] = msg.sender;

      return entry.id;
  }

  function nextEntryId() private view returns(uint256) {
    // TODO maybe better id generator??
    return entries.length;
  }

  function getOrganizerEntryIds() public view returns(uint256[] memory) {
    return organizerEntries[msg.sender];
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
    returns(bool) {

    mapping(address => uint) storage registrationTimestamps = entryRegistrationTimestamps[_eventId];
    registrationTimestamps[msg.sender] = block.timestamp;
    registrantEntries[msg.sender].push(_eventId);

    emit LogRegistered(_eventId, msg.sender, block.timestamp);

    return true;
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
