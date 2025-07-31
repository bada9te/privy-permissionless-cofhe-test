import { useEffect, useState } from "react";
import { useSmartAccount } from "@/providers/smartAccountProvider";

import { cofhejs, Permit } from "cofhejs/web";


export function useFhenix() {
    const { fhenixInitData, eoa, smartAccountClientFhenix } = useSmartAccount();

    const [isInitialized, setIsInitialized] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [permit, setPermit] = useState<Permit | null>(null);


    useEffect(() => {
        const init = async () => {
            //console.log("init", fhenixInitData);
            if (
                !eoa ||
                !fhenixInitData?.client ||
                !fhenixInitData?.walletClient ||
                isInitialized ||
                isInitializing ||
                !smartAccountClientFhenix
            )
                return;

            console.log("init", fhenixInitData);

            try {
                setIsInitializing(true);

                const result = await cofhejs.initializeWithViem({
                    viemClient: fhenixInitData.client,         // viem PublicClient
                    viemWalletClient: fhenixInitData.walletClient,        // viem WalletClient
                    environment: "TESTNET",
                    generatePermit: true,
                });


                await cofhejs.createPermit().then(console.log)


                if (result.success) {
                    setPermit(result.data as Permit);
                    setIsInitialized(true);
                    setError(null);
                } else {
                    throw new Error(result.error.message || "Cofhe init failed");
                }

                // Get the current active permit
                const permit = cofhejs.getPermit();

                // Extract permission data for contract calls
                const permission = permit.data?.getPermission();

                console.log({ permit, permission })
            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err : new Error("Unknown error"));
            } finally {
                setIsInitializing(false);
            }
        };

        init();
    }, [eoa, fhenixInitData, smartAccountClientFhenix]);

    return {
        isInitialized,
        isInitializing,
        error,
        permit,
        cofhe: cofhejs
    };
}