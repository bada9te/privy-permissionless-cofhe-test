import { useCallback, useEffect, useState } from "react";
import {useReadWriteFhenixContract} from "@/hooks/TEST_Fhenix";
import {useSmartAccount} from "@/providers/smartAccountProvider";
import {useFhenix} from "@/hooks/TEST_useFhenix";
import { useLinkWithSiwe, useLogin, usePrivy } from "@privy-io/react-auth";
import { COUNTER_FHENIX, SELECTED_NETWORK_FHENIX } from "@/config/constants";
import { Encryptable, EncryptStep, FheTypes, Permit, SealingKey } from "cofhejs/web";


export default function TEST() {
    const { smartAccountClientFhenix, smartAccountAddress } = useSmartAccount();
    const {
        TEST_Fhenix_Write,
        TEST_Fhenix_Read,
        TEST_Fhenix_Decrypt,
        TEST_Fhenix_ReadEncrypted,
        TEST_Fhenix_WriteEncrypted,
    } = useReadWriteFhenixContract();
    const { cofhe, permit } = useFhenix();

    const write = useCallback(() => {
        if (smartAccountClientFhenix) {
            TEST_Fhenix_Write().then(hash => {
                console.log(`Confirmed ${hash}`);
            }).catch(console.log);
        }
    }, [smartAccountClientFhenix, TEST_Fhenix_Write]);

    const decrypt = useCallback(() => {
        if (smartAccountClientFhenix) {
            TEST_Fhenix_Decrypt().then(hash => {
                console.log(`Decrypted ${hash}`);
            }).catch(console.log);
        }
    }, [smartAccountClientFhenix, TEST_Fhenix_Decrypt]);

    const read = useCallback(() => {
        if (smartAccountClientFhenix) {
            TEST_Fhenix_Read().then(console.log);
        }
    }, [smartAccountClientFhenix, TEST_Fhenix_Read])


    const readEncrypted = useCallback(() => {
        console.log({ smartAccountClientFhenix, permit, smartAccountAddress })
        if (smartAccountClientFhenix && permit && smartAccountAddress) {
            console.log(`Read encrypted encrypted`);
            TEST_Fhenix_ReadEncrypted().then(async encryptedData => {
                console.log(`Encrypted: ${encryptedData}`);

                // Unseal
                const result = await cofhe.unseal(
                  BigInt(encryptedData as any),
                  FheTypes.Uint32,
                  permit.issuer,
                  permit.getHash()
                );

                if (!result.success) {
                    console.error('Failed to unseal:', result.error)
                    return
                }

                console.log(result.data);
            });
        }
    }, [smartAccountClientFhenix, TEST_Fhenix_ReadEncrypted, permit, cofhe, smartAccountAddress]);

    console.log(permit)


    const writeEncrypted = useCallback(async () => {
        if (!cofhe) return;

        const logger = (state: EncryptStep) => {
            console.log(`Log Encrypt State :: ${state}`);
        }
        const encryptedValues = await cofhe.encrypt(
          [Encryptable.uint64("10")],
          logger
        );

        console.log(encryptedValues.data)

        TEST_Fhenix_WriteEncrypted(encryptedValues.data?.[0]).then(console.log)
    }, [TEST_Fhenix_WriteEncrypted, cofhe]);









    // LOGIN / LOGOUT WITH PRIVY
    const { generateSiweMessage, linkWithSiwe } = useLinkWithSiwe();
    const [ isLoggedIn, setIsLoggedIn ] = useState(false);

    const { login } = useLogin({
        onComplete: async(user) => {
            console.log("LOGGED IN AS:", user);
            setIsLoggedIn(true);
        }
    });
    const { logout } = usePrivy();

    const handleLogout = () => {
        try {
            logout();
        } catch (e: any) {
            console.log("Error in privy logout");
        }

        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }

    const linkAccount = useCallback(async() => {
        if (!smartAccountClientFhenix || !smartAccountAddress) return;
        console.log(smartAccountAddress, smartAccountClientFhenix)

        const chainId = `eip155:${SELECTED_NETWORK_FHENIX.id}`;
        const message = await generateSiweMessage({
            address: smartAccountAddress,
            chainId
        });
        const signature = await smartAccountClientFhenix.signMessage({message});

        try {
            await linkWithSiwe({
                signature,
                message,
                chainId,
                //walletClientType: 'privy_smart_account',
                connectorType: 'safe'
            });
        } catch (error) {
            console.error(error);
        }
    }, [ smartAccountAddress, smartAccountClientFhenix ]);

    useEffect(() => {
        login();
    }, []);

    useEffect(() => {
        if (isLoggedIn && smartAccountClientFhenix && smartAccountAddress) {
            linkAccount().catch(console.log);
        }
    }, [isLoggedIn, smartAccountAddress, smartAccountClientFhenix, linkAccount]);




    return (
        <>
            <button className={"text-white bg-red-500 m-2 p-2"} onClick={write}>Write</button>
            <button className={"text-white bg-red-500 m-2 p-2"} onClick={decrypt}>Decrypt</button>
            <button className={"text-white bg-red-500 m-2 p-2"} onClick={read}>Read</button>
            <button className={"text-white bg-red-500 m-2 p-2"} onClick={readEncrypted}>Read Encrypted</button>
            <button className={"text-white bg-red-500 m-2 p-2"} onClick={writeEncrypted}>Write Encrypted</button>
        </>
    );
}






