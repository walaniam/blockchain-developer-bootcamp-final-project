
async function detectMetamask() {
  return new Promise((resolve, reject) => {
    window.addEventListener("load", async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          // ask user permission to access his accounts
          await window.ethereum.request({ method: "eth_requestAccounts" });
          $('#mm-status').html('Current Account: ' + ethereum.selectedAddress);
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      } else {
        reject("Metamask browser plugin not detected");
      }
    });
  });
};
  
async function getContract(web3) {
  const data = await $.getJSON("./contracts/SignMeUp.json");
  const netId = await web3.eth.net.getId();
  const deployedNetwork = data.networks[netId];

  console.log('Contract address: ' + (deployedNetwork && deployedNetwork.address));

  const signMeUp = new web3.eth.Contract(
    data.abi,
    deployedNetwork && deployedNetwork.address
  );
  signMeUp.setProvider(window.ethereum)

  return signMeUp;
};
