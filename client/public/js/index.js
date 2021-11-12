
////// Event organizer functions //////
async function createEvent(title, spots, registrationDate, eventDate) {
  console.log('inside create');
  let contract = await getContract(new Web3(window.ethereum));
  console.log('before send');
  let price = await getNewEventPrice();
  let transaction = await contract.methods
    .createNewSignUpEventEntry(title, spots, registrationDate, eventDate)
    .send({from: ethereum.selectedAddress, value: price});

  //console.log("Transaction: " + JSON.stringify(transaction));
  let entryId = transaction.events['LogEntryCreated'].returnValues['id'];
  console.log("Event created, id=" + entryId);
  
  return entryId;
}

////// Registrant functions ///////
async function registerForEvent(eventId) {
  return eventId;
}

////// Read functions ///////
async function getContractOwner() {
  let contract = await getContract(new Web3(window.ethereum));
  var owner = await contract.methods.owner().call();
  console.log("Owner: " + owner);
  return owner;
}

async function getNewEventPrice() {
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

async function getEventById(eventId) {
  let contract = await getContract(new Web3(window.ethereum));
  let entry = await contract.methods.entries(eventId).call();
  console.log("got event for id=" + eventId + ", event=" + entry);
  return entry;
}

async function showActiveEvents() {

  let contract = await getContract(new Web3(window.ethereum));
  let count = await contract.methods.getEntriesCount().call();
  
  let container = $('#active-events');

  for (let i = 0; i < count; i++) {
    var entry = await contract.methods.entries(i).call();
    let row = `
      <div class="row">
        <div class="col-md-6">
          <h3><span class="glyphicon glyphicon-flash"></span> <a href="/event-details?id=${entry.id}">${entry.title}</a></h3>
          <span>Available spots: ${entry.spots}</span><br/>
          <span>Registration due date: ${formatDateOf(entry.registrationDueDate)}</span><br/>
          <span>Event date: ${formatDateOf(entry.eventDate)}</span><br/>
          <button id="register-button-${entry.id}">Register</button>
        </div>
        <hr/>
      </div>
    `;

    $(row).appendTo(container);

    $('#register-button-' + entry.id).click(function() {
      var eventId = $(this).attr('id').split('-')[2];
      registerForEvent(eventId)
        .then(result => {
          alert("Registered: " + result);
        })
        .catch(err => {
          alert(err);
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