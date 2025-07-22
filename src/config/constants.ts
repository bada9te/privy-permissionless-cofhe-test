// @ts-nocheck
import { arbitrumSepolia } from "viem/chains";
import { addRpcUrlOverrideToChain } from "@privy-io/react-auth";

export const arbitrumSepoliaOverride = addRpcUrlOverrideToChain(arbitrumSepolia, import.meta.env.CUSTOM_RPC_PROVIDER_FHENIX);

export const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID;

// TEST FHENIX
export const PIMLICO_BUNDLER_URL_FHENIX = import.meta.env.VITE_PIMLICO_BUNDLER_URL_FHENIX;
export const PIMLICO_PAYMASTER_URL_FHENIX = import.meta.env.VITE_PIMLICO_PAYMASTER_URL_FHENIX;
export const SELECTED_NETWORK_FHENIX = arbitrumSepoliaOverride;
export const COUNTER_FHENIX = import.meta.env.VITE_COUNTER_FHENIX_ADDR;
export const RPC_FHENIX = import.meta.env.CUSTOM_RPC_PROVIDER_FHENIX;