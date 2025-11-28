import React from "react";
import { Wallet } from "../types";

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose,
    wallets, onWalletSelect,
    connecting, error }) => {
    if (!isOpen) return (<div></div>);
    return (
        <div className="fixed top-20 right-10 z-[9999] bg-white rounded-2xl shadow-2xl p-6">
            <button className="text-2xl" onClick={onClose}>X</button>
            <h2>Select a Wallet</h2>

            <div className="bg-blue-100 border-4 border-blue-500 w-80 h-100 flex flex-col items-center gap-4 p-4">
                {wallets.map((wallet) => (
                    <button key={wallet.id} className="w-72 h-16 p-3 border rounded flex items-center gap-4 hover:bg-gray-100"
                        onClick={() => onWalletSelect && onWalletSelect(wallet)}>
                        <img className="h-10 w-10" src={wallet.icon} alt={wallet.name} />
                        <span className="flex-1 text-center">{wallet.name}</span>
                    </button>
                ))}

            </div>
        </div>
    )
}

export interface WalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    wallets: Wallet[];
    onWalletSelect?: (wallet: Wallet) => void;
    connecting?: boolean;
    error: Error;

}