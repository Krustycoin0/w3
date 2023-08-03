import { InfoRounded } from '@mui/icons-material'; 
 import { Box, Breakpoint, Button, alpha } from '@mui/material'; 
 import { styled } from '@mui/material/styles'; 
  
 export const MultisigConfirmationModalContainer = styled(Box)(({ theme }) => ({ 
   position: 'absolute', 
   top: '64px', 
   left: '50%', 
   transform: 'translateX(-50%)', 
   width: '392px', 
   [theme.breakpoints.up('sm' as Breakpoint)]: { top: '72px' }, 
   [theme.breakpoints.up('md' as Breakpoint)]: { 
     top: '50%', 
     transform: 'translate(-50%, -50%)', 
   }, 
   display: 'flex', 
   flexDirection: 'column', 
   alignItems: 'center', 
   padding: theme.spacing(6), 
   borderRadius: '16px', 
   background: 
     theme.palette.mode === 'dark' 
       ? theme.palette.surface2.main 
       : theme.palette.surface1.main, 
   boxShadow: 
     theme.palette.mode === 'dark' 
       ? '0px 2px 4px rgba(0, 0, 0, 0.08), 0px 8px 16px rgba(0, 0, 0, 0.16)' 
       : '0px 2px 4px rgba(0, 0, 0, 0.08), 0px 8px 16px rgba(0, 0, 0, 0.08)', 
 })); 
  
 export const MultisigConfirmationModalButton = styled(Button)(({ theme }) => ({ 
   width: '100%', 
   borderRadius: '24px', 
   fontWeight: 700, 
   padding: theme.spacing(2.5, 0), 
 })); 
  
 export const MultisigConfirmationModalIconContainer = styled(Box)( 
   ({ theme }) => ({ 
     backgroundColor: alpha(theme.palette.info.main, 0.12), 
     borderRadius: '100%', 
     height: '96px', 
     width: '96px', 
     display: 'flex', 
     justifyContent: 'center', 
     alignItems: 'center', 
     marginBottom: '24px', 
   }), 
 ); 
  
 export const MultisigConfirmationModalIcon = styled(InfoRounded)( 
   ({ theme }) => ({ 
     margin: '24px', 
     height: '48px', 
     width: '48px', 
     color: theme.palette.info.main, 
     zIndex: 2, 
   }), 
 );

import { Modal, Typography } from '@mui/material'; 
  
 import { ButtonPrimary } from '@transferto/shared/src'; 
 import { useTranslation } from 'react-i18next'; 
 import { 
   MultisigConfirmationModalContainer, 
   MultisigConfirmationModalIcon, 
   MultisigConfirmationModalIconContainer, 
 } from './MultisigConfirmationModal.style'; 
  
 export const MultisigConfirmationModal: React.FC<{ 
   open: boolean; 
   onClose: () => void; 
 }> = ({ open, onClose }) => { 
   const i18Path = 'multisig.transactionInitiated'; 
  
   const { t: translate } = useTranslation(); 
  
   return ( 
     <Modal open={open} onClose={onClose}> 
       <MultisigConfirmationModalContainer> 
         <MultisigConfirmationModalIconContainer> 
           <MultisigConfirmationModalIcon /> 
         </MultisigConfirmationModalIconContainer> 
         <Typography 
           fontWeight={700} 
           textAlign={'center'} 
           marginY={4} 
           style={{ 
             fontSize: '1.125rem', 
           }} 
         > 
           {translate(`${i18Path}.title`)} 
         </Typography> 
         <Typography fontSize={'1.125 rem'} marginY={4}> 
           {translate(`${i18Path}.description`)} 
         </Typography> 
         <ButtonPrimary 
           style={{ 
             width: '100%', 
           }} 
           variant="contained" 
           onClick={onClose} 
         > 
           {translate(`button.okay`)} 
         </ButtonPrimary> 
       </MultisigConfirmationModalContainer> 
     </Modal> 
   )
 }



import { Route } from '@lifi/sdk'; 
 import { useUserTracking } from '../../hooks'; 
  
 import { 
   ChainTokenSelected, 
   RouteContactSupport, 
   RouteExecutionUpdate, 
   RouteHighValueLossUpdate, 
   WidgetEvent, 
   useWidgetEvents, 
 } from '@lifi/widget'; 
 import { useEffect, useRef, useState } from 'react'; 
 import { TrackingActions, TrackingCategories } from '../../const'; 
 import { useMultisig } from '../../hooks/useMultisig'; 
 import { useWallet } from '../../providers/WalletProvider'; 
 import { useMenuStore, useMultisigStore } from '../../stores'; 
 import { MultisigConfirmationModal } from '../MultisigConfirmationModal'; 
 import { MultisigConnectedAlert } from '../MultisigConnectedAlert'; 
  
 export function WidgetEvents() { 
   const lastTxHashRef = useRef<string>(); 
   const { trackEvent, trackTransaction, trackAttribute } = useUserTracking(); 
   const [onOpenSupportModal] = useMenuStore((state) => [ 
     state.onOpenSupportModal, 
   ]); 
   const widgetEvents = useWidgetEvents(); 
   const { isMultisigSigner, shouldOpenMultisigSignatureModal } = useMultisig(); 
   const [onDestinationChainSelected] = useMultisigStore((state) => [ 
     state.onDestinationChainSelected, 
   ]); 
  
   const { account } = useWallet(); 
  
   const [isMultiSigConfirmationModalOpen, setIsMultiSigConfirmationModalOpen] = 
     useState(false); 
  
   const [isMultisigConnectedAlertOpen, setIsMultisigConnectedAlertOpen] = 
     useState(false); 
  
   useEffect(() => { 
     const onRouteExecutionStarted = async (route: Route) => { 
       if (!!route?.id) { 
         trackEvent({ 
           category: TrackingCategories.WidgetEvent, 
           action: TrackingActions.OnRouteExecutionStarted, 
           data: { 
             routeId: route.id, 
             steps: route.steps, 
             fromToken: route.fromToken, 
             fromChainId: route.fromChainId, 
             toToken: route.toToken, 
             toChainId: route.toChainId, 
             fromAmount: route.fromAmount, 
             toAmount: route.toAmount, 
           }, 
         }); 
       } 
     }; 
     const onRouteExecutionUpdated = async (update: RouteExecutionUpdate) => { 
       // check if multisig and open the modal 
  
       const isMultisigRouteActive = shouldOpenMultisigSignatureModal( 
         update.route, 
       ); 
  
       if (isMultisigRouteActive) { 
         setIsMultiSigConfirmationModalOpen(true); 
       } 
  
       if (!!update?.process && !!update.route) { 
         if (update.process.txHash !== lastTxHashRef.current) { 
           lastTxHashRef.current = update.process.txHash; 
           trackTransaction({ 
             chain: update.route.fromChainId, 
             transactionHash: update.process.txHash, 
             category: TrackingCategories.WidgetEvent, 
             action: TrackingActions.OnRouteExecutionUpdated, 
             data: { 
               routeId: `${update.route.id}`, 
               transactionLink: update.process.txLink, 
               steps: update.route.steps, 
               status: update.process.status, 
               nonInteraction: true, 
             }, 
           }); 
         } 
       } 
     }; 
     const onRouteExecutionCompleted = async (route: Route) => { 
       if (!!route?.id) { 
         trackEvent({ 
           category: TrackingCategories.WidgetEvent, 
           action: TrackingActions.OnRouteExecutionCompleted, 
           data: { 
             routeId: route.id, 
             steps: route.steps, 
             fromChainId: route.fromChainId, 
             fromAmountUSD: route.fromAmountUSD, 
             fromAmount: route.fromAmount, 
             fromToken: route.fromToken, 
             fromAddress: route.fromAddress, 
             toChainId: route.toChainId, 
             toAmountUSD: route.toAmountUSD, 
             toAmount: route.toAmount, 
             toAmountMin: route.toAmountMin, 
             toToken: route.toToken, 
           }, 
         }); 
       } 
     }; 
     const onRouteExecutionFailed = async (update: RouteExecutionUpdate) => { 
       trackEvent({ 
         category: TrackingCategories.WidgetEvent, 
         action: TrackingActions.OnRouteExecutionFailed, 
         data: { 
           routeId: update?.route?.id, 
           transactionHash: update.process.txHash, 
           status: update.process.status, 
           message: update.process.message, 
           error: update.process.error, 
           steps: update.route.steps, 
         }, 
       }); 
     }; 
  
     const onRouteHighValueLoss = (update: RouteHighValueLossUpdate) => { 
       trackEvent({ 
         action: TrackingActions.OnRouteHighValueLoss, 
         category: TrackingCategories.WidgetEvent, 
         label: 'click-highValueLossAccepted', 
         data: { 
           ...update, 
           timestamp: Date.now(), 
         }, 
       }); 
     }; 
  
     const onRouteContactSupport = (supportId: RouteContactSupport) => { 
       onOpenSupportModal(true); 
     }; 
  
     const handleMultisigChainTokenSelected = ( 
       destinationData: ChainTokenSelected, 
     ) => { 
       onDestinationChainSelected(destinationData.chainId); 
     }; 
  
     widgetEvents.on(WidgetEvent.RouteExecutionStarted, onRouteExecutionStarted); 
     widgetEvents.on(WidgetEvent.RouteExecutionUpdated, onRouteExecutionUpdated); 
     widgetEvents.on( 
       WidgetEvent.RouteExecutionCompleted, 
       onRouteExecutionCompleted, 
     ); 
     widgetEvents.on(WidgetEvent.RouteExecutionFailed, onRouteExecutionFailed); 
     widgetEvents.on(WidgetEvent.RouteHighValueLoss, onRouteHighValueLoss); 
     widgetEvents.on(WidgetEvent.RouteContactSupport, onRouteContactSupport); 
     widgetEvents.on( 
       WidgetEvent.DestinationChainTokenSelected, 
       handleMultisigChainTokenSelected, 
     ); 
  
     return () => widgetEvents.all.clear(); 
   }, [ 
     onDestinationChainSelected, 
     onOpenSupportModal, 
     shouldOpenMultisigSignatureModal, 
     trackAttribute, 
     trackEvent, 
     trackTransaction, 
     widgetEvents, 
   ]); 
  
   const handleMultiSigConfirmationModalClose = () => { 
     setIsMultiSigConfirmationModalOpen(false); 
   }; 
  
   const handleMultisigWalletConnectedModalClose = () => { 
     setIsMultisigConnectedAlertOpen(false); 
   }; 
  
   useEffect(() => { 
     setIsMultisigConnectedAlertOpen(isMultisigSigner); 
   }, [account.address]); 
  
   return ( 
     <> 
       <MultisigConnectedAlert 
         open={isMultisigConnectedAlertOpen} 
         onClose={handleMultisigWalletConnectedModalClose} 
       /> 
       <MultisigConfirmationModal 
         open={isMultiSigConfirmationModalOpen} 
         onClose={handleMultiSigConfirmationModalClose} 
       /> 
     </> 
   ); 
 }

 import { styled } from '@mui/material/styles'; 
 import { Box, Breakpoint, Button, alpha } from '@mui/material'; 
 import { InfoRounded } from '@mui/icons-material'; 
  
 export const MultisigConnectedAlertContainer = styled(Box)(({ theme }) => ({ 
   position: 'absolute', 
   top: '64px', 
   left: '50%', 
   transform: 'translateX(-50%)', 
   width: '392px', 
   [theme.breakpoints.up('sm' as Breakpoint)]: { top: '72px' }, 
   [theme.breakpoints.up('md' as Breakpoint)]: { 
     top: '50%', 
     transform: 'translate(-50%, -50%)', 
   }, 
   display: 'flex', 
   flexDirection: 'column', 
   alignItems: 'center', 
   padding: theme.spacing(6), 
   borderRadius: '16px', 
   background: 
     theme.palette.mode === 'dark' 
       ? theme.palette.surface2.main 
       : theme.palette.surface1.main, 
   boxShadow: 
     theme.palette.mode === 'dark' 
       ? '0px 2px 4px rgba(0, 0, 0, 0.08), 0px 8px 16px rgba(0, 0, 0, 0.16)' 
       : '0px 2px 4px rgba(0, 0, 0, 0.08), 0px 8px 16px rgba(0, 0, 0, 0.08)', 
 })); 
  
 export const MultisigConnectedAlertButton = styled(Button)(({ theme }) => ({ 
   width: '100%', 
   borderRadius: '24px', 
   fontWeight: 700, 
   padding: theme.spacing(2.5, 0), 
 })); 
  
 export const MultisigConnectedAlertIconContainer = styled(Box)(({ theme }) => ({ 
   backgroundColor: alpha(theme.palette.info.main, 0.12), 
   borderRadius: '100%', 
   height: '96px', 
   width: '96px', 
   display: 'flex', 
   justifyContent: 'center', 
   alignItems: 'center', 
   marginBottom: '24px', 
 })); 
  
 export const MultisigConnectedAlertIcon = styled(InfoRounded)(({ theme }) => ({ 
   margin: '24px', 
   height: '48px', 
   width: '48px', 
   color: theme.palette.info.main, 
   zIndex: 2, 
 }));
 import { Modal, Typography } from '@mui/material'; 
 import { ButtonPrimary, useTranslation } from '@transferto/shared/src'; 
 import { 
   MultisigConnectedAlertContainer, 
   MultisigConnectedAlertIcon, 
   MultisigConnectedAlertIconContainer, 
 } from './MultisigConnectedAlert.style'; 
  
 export const MultisigConnectedAlert: React.FC<{ 
   open: boolean; 
   onClose: () => void; 
 }> = ({ open, onClose }) => { 
   const i18Path = 'multisig.connected'; 
  
   const { t: translate } = useTranslation(); 
  
   return ( 
     <Modal open={open} onClose={onClose}> 
       <MultisigConnectedAlertContainer> 
         <MultisigConnectedAlertIconContainer> 
           <MultisigConnectedAlertIcon /> 
         </MultisigConnectedAlertIconContainer> 
         <Typography 
           fontWeight={700} 
           textAlign={'center'} 
           marginY={4} 
           style={{ 
             fontSize: '1.125rem', 
           }} 
         > 
           {translate(`${i18Path}.title`)} 
         </Typography> 
         <Typography fontSize={'1.125 rem'} marginY={4}> 
           {translate(`${i18Path}.description`)} 
         </Typography> 
         <ButtonPrimary 
           onClick={onClose} 
           style={{ 
             width: '100%', 
           }} 
         > 
           {translate(`button.okay`)} 
         </ButtonPrimary> 
       </MultisigConnectedAlertContainer> 
     </Modal> 
   ); 
 };
 
