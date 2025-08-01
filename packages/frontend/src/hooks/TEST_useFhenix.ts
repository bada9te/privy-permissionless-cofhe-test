import { useEffect, useState } from "react";
import { useSmartAccount } from "@/providers/smartAccountProvider";

import { cofhejs, Permit } from "cofhejs/web";


export function useFhenix() {
    const { fhenixInitData, eoa, smartAccountClientFhenix, smartAccountAddress } = useSmartAccount();

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
                !smartAccountClientFhenix ||
                !smartAccountAddress
            )
                return;

            console.log("init", fhenixInitData);

            try {
                setIsInitializing(true);

                const result = await cofhejs.initializeWithViem({
                    viemClient: fhenixInitData.client,         // viem PublicClient
                    viemWalletClient: fhenixInitData.walletClient,        // viem WalletClient
                    environment: "TESTNET",
                    generatePermit: false,
                });


                await cofhejs.createPermit({
                    issuer: smartAccountAddress as any,
                    type: 'self'
                }).then(console.log);

                if (!result.success) {
                    throw new Error(result.error.message || "Cofhe init failed");
                }

                // Get the current active permit
                const permit = cofhejs.getPermit();

                // Extract permission data for contract calls
                const permission = permit.data?.getPermission();

                console.log({ permit, permission })

                setPermit(permit.data);
                setIsInitialized(true);
                setError(null);
            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err : new Error("Unknown error"));
            } finally {
                setIsInitializing(false);
            }
        };

        init();
    }, [eoa, fhenixInitData, smartAccountClientFhenix, smartAccountAddress]);

    return {
        isInitialized,
        isInitializing,
        error,
        permit,
        cofhe: cofhejs
    };
}