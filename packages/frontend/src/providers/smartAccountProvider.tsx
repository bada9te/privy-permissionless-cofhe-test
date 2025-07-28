import React, { useState, useEffect, useContext } from "react";
import { ConnectedWallet, usePrivy, useWallets } from "@privy-io/react-auth";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { Chain, Transport } from "viem";
import { signerToSafeSmartAccount, SmartAccount } from "permissionless/accounts";
import {
  walletClientToSmartAccountSigner,
  type SmartAccountClient,
  createSmartAccountClient,
  ENTRYPOINT_ADDRESS_V07,
} from "permissionless";
import { EntryPoint } from "permissionless/types";
import {
  createPimlicoBundlerClient,
  createPimlicoPaymasterClient,
} from "permissionless/clients/pimlico";
import {
  PIMLICO_PAYMASTER_URL_FHENIX,

  PIMLICO_BUNDLER_URL_FHENIX,

  SELECTED_NETWORK_FHENIX, RPC_FHENIX,
} from "../config/constants";

/** Interface returned by custom `useSmartAccount` hook */
interface SmartAccountInterface {
  /** Privy embedded wallet, used as a signer for the smart account */
  eoa: ConnectedWallet | undefined;

  /** Smart account client to send signature/transaction requests to the smart account */
  /**Fhenix Client */
  smartAccountClientFhenix:
      | SmartAccountClient<
      EntryPoint,
      Transport,
      Chain,
      SmartAccount<EntryPoint, string, Transport, Chain>
  >
      | Transport
      | any
      | SmartAccount<EntryPoint, string, Transport, Chain>
      | null;
  /** Smart account address */
  smartAccountAddress: `0x${string}` | undefined;
  /** Boolean to indicate whether the smart account state has initialized */
  smartAccountReady: boolean;
  fhenixInitData: {
    client: any,
    walletClient: any,
  }
}

const SmartAccountContext = React.createContext<SmartAccountInterface>({
  eoa: undefined,
  smartAccountClientFhenix: undefined,
  smartAccountAddress: undefined,
  smartAccountReady: false,
  fhenixInitData: {
    client: undefined,
    walletClient: undefined,
  },
});

export const useSmartAccount = () => {
  return useContext(SmartAccountContext);
};

export const SmartAccountProvider = ({ children }: { children: React.ReactNode }) => {
  // Get a list of all of the wallets (EOAs) the user has connected to your site
  const { wallets } = useWallets();
  const { ready } = usePrivy();
  // Find the embedded wallet by finding the entry in the list with a `walletClientType` of 'privy'
  const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === "privy");

  // States to store the smart account and its status
  const [eoa, setEoa] = useState<ConnectedWallet | undefined>();

  // Fhenix
  const [smartAccountClientFhenix, setSmartAccountClientFhenix] = useState<
      | SmartAccountClient<
      EntryPoint,
      Transport,
      Chain,
      SmartAccount<EntryPoint, string, Transport, Chain>
  >
      | Transport
      | any
      | SmartAccount<EntryPoint, string, Transport, Chain>
      | null
  >();
  const [fhenixInitData, setFhenixInitData] = useState<any>(undefined);

  const [smartAccountAddress, setSmartAccountAddress] = useState<`0x${string}` | undefined>();
  const [smartAccountReady, setSmartAccountReady] = useState(false);

  useEffect(() => {
    if (!ready) return;
  }, [ready, embeddedWallet]);

  useEffect(() => {
    // Creates a smart account given a Privy `ConnectedWallet` object representing
    // the  user's EOA.
    const createSmartWallet = async (eoa: ConnectedWallet) => {
      setEoa(eoa);
      // Get an EIP1193 provider and viem WalletClient for the EOA
      const eip1193provider = await eoa.getEthereumProvider();

      try {
        const pubkey = await eip1193provider.request({
          method: 'eth_getEncryptionPublicKey',
          params: [eoa.address],
        });

        console.log('Encryption public key:', pubkey);
      } catch (err) {
        console.warn('Encryption key not supported by this wallet');
      }


      // fhenix
      const privyClientFhenix = createWalletClient({
        account: eoa.address as `0x${string}`,
        chain: SELECTED_NETWORK_FHENIX,
        transport: custom(eip1193provider),
      });
      const customSignerFhenix = walletClientToSmartAccountSigner(privyClientFhenix);
      const publicClientFhenix = createPublicClient({
        chain: SELECTED_NETWORK_FHENIX, // Replace this with the chain of your app
        transport: http(RPC_FHENIX),
      });
      const safeAccountFhenix = await signerToSafeSmartAccount(publicClientFhenix, {
        signer: customSignerFhenix,
        safeVersion: "1.4.1",
        entryPoint: ENTRYPOINT_ADDRESS_V07,
      });

      //Paymaster/Bundler
      const pimlicoPaymasterFhenix = createPimlicoPaymasterClient({
        //chain: SELECTED_NETWORK,
        transport: http(PIMLICO_PAYMASTER_URL_FHENIX),
        entryPoint: ENTRYPOINT_ADDRESS_V07,
      });
      const pimlicoBundlerFhenix = createPimlicoBundlerClient({
        //chain: SELECTED_NETWORK,
        transport: http(PIMLICO_PAYMASTER_URL_FHENIX),
        entryPoint: ENTRYPOINT_ADDRESS_V07,
      });
      const smartAccountClientFhenix = createSmartAccountClient({
        account: safeAccountFhenix,
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        chain: SELECTED_NETWORK_FHENIX,
        bundlerTransport: http(PIMLICO_BUNDLER_URL_FHENIX),
        middleware: {
          sponsorUserOperation: pimlicoPaymasterFhenix.sponsorUserOperation,
          gasPrice: async () => (await pimlicoBundlerFhenix.getUserOperationGasPrice()).fast,
        },
      });
      //


      const smartAccountAddress = smartAccountClientFhenix.account?.address;

      setSmartAccountAddress(smartAccountAddress);
      setSmartAccountClientFhenix(smartAccountClientFhenix);
      setFhenixInitData({client: publicClientFhenix, walletClient: privyClientFhenix});
      setSmartAccountReady(true);

      console.log(smartAccountClientFhenix)
    };

    if (embeddedWallet) createSmartWallet(embeddedWallet);
  }, [embeddedWallet?.address]);

  return (
      <SmartAccountContext.Provider
          value={{
            smartAccountReady: smartAccountReady,
            smartAccountClientFhenix: smartAccountClientFhenix,
            smartAccountAddress: smartAccountAddress,
            eoa: eoa,
            fhenixInitData,
          }}
      >
        {children}
      </SmartAccountContext.Provider>
  );
};