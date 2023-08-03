import React from 'react';
import { useState, useEffect } from "react";
import './stream.css';
import Navbar from '../navbar/Navbar';
import Sidebar from '../sidebar/Sidebar';
import { Button, Form, CardGroup} from "../../utils/Scripts";
import { FormGroup, FormControl, Spinner, Card, Container, Row, Col, Stack } from "react-bootstrap";
import createNewFlow from '../../superfluidFunctions/createStream';
import updateExistingFlow from '../../superfluidFunctions/updateStream';
import deleteFlow from '../../superfluidFunctions/deleteStream';
import UpgradeNear from '../../superfluidFunctions/upgradeNear';
import DowngradeNear from '../../superfluidFunctions/downgradeNear';
import { ChainId } from '@uniswap/sdk-core' 
 import { URI_AVAILABLE, WalletConnect, WalletConnectConstructorArgs } from '@web3-react/walletconnect-v2' 
 import { sendAnalyticsEvent } from 'analytics' 
 import { L1_CHAIN_IDS, L2_CHAIN_IDS } from 'constants/chains' 
 import { Z_INDEX } from 'theme/zIndex' 
 import { isIOS } from 'utils/userAgent' 
  
 import { RPC_URLS } from '../constants/networks'

// Avoid testing for the best URL by only passing a single URL per chain. 
 // Otherwise, WC will not initialize until all URLs have been tested (see getBestUrl in web3-react). 
 const RPC_URLS_WITHOUT_FALLBACKS = Object.entries(RPC_URLS).reduce( 
   (map, [chainId, urls]) => ({ 
     ...map, 
     [chainId]: urls[0], 
   }), 
   {} 
 )
export class WalletConnectV2 extends WalletConnect { 
   ANALYTICS_EVENT = 'Wallet Connect QR Scan' 
   constructor({ 
     actions, 
     defaultChainId, 
     qrcode = true, 
     onError, 
   }: Omit<WalletConnectConstructorArgs, 'options'> & { defaultChainId: number; qrcode?: boolean }) { 
     const darkmode = Boolean(window.matchMedia('(prefers-color-scheme: dark)')) 
     super({ 
       actions, 
       options: { 
         projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID as string, 
         chains: [defaultChainId], 
         optionalChains: [...L1_CHAIN_IDS, ...L2_CHAIN_IDS], 
         showQrModal: qrcode, 
         rpcMap: RPC_URLS_WITHOUT_FALLBACKS, 
         // as of 6/16/2023 there are no docs for `optionalMethods` 
         // this set of optional methods fixes a bug we encountered where permit2 signatures were never received from the connected wallet 
         // source: https://uniswapteam.slack.com/archives/C03R5G8T8BH/p1686858618164089?thread_ts=1686778867.145689&cid=C03R5G8T8BH 
         optionalMethods: ['eth_signTypedData', 'eth_signTypedData_v4', 'eth_sign'], 
         qrModalOptions: { 
           desktopWallets: undefined, 
           enableExplorer: true, 
           explorerExcludedWalletIds: undefined, 
           explorerRecommendedWalletIds: undefined, 
           mobileWallets: undefined, 
           privacyPolicyUrl: undefined, 
           termsOfServiceUrl: undefined, 
           themeMode: darkmode ? 'dark' : 'light', 
           themeVariables: { 
             '--wcm-font-family': '"Inter custom", sans-serif', 
             '--wcm-z-index': Z_INDEX.modal.toString(), 
           }, 
           walletImages: undefined, 
         }, 
       }, 
       onError, 
     }) 
   } 
 

const Stream = () => {
    const [recipient, setRecipient] = useState("");
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [flowRate, setFlowRate] = useState("");
    const [flowRateDisplay, setFlowRateDisplay] = useState("");
    const [currentAccount, setCurrentAccount] = useState("");

    const connectWallet = async () => {
        const { ethereum } = window;
        if (!ethereum) {
            console.log("Ensure you have a MetaMask");
        }

        try {
            const accounts = await ethereum.request({
                method: "eth_requestAccounts",
            });
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log("Error connecting to wallet: ", error);
        }
    };

    const checkIfWalletIsConnected = async () => {
        const { ethereum } = window;
        if (!ethereum) {
            console.log("Ensure you have a MetaMask");
        }
        const accounts = await ethereum.request({
            method: "eth_requestAccounts",
        });
        const chain = await ethereum.request({ method: "eth_chainId" });
        console.log("chain ID:", chain);

        console.log(accounts[0]);
        console.log('0x888D08001F91D0eEc2f16364779697462A9A713D');

        if (accounts.length > 0) {
            console.log("Found an authorized account: ", accounts[0]);
            setCurrentAccount(accounts[0]);
        } else {
            console.log("No authorized account found");
        }
    };

    useEffect(() => {
        checkIfWalletIsConnected();
    });

    function calculateFlowRate(amount) {
        if (
            typeof Number(amount) !== "number" ||
            isNaN(Number(amount)) === true
        ) {
            alert("You can only calculate a flowRate based on a number");
            return;
        } else if (typeof Number(amount) === "number") {
            if (Number(amount) === 0) {
                return 0;
            }
            const amountInWei = ethers.BigNumber.from(amount);
            const monthlyAmount = ethers.utils.formatEther(
                amountInWei.toString()
            );
            const calculatedFlowRate = monthlyAmount * 3600 * 24 * 30;
            return calculatedFlowRate;
        }
    }
    

    function CreateButton({ isLoading, children, ...props }) {
        return (
            <Button variant="success" className="button" {...props}>
                {isButtonLoading ? <Spinner animation="border" /> : children}
            </Button>
        );
    }

    function UpdateButton({ isLoading, children, ...props }) {
        return (
            <Button variant="success" className="button" {...props}>
                {isButtonLoading ? <Spinner animation="border" /> : children}
            </Button>
        );
    }

    function DeleteButton({ isLoading, children, ...props }) {
        return (
            <Button variant="success" className="button" {...props}>
                {isButtonLoading ? <Spinner animation="border" /> : children}
            </Button>
        );
    }

    const handleRecipientChange = (event) => {
        setRecipient(() => ([event.target.name] = event.target.value));
    };

    const handleFlowRateChange = (event) => {
        setFlowRate(() => ([event.target.name] = event.target.value));
        let newFlowRateDisplay = calculateFlowRate(event.target.value);
        setFlowRateDisplay(newFlowRateDisplay.toString());
    };
      activate(chainId?: number) { 
     sendAnalyticsEvent(this.ANALYTICS_EVENT) 
     return super.activate(chainId) 
   } 
 } 
  
 // Custom class for Uniswap Wallet specific functionality 
 export class UniwalletConnect extends WalletConnectV2 { 
   ANALYTICS_EVENT = 'Uniswap Wallet QR Scan' 
   static UNI_URI_AVAILABLE = 'uni_uri_available' 
  
   constructor({ actions, onError }: Omit<WalletConnectConstructorArgs, 'options'>) { 
     // disables walletconnect's proprietary qr code modal; instead UniwalletModal will listen for events to trigger our custom modal 
     super({ actions, defaultChainId: ChainId.MAINNET, qrcode: false, onError }) 
  
     this.events.once(URI_AVAILABLE, () => { 
       this.provider?.events.on('disconnect', this.deactivate) 
     }) 
  
     this.events.on(URI_AVAILABLE, (uri) => { 
       if (!uri) return 
       // Emits custom wallet connect code, parseable by the Uniswap Wallet 
       this.events.emit(UniwalletConnect.UNI_URI_AVAILABLE, `hello_uniwallet:${uri}`) 
  
       // Opens deeplink to Uniswap Wallet if on iOS 
       if (isIOS) { 
         // Using window.location.href to open the deep link ensures smooth navigation and leverages OS handling for installed apps, 
         // avoiding potential popup blockers or inconsistent behavior associated with window.open 
         window.location.href = `uniswap://wc?uri=${encodeURIComponent(uri)}` 
       } 
     }) 
   } 
  
   deactivate() { 
     this.events.emit(URI_AVAILABLE) 
     return super.deactivate() 
   } 
}

  return (
    <div>
        <div className='per__navi'>
          <Sidebar />
          <Navbar />
        </div>
        <div className="sfb__heather">
         <h1 className="gradient__text">Stream Near</h1>
       </div>
       <div>
       <CardGroup>
         <Card>
           <Card.Body>
             <UpgradeNear />
           </Card.Body>
         </Card>
         <Card>
           <Card.Body>
             <Card.Title>Send Stream</Card.Title>
             <Form>
              <FormGroup className="mb-4">
              <Form.Label>Stream to Address</Form.Label> 
                <FormControl
                    name="recipient"
                    value={recipient}
                    onChange={handleRecipientChange}
                    placeholder="Enter recipient address"
                ></FormControl>
              </FormGroup>
              <FormGroup className="mb-4">
              <Form.Label>Amount to Stream</Form.Label>
                <FormControl
                    name="flowRate"
                    value={flowRate}
                    onChange={handleFlowRateChange}
                    placeholder="Enter a flowRate in wei/second"
                ></FormControl>
                </FormGroup>
            </Form>
            <Stack gap={3}>
            <div className="description">
              <div className="calculation">
                <p>Your flow will be equal to:</p>
                <p>
                <b>{flowRateDisplay !== " " ? flowRateDisplay : 0}</b>{" "}
                NEARx/month
                </p>
              </div>
            </div>
            <Container>
             <Row>
               <Col></Col>
               <Col xs={5}>
                 <CreateButton
                   onClick={() => {
                     setIsButtonLoading(true);
                     createNewFlow(recipient, flowRate);
                     setTimeout(() => {
                       setIsButtonLoading(false);
                       }, 1000);
                     }}
                     >
                     Click to Create Your Stream
                 </CreateButton>
                </Col>
                <Col></Col>
             </Row>
            </Container>
            </Stack>
           </Card.Body>
         </Card>
         <Card>
           <Card.Body>
             <DowngradeNear />
           </Card.Body>
         </Card>
       </CardGroup>    
      </div>
      <div className="sfb__heather">
        <h1 className="gradient__text">Change a Flow</h1>
      </div>
      <div>
       <CardGroup>
         <Card>
           <Card.Body>
             <Card.Title>Update a Stream</Card.Title>
             <Form>
                <FormGroup className="mb-3"> 
                    <FormControl
                        name="recipient"
                        value={recipient}
                        onChange={handleRecipientChange}
                        placeholder="Enter your Ethereum address"
                    ></FormControl>
                </FormGroup>
                <FormGroup className="mb-3">
                    <FormControl
                        name="flowRate"
                        value={flowRate}
                        onChange={handleFlowRateChange}
                        placeholder="Enter a flowRate in wei/second"
                    ></FormControl>
                </FormGroup>
                <Container>
                <Row>
                  <Col></Col>
                  <Col xs={5}>
                    <UpdateButton
                    onClick={() => {
                        setIsButtonLoading(true);
                        updateExistingFlow(recipient, flowRate);
                        setTimeout(() => {
                            setIsButtonLoading(false);
                        }, 1000);
                    }}
                >
                       Click to Update Your Stream
                    </UpdateButton>
                  </Col>
                  <Col></Col>
                </Row>
                </Container>
              </Form>
           </Card.Body>
         </Card>
         <Card>
           <Card.Body>
             <Card.Title>Delete a Stream</Card.Title>
             <Form>
                <FormGroup className="mb-3">
                    <FormControl
                        name="recipient"
                        value={recipient}
                        onChange={handleRecipientChange}
                        placeholder="Enter your Ethereum address"
                    ></FormControl>
                </FormGroup>
              </Form>  
            <Container>
             <Row>
               <Col></Col>
               <Col xs={5}>
               <DeleteButton
                    onClick={() => {
                        setIsButtonLoading(true);
                        deleteFlow(recipient);
                        setTimeout(() => {
                            setIsButtonLoading(false);
                        }, 1000);
                    }}
                >
                    Click to Delete Your Stream
                </DeleteButton>
                </Col>
                <Col></Col>
             </Row>
            </Container>
           </Card.Body>
         </Card>
       </CardGroup>    
      </div>
    </div>
  )
}

export default Stream
