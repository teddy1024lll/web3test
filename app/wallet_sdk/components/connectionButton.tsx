import React, { useState, useEffect } from "react";
import { useWallet } from "../provider/index";
import { Wallet } from "../types";

interface ConnectionButtonProps {
    label: string;
    shouBalance?: boolean;
    size: 'sm' | 'md' | 'lg';
    className?: string;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onchangeChain?: (chainID: number) => void;
    onbalanceChange?: (balance: string) => void;
}
export const ConnectionButton: React.FC<ConnectionButtonProps> = ({
    label = "Connect Wallet",
    shouBalance = false,
    size = 'md',
    className = '',
    onConnect,
    onDisconnect,
    onchangeChain,
    onbalanceChange
}) => {
    const { connect, disconnect, seitchChain, openWalletModal,
        address, isconnected, chainID, provider, balanceETH } = useWallet();
    const siztClass = {
        sm: 'px-3 py-1 text-sm',
        md: 'px-4 py-2 text-md',
        lg: 'px-5 py-3 text-lg'
    };
    const handConnect = async () => {
        // try { connect("injected") } catch (error) {
        //     console.error("Connection failed:", error);
        // }
    }
    const handDisconnect = async () => {
        try {
            disconnect() 
        } catch (error) {
            console.error("Disconnection failed:", error);
        }
    }
    React.useEffect(() => {
    }
    )
    if (!isconnected) {
        return (<button onClick={() => {
            openWalletModal();
        }}>连接钱包</button>)
    }
    return (<div className="h-50 w-150 bg-amber-300 border-2 border-amber-950 rounded-2xl shadow-lg flex-col items-center justify-center">
        <h2>已连接</h2>
        <h2>{address}</h2>
        <h2>{chainID}</h2>
        <h2>余额 {balanceETH}</h2>
        <button onClick={handDisconnect}>断开连接</button>
    </div>)

}