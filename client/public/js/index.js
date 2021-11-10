
async function showStoredValue(contract) {
  var value = await contract.methods.get().call();
  console.log("Fetched stored value: " + value);
  $("#ctrt-value").html(value);
};

async function getSignUpEntries() {
  let web3 = await getWeb3();
  let contract = await getContract(web3);
  var count = await contract.methods.getEntriesCount().call();
  
  for (let i = 0; i < count; i++) {
    var value = await contract.methods.entries(i).call();
    try {
      console.log("dupa");
    console.log("Entry " + JSON.stringify(value));
    } catch (err) {
      console.log(err);
    }
  }

  console.log("Entries count: " + count);

  $("#ctrt-value").html("Entries count: " + count);
};

async function verifyNetworkConnection() {
  try {
    let web3 = await getWeb3();
    let contract = await getContract(web3);
    // showStoredValue(contract);
  } catch(err) {
    $('#mm-status').css('color', 'red').html(err);
  }
}

verifyNetworkConnection();
getSignUpEntries();