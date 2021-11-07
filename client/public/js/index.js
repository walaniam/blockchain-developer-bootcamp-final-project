
const showStoredValue = async (contract) => {
  let value = await contract.methods.get().call();
  $("#ctrt-value").html(value);
};

async function loadApplication() {
  const web3 = await getWeb3();
  // const accounts = await web3.eth.getAccounts();
  const contract = await getContract(web3);
  showStoredValue(contract);
}

loadApplication();