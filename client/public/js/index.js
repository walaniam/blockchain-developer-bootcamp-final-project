
////// Event organizer functions //////
async function createEvent(title, spots, registrationDate, eventDate) {
  let contract = await getContract(new Web3(window.ethereum));
  let price = await getEventPrice();
  let transaction = await contract.methods
    .createNewSignUpEventEntry(title, spots, registrationDate, eventDate)
    .send({from: ethereum.selectedAddress, value: price});

  console.log("Transaction: " + JSON.stringify(transaction));
  let entryId = transaction.events['LogEntryCreated'].returnValues['id'];
  console.log("Event created, id=" + entryId);
  
  return entryId;
}

async function closeEvent(eventId) {
  let contract = await getContract(new Web3(window.ethereum));
  let transaction = await contract.methods
    .randomlyChooseEventParticipants(eventId)
    .send({from: ethereum.selectedAddress});
  console.log("Transaction: " + JSON.stringify(transaction));
}

async function showOrganizerEvents(containerSelector) {

  var container = $(containerSelector);
  container.empty();

  var contract = await getContract(new Web3(window.ethereum));
  var entries = await contract.methods.getOrganizerEntries().call({from: ethereum.selectedAddress});

  console.log("Organizer events: " + JSON.stringify(entries));

  if (entries.length == 0) {
    $('<h5><span>You are not organizing any event</span></h5>').appendTo(container);
  }

  for (let i = entries.length - 1; i >= 0 ; i--) {
    var entry = entries[i];
    var registrantsCount = await contract.methods.getNumberOfRegisteredUsersForEvent(entry.id).call({from: ethereum.selectedAddress});
    var row = `
      <div class="row">
        <div class="col-md-6">
          <h3><span class="glyphicon glyphicon-flash"></span> <a href="/event-details?id=${entry.id}">${entry.title}</a></h3>
          <span>Spots: ${entry.spots}</span><br/>
          <span>Registration due date: ${formatDateOf(entry.registrationDueDate)}</span><br/>
          <span>Event date: ${formatDateOf(entry.eventDate)}</span><br/>
          <span>Registered users: ${registrantsCount}</span><br/>
          <button id="close-button-${entry.id}">Close registration</button>
        </div>
        <hr/>
      </div>
    `;

    $(row).appendTo(container);

    $('#close-button-' + entry.id).click(function() {
      var eventId = $(this).attr('id').split('-')[2];
      closeEvent(eventId)
        .then(() => {
          alert("Registration closed");
          window.location = '/my-events';
        })
        .catch(err => {
          alert(err.message);
        });
    });    
  }
}

////// Registrant functions ///////
async function registerForEvent(eventId) {
  var contract = await getContract(new Web3(window.ethereum));
  var transaction = await contract.methods.registerForEvent(eventId).send({from: ethereum.selectedAddress});
  console.log(JSON.stringify(transaction));
  return eventId;
}

////// Participant functions ///////
async function showParticipantEvents(containerSelector) {

  var container = $(containerSelector);
  container.empty();

  var contract = await getContract(new Web3(window.ethereum));
  var entryIds = await contract.methods.getEntriesUserSelectedFor().call({from: ethereum.selectedAddress});

  console.log("Participant events: " + JSON.stringify(entryIds));

  if (entryIds.length == 0) {
    $('<h5><span>You are not participating in any event</span></h5>').appendTo(container);
  }

  for (let i = entryIds.length - 1; i >= 0; i--) {
    _eventById(entryIds[i], contract).then(entry => {
      var row = `
        <div class="row">
          <div class="col-md-6">
            <h3><span class="glyphicon glyphicon-flash"></span> <a href="/event-details?id=${entry.id}">${entry.title}</a></h3>
            <span>Spots: ${entry.spots}</span><br/>
            <span>Registration due date: ${formatDateOf(entry.registrationDueDate)}</span><br/>
            <span>Event date: ${formatDateOf(entry.eventDate)}</span><br/>
          </div>
          <hr/>
        </div>
      `;

      $(row).appendTo(container);
      
    });
  }
}

async function showRegistrantEvents(containerSelector) {

  var container = $(containerSelector);
  container.empty();

  var contract = await getContract(new Web3(window.ethereum));
  var entryIds = await contract.methods.getEntriesUserRegisteredFor().call({from: ethereum.selectedAddress});

  console.log("Registrant events: " + JSON.stringify(entryIds));

  if (entryIds.length == 0) {
    $('<h5><span>You are not registered to any event</span></h5>').appendTo(container);
  }

  for (let i = entryIds.length - 1; i >= 0; i--) {
    _eventById(entryIds[i], contract).then(entry => {
      var row = `
        <div class="row">
          <div class="col-md-6">
            <h3><span class="glyphicon glyphicon-flash"></span> <a href="/event-details?id=${entry.id}">${entry.title}</a></h3>
            <span>Spots: ${entry.spots}</span><br/>
            <span>Registration due date: ${formatDateOf(entry.registrationDueDate)}</span><br/>
            <span>Event date: ${formatDateOf(entry.eventDate)}</span><br/>
          </div>
          <hr/>
        </div>
      `;

      $(row).appendTo(container);
      
    });
  }
}

////// Read functions ///////
async function getContractOwner() {
  let contract = await getContract(new Web3(window.ethereum));
  var owner = await contract.methods.owner().call();
  console.log("Owner: " + owner);
  return owner;
}

async function getEventPrice() {
  let contract = await getContract(new Web3(window.ethereum));
  var price = await contract.methods.entryPriceWei().call();
  console.log("Price: " + price);
  return price;
}

async function getActiveEventsCount() {
  let contract = await getContract(new Web3(window.ethereum));
  var count = await contract.methods.getEntriesCount().call();
  console.log("Entries count: " + count);
  return count;
}

async function isRegisteredForEntry(eventId) {
  let contract = await getContract(new Web3(window.ethereum));
  let isRegistered = await contract.methods.isRegisteredForEntry(eventId).call({from: ethereum.selectedAddress});
  return isRegistered;
}

async function getEventById(eventId) {
  let contract = await getContract(new Web3(window.ethereum));
  return _eventById(eventId, contract);
}

async function _eventById(eventId, contract) {
  let entry = await contract.methods.entries(eventId).call();
  console.log("got event for id=" + eventId + ", event=" + JSON.stringify(entry));
  return entry;
}

async function showActiveEvents(containerSelector) {

  let contract = await getContract(new Web3(window.ethereum));
  let count = await contract.methods.getEntriesCount().call();
  
  let container = $(containerSelector);

  if (count < 1) {
    $('<h4><span>No events created yet. Want to create one?</span></h4>').appendTo(container);
  }

  for (let i = count - 1; i >= 0; i--) {
    var entry = await contract.methods.entries(i).call();
    let row = `
      <div class="row">
        <div id="row-${i}" class="col-md-6">
          <h3><span class="glyphicon glyphicon-flash"></span> <a href="/event-details?id=${entry.id}">${entry.title}</a></h3>
          <span>Spots: ${entry.spots}</span><br/>
          <span>Registration due date: ${formatDateOf(entry.registrationDueDate)}</span><br/>
          <span>Event date: ${formatDateOf(entry.eventDate)}</span><br/>
          <span>Organizer: ${entry.organizer}</span><br/>
        </div>
        <hr/>
      </div>
    `;

    $(row).appendTo(container);
    
    if (ethereum.selectedAddress.toLowerCase() != entry.organizer.toLowerCase()) {
      
      let isRegistered = await contract.methods.isRegisteredForEntry(i).call({from: ethereum.selectedAddress});

      if (isRegistered) {
        $('<span style="margin-top: 10px;">Already registered</span>').appendTo($('#row-' + entry.id));
      } else {
        var button = `<button id="register-button-${entry.id}">Register</button>`;
        $(button).appendTo($('#row-' + entry.id));
      }
      
    } else {
      $('<span style="margin-top: 10px;">You are organizer</span>').appendTo($('#row-' + entry.id));
    }

    $('#register-button-' + entry.id).click(function() {
      var eventId = $(this).attr('id').split('-')[2];
      registerForEvent(eventId)
        .then(result => {
          alert("Registered event: " + result);
          window.location = '/open-events';
        })
        .catch(err => {
          alert(err.message);
        });
    });

    console.log("Entry " + JSON.stringify(entry));
  }
}

////// Detect metamask //////
async function detectNetworkConnection() {
  try {
    let web3 = await detectMetamask();
    let contract = await getContract(web3);
    var count = await contract.methods.getEntriesCount().call();
  } catch(err) {
    $('#mm-status').css('color', 'red').html(err);
  }
}

detectNetworkConnection();