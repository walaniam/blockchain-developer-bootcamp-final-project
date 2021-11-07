const getWeb3 = () => {
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
            $('#mm-status').html('Failed: ' + error.message);
            reject(error);
          }
        } else {
          $('#mm-status').html('MetaMask plugin not detected in the browser');
          reject("Metamask browser plugin not detected");
        }
      });
    });
  };

  const getContract = async (web3) => {
    const data = await $.getJSON("./contracts/SignMeUp.json");
  
    const netId = await web3.eth.net.getId();
    const deployedNetwork = data.networks[netId];
    const signMeUp = new web3.eth.Contract(
      data.abi,
      deployedNetwork && deployedNetwork.address
    );
    return signMeUp;
  };
  