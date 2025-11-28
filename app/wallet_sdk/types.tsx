import { promises } from "dns";
// import { Chain } from "wagmi/chains";

export interface WalletContextValue extends WalletState {

    connect: (wallet: Wallet) => Promise<void>;
    disconnect: () => Promise<void>;
    //切换取款连网络
    seitchChain: (chainID: number) => Promise<void>;
    //打开钱包弹窗
    openWalletModal: () => void;
    closeWalletModal: () => void;
};


export interface WalletState {
    address: string | null;
    isloading: boolean;
    isModalOpen: boolean;
    chainID: bigint | number | null;
    isConnecting: boolean;
    isconnected: boolean;
    ensName: string | null;
    error: Error | null;
    chains: Chain[];
    provider: any;
    balanceETH: string; 
}

export type Chain = {
    id: number;
    name: string;
    rpcUrls: string;
    currency: { name: string; symbol: string; decimals: number }
    blockExplorers: { name: string; url: string }[];
}


export type WalletProviderProps = {
    children: React.ReactNode;
    chains: Chain[];
    wallets: Wallet[];
    autoconnect?: boolean;
}
//钱包类型
export interface Wallet {
    id: string;
    name: string;
    icon: string;
    connector: () => Promise<ConnectResult>;//连接器 
    description?: string;//描述 
    isinstalled?: boolean;//是否安装
    downloadLink?: string;//下载链接
}

export interface ConnectResult {
    provider: any;
    singerAdd: string;
    chainId: bigint | number;
    accounts: string[];
    address: string;
    balanceETH: string; 
}
