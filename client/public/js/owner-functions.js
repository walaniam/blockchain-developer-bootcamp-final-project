async function setPrice(newPrice, errorCallback) {
  let contract = await getContract(new Web3(window.ethereum));
  contract.methods
    .setPrice(newPrice)
    .send({from: ethereum.selectedAddress})
    .on('transactionHash', function(hash) {
      $('#mm-status').html("Transaction " + hash + " in progress. It may take up to few minutes to complete");
    })
    .on('confirmation', function(confirmationNumber, receipt) {      
      $('#mm-status').html("Confirmed: " + receipt);
    })
    .on('receipt', function(receipt) {
      console.log("Price changed: " + JSON.stringify(receipt));
      window.location = '/set-price';
    })
    .on('error', errorCallback);
}
