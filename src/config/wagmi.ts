import { http } from 'wagmi'
import { createConfig } from '@privy-io/wagmi';
import {SELECTED_NETWORK_FHENIX} from './constants';


export const config = createConfig({
  chains: [
    SELECTED_NETWORK_FHENIX
  ],
  transports: {
    [SELECTED_NETWORK_FHENIX.id]: http(),
  },
});