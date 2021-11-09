


const showStoredValue = async (contract) => {
  var value = await contract.methods.get().call();
  console.log("Fetched stored value: " + value);
  $("#ctrt-value").html(value);
};

async function loadApplication() {
  const web3 = await getWeb3();
  // const accounts = await web3.eth.getAccounts();
  // const contract = await getContract(web3);
  // showStoredValue(contract);

  const data = await $.getJSON("./contracts/SignMeUp.json");

  const netId = await web3.eth.net.getId();
  const deployedNetwork = data.networks[netId];
  console.log('Network address: ' + deployedNetwork.address);

  const signMeUp = new web3.eth.Contract(
    data.abi,
    deployedNetwork && deployedNetwork.address
  );
  signMeUp.setProvider(window.ethereum);

  showStoredValue(signMeUp);
}

loadApplication();