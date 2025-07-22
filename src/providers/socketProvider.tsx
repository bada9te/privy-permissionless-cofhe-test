// SocketProvider.tsx
import React, { useEffect } from 'react';
import {socket} from "@/utils/socketio";


export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    useEffect(() => {
        console.log("[Socket provider] Socket connect...");
        socket.connect();

        return () => {
            console.log("[Socket provider] Socket disconnect...");
            socket.disconnect(); // cleanup on unmount
        };
    }, []);

    return <>{children}</>;
};
