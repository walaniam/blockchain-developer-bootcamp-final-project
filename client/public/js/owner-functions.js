async function setPrice(newPrice) {
  let contract = await getContract(new Web3(window.ethereum));
  let transaction = await contract.methods
    .setPrice(newPrice)
    .send({from: ethereum.selectedAddress});

  console.log("Transaction: " + JSON.stringify(transaction));
}
