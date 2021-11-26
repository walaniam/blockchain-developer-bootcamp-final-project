
async function detectMetamask() {
  return new Promise((resolve, reject) => {
    window.addEventListener("load", async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          // ask user permission to access his accounts
          await window.ethereum.request({ method: "eth_requestAccounts" });
          var netId = await web3.eth.net.getId();
          var addressLabel = addressLabelOf(ethereum.selectedAddress, netId);
          $('#mm-status').html('Account: ' + addressLabel);
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      } else {
        reject("Metamask browser plugin not detected");
      }
    });
  });
}
  
async function getContract(web3) {
  await loadContract(web3);
  return window.signMeUpContract;
}

async function loadContract(web3) {
  if (typeof window.signMeUpContract === 'undefined') {
    const data = await $.getJSON("./contracts/SignMeUp.json");
    const netId = await web3.eth.net.getId();
    const deployedNetwork = data.networks[netId];
    // console.log('Resolved contract. Address: ' + (deployedNetwork && deployedNetwork.address));
    const signMeUp = new web3.eth.Contract(
      data.abi,
      deployedNetwork && deployedNetwork.address
    );
    signMeUp.setProvider(window.ethereum)
  
    window.signMeUpContract = signMeUp;
  } else {
    console.log("Contract cached");
  }
}

function networkNameOf(networkId) {
  if (networkId == 1) {
    return 'mainnet';
  } else if (networkId == 3) {
    return 'ropsten';
  } else if (networkId == 4) {
    return 'rinkeby';
  } else {
    return 'local';
  }
}

function etherScanUrlOf(networkId) {
  if (networkId == 1) {
    return 'https://etherscan.io/address/';
  } else if (networkId == 3) {
    return 'https://ropsten.etherscan.io/address/';
  } else if (networkId == 4) {
    return 'https://rinkeby.etherscan.io/';
  } else {
    return '';
  }
}

function addressLabelOf(address, networkId) {
  var network = networkNameOf(networkId);
  var addressPrefix = address.substring(0, 5);
  if (address.length > 9) {
    var addressSuffix = address.substring(address.length - 4);
  } else {
    var addressSuffix = '';
  }
  var label = `${addressPrefix}...${addressSuffix} (${network})`;
  return label;
}