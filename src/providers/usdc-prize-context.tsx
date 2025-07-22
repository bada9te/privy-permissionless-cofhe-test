import React, { createContext, useContext, useState } from 'react';


export type PrizeState = {
    modalIsOpened: boolean;
    modalTitle: string;
    raceId: number;
};

// context
const PrizeContext = createContext<{
    prizeState: PrizeState | null;
    setPrizeStateObject: (state: PrizeState) => void;
} | null>(null);

// custom hook to use the GameContext
export const useUSDCPrizeContext = () => {
    const context = useContext(PrizeContext);
    if (!context) {
        throw new Error("useGameContext must be used within a GameProvider");
    }
    return context;
};

// provider
export const RacePrizeProvider = ({ children }: { children: React.ReactNode }) => {
    const [prizeState, setPrizeState] = useState<PrizeState | null>(null);

    const setPrizeStateObject = (state: PrizeState) => {
        setPrizeState(state);
    }

    return (
        <PrizeContext.Provider value={{ prizeState, setPrizeStateObject }}>
            {children}
        </PrizeContext.Provider>
    );
};

