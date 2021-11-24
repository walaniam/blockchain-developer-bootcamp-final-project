
////// Event organizer functions //////
async function createEvent(title, spots, registrationDate, eventDate, awaitCallback, errorCallback) {
  let contract = await getContract(new Web3(window.ethereum));
  let price = await getEventPrice();

  $('#mm-status').html("Sending transaction...");

  contract.methods
    .createNewSignUpEventEntry(title, spots, registrationDate, eventDate)
    .send({from: ethereum.selectedAddress, value: price})
    .on('transactionHash', function(hash) {
      $('#mm-status').html("Transaction " + hash + " in progress. It may take up to few minutes to complete");
      awaitCallback();
    })
    .on('confirmation', function(confirmationNumber, receipt) {
      alert('conf');
      $('#mm-status').html("Confirmed: " + receipt);
    })
    .on('receipt', function(receipt) {
      let entryId = receipt.events['LogEntryCreated'].returnValues['id'];
      console.log("Event created, id=" + entryId);
      window.location = '/event-details?id=' + entryId;
    })
    .on('error', errorCallback);
}

async function closeEvent(eventId, errorCallback) {
  let contract = await getContract(new Web3(window.ethereum));
  contract.methods
    .randomlyChooseEventParticipants(eventId)
    .send({from: ethereum.selectedAddress})
    .on('transactionHash', function(hash) {
      $('#mm-status').html("Transaction " + hash + " in progress. It may take up to few minutes to complete");
    })
    .on('confirmation', function(confirmationNumber, receipt) {
      alert('conf');
      $('#mm-status').html("Confirmed: " + receipt);
    })
    .on('receipt', function(receipt) {
      console.log("Event closed: " + JSON.stringify(receipt));
      window.location = '/my-events';
    })
    .on('error', errorCallback);    
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
    appendEventDetailsTo(entries[i], containerSelector);
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
      appendEventDetailsTo(entry, containerSelector);
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
      appendEventDetailsTo(entry, containerSelector);
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

async function isEventClosed(eventId) {
  let contract = await getContract(new Web3(window.ethereum));
  let isClosed = await contract.methods.isEventClosed(eventId).call();
  console.log("event for id=" + eventId + ", closed=" + isClosed);
  return isClosed;
}

async function showActiveEvents(containerSelector) {
  let contract = await getContract(new Web3(window.ethereum));
  let count = await contract.methods.getEntriesCount().call();
  
  var anyAdded = false;
  for (let i = count - 1; i >= 0; i--) {
    var entry = await contract.methods.entries(i).call();
    if (epochTimeNow() > entry.registrationDueDate) {
      continue;
    }
    anyAdded = true;
    appendEventDetailsTo(entry, containerSelector);
  }

  if (!anyAdded) {
    $('<h4><span>No events created yet. Want to create one?</span></h4>').appendTo($(containerSelector));
  }
}

async function getFooterContent() {
  var web3 = await detectMetamask();
  var contract = await getContract(web3);
  var owner = await contract.methods.owner().call();
  var netId = await web3.eth.net.getId();
  var address = contract.options.address;
  console.log('Contract address: ' + address);
  
  if (netId == 1) {
    var etherScanUrl = 'https://etherscan.io/address/';
  } else if (netId == 3) {
    var etherScanUrl = 'https://ropsten.etherscan.io/address/';
  } else if (netId == 4) {
    var etherScanUrl = 'https://rinkeby.etherscan.io/';
  } else {
    var etherScanUrl = '';
  }

  if (netId > 4) {
    var footerContent = `
      <span>Contract owner: ${owner}</span><br/>
      <span style="margin-top: 25px;">Contract address: ${address}</span>
    `;
  } else {
    var footerContent = `
      <span>Contract owner: <a target="_blank" href="${etherScanUrl + owner}">${owner}</a></span><br/>
      <span style="margin-top: 25px;">Contract address: <a target="_blank" href="${etherScanUrl + address}">${address}</a></span>
    `;
  }

  return footerContent;
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