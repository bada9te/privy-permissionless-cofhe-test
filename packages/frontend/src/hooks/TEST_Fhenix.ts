import {useSmartAccount} from "@/providers/smartAccountProvider";
import {COUNTER_FHENIX, SELECTED_NETWORK_FHENIX} from "@/config/constants";
import {encodeFunctionData} from "viem";
import {readContract, waitForTransactionReceipt} from "@wagmi/core";
import {config} from "@/config/wagmi";
import {useCallback} from "react";
import SimpleCounterAbi from "@/contracts/SimpleCounter.json";


export const useReadWriteFhenixContract = () => {
    const { smartAccountClientFhenix } = useSmartAccount();

    const processTransactionWrite = useCallback(async () => {
        const hash = await smartAccountClientFhenix.sendTransaction({
            account: smartAccountClientFhenix.account!,
            chain: SELECTED_NETWORK_FHENIX,
            to: COUNTER_FHENIX,
            data: encodeFunctionData({
                abi: SimpleCounterAbi,
                functionName: "increment_counter",
                args: [],
            })
        });

        console.log({hash});

        await waitForTransactionReceipt(config, {
            hash,
            confirmations: 2,
            pollingInterval: 300,
            chainId: SELECTED_NETWORK_FHENIX.id
        });

        return hash;
    }, [smartAccountClientFhenix]);


    const processTransactionDecrypt = useCallback(async () => {
        const hash = await smartAccountClientFhenix.sendTransaction({
            account: smartAccountClientFhenix.account!,
            chain: SELECTED_NETWORK_FHENIX,
            to: COUNTER_FHENIX,
            data: encodeFunctionData({
                abi: SimpleCounterAbi,
                functionName: "decrypt_counter",
                args: [],
            })
        });

        console.log({hash});

        await waitForTransactionReceipt(config, {
            hash,
            confirmations: 2,
            pollingInterval: 300,
            chainId: SELECTED_NETWORK_FHENIX.id
        });

        return hash;
    }, [smartAccountClientFhenix]);


    const processRead = useCallback(async () => {
        return await readContract(config, {
            address: COUNTER_FHENIX,
            abi: SimpleCounterAbi,
            functionName: "get_counter_value",
            chainId: SELECTED_NETWORK_FHENIX.id,
            args: [],
        });
    }, [smartAccountClientFhenix]);


    const processReadEncrypted = useCallback(async () => {
        return await readContract(config, {
            address: COUNTER_FHENIX,
            abi: SimpleCounterAbi,
            functionName: "get_encrypted_counter_value",
            chainId: SELECTED_NETWORK_FHENIX.id,
            args: [],
        });
    }, [smartAccountClientFhenix]);


    return {
        TEST_Fhenix_Write: processTransactionWrite,
        TEST_Fhenix_Decrypt: processTransactionDecrypt,
        TEST_Fhenix_Read: processRead,
        TEST_Fhenix_ReadEncrypted: processReadEncrypted,
    };
}