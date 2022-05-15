import React, { useEffect, useState } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import { ethers } from "ethers";
import myEpicNft from "./utils/MyEpicNFT.json";

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;

const App = () => {

  const CONTRACT_ADDRESS = "0xB9d803893ce580463675c2481De5e4C0291AbD79";

  // A state variable where we will store our user's public wallet
  const [currentAccount, setCurrentAcount] = useState("");
  

  const checkIfWalletIsConnected = async () => {
    // first make sure we have access to the windos ethereum
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have metamask added");
      return;
    } else {
      console.log("We have the Ethereum object ", ethereum);
    }

    // check if we are authorised to access the users wallet
    const accounts = await ethereum.request({method: "eth_accounts"});
    // user can have multiple accounts, so we grab the first one
    if (accounts.length != 0) {
      const account = accounts[0];
      console.log("We found an authorised account ", account);
      setCurrentAcount(account.address);
      setupEventListener();
    } else {
      console.log("No authorised account found");
    }
  }

  // Connecting the metamask wallet account
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get Metamask!");
        return;
      }
      const accounts = await ethereum.request({method: "eth_requestAccounts"});
      console.log("Account Connected ", accounts[0]);
      setCurrentAcount(accounts[0]);
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  }

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });
        console.log("Set up event listener");
      } else {
        console.log("Ethereum object does not exist");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        // making transactions
        console.log("Going to open the wallet for transaction fee");
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining...please wait...");
        await nftTxn.wait();
        console.log(`Mined, see the transaction https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
      } else {
        console.log("Ethereum object does not exits");
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => (
    <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
              Mint NFT
            </button>
  );

  // this runs the funciton when our page loads
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
            {currentAccount === "" ?                                         renderNotConnectedContainer() : renderMintUI()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;