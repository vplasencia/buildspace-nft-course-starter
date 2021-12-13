import React, { useEffect, useState } from "react";
import "./styles/output.css";
import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";

import { ethers } from "ethers";

import myEpicNft from "./utils/MyEpicNFT.json";

const TWITTER_HANDLE = "ViviPlasenciaC";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const OPENSEA_LINK =
  "https://testnets.opensea.io/collection/squarenft-ax0kwjubqi";

const CONTRACT_ADDRESS = "0x170F5FFEB11F56F35505C54C55233040C54227C8";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");

  const [loaderState, setLoaderState] = useState(false);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      // Setup listener! This is for the case where a user comes to our site
      // and ALREADY had their wallet connected + authorized.
      setupEventListener();
    } else {
      console.log("No authorized account found");
    }
  };

  /*
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      let chainId = await ethereum.request({ method: "eth_chainId" });
      console.log("Connected to chain " + chainId);

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
      }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(
            `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });

        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        setLoaderState(true);
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining...please wait.");
        await nftTxn.wait();

        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
        setLoaderState(false);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
      setLoaderState(false);
    }
  };

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="text-white font-semibold px-5 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 rounded-md"
    >
      Connect to Wallet
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  /*
   * Added a conditional render! We don't want to show Connect to Wallet if we're already conencted :).
   */
  return (
    <div className="flex flex-col h-screen px-2 bg-gray-900">
      <header className="flex place-content-center mt-10">
        <h1 className="text-5xl text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-500 font-extrabold">
          My NFT Collection
        </h1>
      </header>
      <div className="mb-auto">
        <div className="flex place-content-center mt-5">
          <p className="text-2xl text-white text-center">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
        </div>
        <div className="flex  items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-5">
            <a
              href={OPENSEA_LINK}
              target="_blank"
              rel="noreferrer noopener nofollow"
              className="text-white font-semibold px-5 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 rounded-md"
            >
              🌊 View Collection on OpenSea
            </a>
            {currentAccount === "" ? (
              renderNotConnectedContainer()
            ) : (
              <button
                onClick={askContractToMintNft}
                className="text-white font-semibold px-5 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 rounded-md"
                disabled={loaderState}
                style={loaderState ? {cursor: "not-allowed"} : {}}
              >
                <div className="flex place-content-center space-x-2">
                  {loaderState && <div id="loader"></div>}
                  <span>Mint NFT</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
      <footer className="my-5">
        <a
          className="flex items-center justify-center text-white underline hover:no-underline"
          href={TWITTER_LINK}
          target="_blank"
          rel="noreferrer noopener nofollow"
        >
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <span>{`@${TWITTER_HANDLE}`}</span>
        </a>
      </footer>
    </div>
  );
};

export default App;
