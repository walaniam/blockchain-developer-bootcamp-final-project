// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title SignMeUp
/// @author Mariusz Walania
/// @notice Contract owner gets paid small fee for each SignUpEventEntry created. Users can register to SignUpEventEntry. Once due date passes, SignUpEventEntry organizer can randomly choose selected participants of the event.
contract SignMeUp is ERC20, Ownable {

  /// @return wei price of newly created SignUpEventEntry
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

  /// @param id id of created SignUpEventEntry
  /// @param organizer address of SignUpEventEntry organizer
  event LogEntryCreated(uint id, address organizer);

  /// @param id id of SignUpEventEntry someone registered to
  /// @param who address of registrant for the SignUpEventEntry
  /// @param when timestamp when the registration happened
  event LogRegistered(uint id, address who, uint when);

  /// @param id id SignUpEventEntry that was closed and for which participants were selected
  /// @param participants list of participant addresses selected from registrants list
  event LogEntryClosed(uint id, address[] participants);

  /// @param oldPrice previous price of created SignUpEventEntry
  /// @param newPrice current price of created SignUpEventEntry
  event LogPriceChanged(uint oldPrice, uint newPrice);

  /// @notice require the SignUpEventEntry of this id to be before registration date
  /// @param eventId id of SignUpEventEntry
  modifier isBeforeRegistrationDate(uint eventId) {
    SignUpEventEntry memory entry = entries[eventId];
    require(block.timestamp < entry.registrationDueDate, "Already after registration date");
    _;
  }

  /// @notice Requires given SignUpEventEntry to be after registration date and no participants selected yet for this event
  /// @param eventId SignUpEventEntry id
  modifier canSelectParticipants(uint eventId) {
    SignUpEventEntry memory entry = entries[eventId];
    require(entryParticipants[eventId].length == 0 
      && entry.registrationDueDate != 0 
      && block.timestamp >= entry.registrationDueDate, "Already selected or not after registration date yet");
    _;
  }

  /// @notice Requires message sender not to be registered for given SignUpEventEntry
  /// @param eventId SignUpEventEntry id
  modifier isNotRegistered(uint eventId) {
    mapping(address => uint) storage registrationTimestamps = entryRegistrationTimestamps[eventId];
    require(registrationTimestamps[msg.sender] == 0, "Already regisetered for the event");
    _;
  }

  /// @notice Requires message sender to be organizer of this SignUpEventEntry
  /// @param eventId SignUpEventEntry id
  modifier isOrganizer(uint eventId) {
    require(entryOrganizer[eventId] == msg.sender, "Transaction sender is not organizer of the event");
    _;
  }

  /// @notice Requires message sender not to be organizer of given SignUpEventEntry
  /// @param eventId SignUpEventEntry id
  modifier isNotOrganizer(uint eventId) {
    require(entryOrganizer[eventId] != msg.sender, "Transaction sender cannot be organizer of the event");
    _;
  }

  /// @notice Requires message value to be at least of entryPriceWei
  modifier paidEnough() {
    require(msg.value >= entryPriceWei, string(abi.encodePacked("Expected: ", Strings.toString(entryPriceWei), " got: ", Strings.toString(msg.value))));
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

  ////// Owner functions //////

  function setPrice(uint _price) public onlyOwner {
    if (entryPriceWei != _price) {
      uint oldPrice = entryPriceWei;
      entryPriceWei = _price;
      emit LogPriceChanged(oldPrice, entryPriceWei);
    }
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
    string memory title,
    uint spots,
    uint64 registrationDueDate,
    uint64 eventDate
  )
    private
    returns (SignUpEventEntry memory)
  {
    require(bytes(title).length > 0, "Title cannot be empty");
    require(spots > 0, "Spots must be positive integer");
    require(eventDate > registrationDueDate && registrationDueDate > block.timestamp, "eventDate > registrationDueDate > now()");

    uint newId = nextEntryId();
    address organizer = msg.sender;

    SignUpEventEntry memory entry = SignUpEventEntry({
      id: newId,
      organizer: organizer,
      title: title,
      spots: spots,
      registrationDueDate: registrationDueDate,
      eventDate: eventDate
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
