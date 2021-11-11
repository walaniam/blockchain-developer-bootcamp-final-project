
// async function showStoredValue(contract) {
//   var value = await contract.methods.get().call();
//   console.log("Fetched stored value: " + value);
//   $("#ctrt-value").html(value);
//   $("#ctrt-value").html("Entries count: " + count);
// };

async function getActiveEventsCount() {
  let web3 = await getWeb3();
  let contract = await getContract(web3);
  var count = await contract.methods.getEntriesCount().call();
  console.log("Entries count: " + count);
  return count;
};

async function getEventById(eventId) {
  let web3 = await getWeb3();
  let contract = await getContract(web3);
  let entry = await contract.methods.entries(eventId).call();
  return entry;
}

async function showActiveEvents() {

  let web3 = await getWeb3();
  let contract = await getContract(web3);
  let count = await contract.methods.getEntriesCount().call();
  
  let container = $('#active-events');

  // TODO format date
  for (let i = 0; i < count; i++) {
    var entry = await contract.methods.entries(i).call();
    let row = `
      <div class="row">
        <div class="col-md-6">
          <h3><span class="glyphicon glyphicon-flash"></span> <a href="/event-details?id=${entry.id}">${entry.title}</a></h3>
          <span>Available spots: ${entry.spots}</span><br/>
          <span>Registration due date: ${entry.registrationDueDate}</span><br/>
          <button>Register</button>
        </div>
        <hr/>
      </div>
    `;

    $(row).appendTo(container);

    console.log("Entry " + JSON.stringify(entry));
  }
};

async function verifyNetworkConnection() {
  try {
    let web3 = await getWeb3();
    let contract = await getContract(web3);
    var count = await contract.methods.getEntriesCount().call();
  } catch(err) {
    $('#mm-status').css('color', 'red').html(err);
  }
}

verifyNetworkConnection();