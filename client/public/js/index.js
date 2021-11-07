
const ssAddress = '0x5D7B7F3e92a95C2A901D067C8443C3DF3caEdE17';

const showStoredValue = async (contract) => {
  var value = await contract.methods.get().call();
  console.log("Fetched stored value: " + value);
  $("#ctrt-value").html(value);
};

async function loadApplication() {
  const web3 = await getWeb3();
  // const accounts = await web3.eth.getAccounts();
  const contract = await getContract(web3);
  showStoredValue(contract);
}

loadApplication();