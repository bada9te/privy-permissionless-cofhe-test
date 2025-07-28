import { cofhejs } from "cofhejs/web";
import { useEffect, useState } from "react";
import { useSmartAccount } from "@/providers/smartAccountProvider";
import { createWalletClient, custom } from "viem";
import { SELECTED_NETWORK_FHENIX } from "@/config/constants";


export function useFhenix() {
    const { fhenixInitData, eoa, smartAccountAddress, smartAccountClientFhenix } = useSmartAccount();

    const [isInitialized, setIsInitialized] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [permit, setPermit] = useState();


    useEffect(() => {
        const init = async () => {
            if (
                !eoa ||
                !fhenixInitData?.client ||
                !fhenixInitData?.walletClient ||
                isInitialized ||
                isInitializing ||
                !smartAccountClientFhenix
            )
                return;

            try {
                setIsInitializing(true);

                const eip1193provider = await eoa.getEthereumProvider();

                const viemWalletClient = createWalletClient({
                    account: eoa.address as `0x${string}`,
                    chain: SELECTED_NETWORK_FHENIX,
                    transport: custom(eip1193provider),
                });

                const result = await cofhejs.initializeWithViem({
                    viemClient: smartAccountClientFhenix,         // viem PublicClient
                    viemWalletClient: viemWalletClient,        // viem WalletClient
                    environment: "TESTNET",
                    wasmPath: "/tfhe_bg.wasm",
                    generatePermit: true,
                });

                await cofhejs.createPermit().then(console.log)



                if (result.success) {
                    setPermit(result.data);
                    setIsInitialized(true);
                    setError(null);
                } else {
                    throw new Error(result.error.message || "Cofhe init failed");
                }
            } catch (err) {
                setError(err instanceof Error ? err : new Error("Unknown error"));
            } finally {
                setIsInitializing(false);
            }
        };

        init();
    }, [eoa, fhenixInitData, isInitialized, isInitializing, smartAccountClientFhenix]);

    return {
        isInitialized,
        isInitializing,
        error,
        permit,
        cofhe: cofhejs,
    };
}