import React, { Children, createContext, useContext, useEffect, useState } from "react";
import { Wallet, WalletContextValue, WalletProviderProps, WalletState } from "../types";
import { WalletModal } from "../components/walletModal";

const WallectContext = createContext<WalletContextValue>(
    {
        connect: async (wallet: Wallet) => { },
        disconnect: async () => { },
        seitchChain: async (chainID: number) => { },
        openWalletModal: () => { },
        closeWalletModal: () => { },
        address: null,
        isloading: false,
        isModalOpen: false,
        chainID: null,
        isConnecting: false,
        isconnected: false,
        ensName: null,
        error: null,
        chains: [],
        provider: null,
        balanceETH: "0",
    }

);
export const WalletProvider: React.FC<WalletProviderProps> = ({
    children, chains, wallets, autoconnect }) => {
    const [state, setState] = useState<WalletState>({
        address: "",
        isloading: false,
        isModalOpen: false,
        chainID: -1,
        isConnecting: false,
        isconnected: false,
        ensName: "",
        error: null,
        chains,
        provider: null,
        balanceETH: "0",
    });

    const [modalOpen, setModalOpen] = useState(false)
    let selectWallet: Wallet | null = null;
    const value: WalletContextValue = {
        ...state,
        connect: async (wallet: Wallet) => {
            setState({ ...state, isConnecting: true });
            let result = await wallet.connector();
            console.log("Connected to wallet:", result);
            setState({
                address: result.address,
                isloading: false,
                isModalOpen: false,
                chainID: result.chainId,
                isConnecting: false,
                isconnected: true,
                ensName: "",
                error: null,
                chains,
                provider: result.provider,
                balanceETH: result.balanceETH,
            });
            selectWallet = wallet;
            setModalOpen(false);
        },
        disconnect: async () => {
            state.provider?.removeAllListeners();
            setState({ ...state, isconnected: false, address: "", chainID: null, provider: null });
        },
        seitchChain: async (chainID: number) => { },
        openWalletModal: () => { setModalOpen(true) },
        closeWalletModal: () => { setModalOpen(false) },
    }
    useEffect(() => {
        if (autoconnect) {
            //自动连接逻辑
        }
    }, [autoconnect]);
    return (
        <WallectContext.Provider value={value}>
            {children}
            <WalletModal isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                wallets={wallets}
                onWalletSelect={(wallet: Wallet) => { value.connect(wallet) }}
                error={new Error("")} />
        </WallectContext.Provider >
    )

}


export const useWallet = (): WalletContextValue => {
    const context = useContext(WallectContext);
    if (!context) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
}

export default WalletProvider;  