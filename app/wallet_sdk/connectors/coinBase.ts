import { ethers } from "ethers";
import { disconnect } from "process";
import { ConnectResult, Wallet } from "../types";

function isCoinBaseInstalled(): boolean {
    return typeof window !== 'undefined' && typeof (window as any).coinbaseWalletExtension !== 'undefined';
}

const connectCoinBase = async (): Promise<ConnectResult> => {
    try {
        if (!isCoinBaseInstalled()) {
            alert("请先安装Coinbase Wallet扩展程序");
            throw new Error("No Coinbase Wallet extension found");
        }
        const coinbaseProvider = (window as any).coinbaseWalletExtension;

        const accounts = await coinbaseProvider.send("eth_requestAccounts", []);
        //获取用户钱包地址
        const singer = await coinbaseProvider.getSigner();
        const address = await coinbaseProvider.getAddress();
        const { chainId } = await coinbaseProvider.getNetwork();
        //监听账户变化
        coinbaseProvider.on('accountsChanged', (accounts: string[]) => {
            if (accounts.length === 0) {
                console.log("Please connect to Coinbase Wallet.");
                window.dispatchEvent(new CustomEvent('wallet-disconnected'));
            } else {
                window.dispatchEvent(new CustomEvent('wallet-connected', { detail: { accounts: accounts } }));
            }
        });
        //监听网络变化
        coinbaseProvider.on('chainChanged', (chainId: number) => {
            window.dispatchEvent(new CustomEvent('wallet-chain-changed', { detail: { chainId: chainId } }));
        });
        // chainId 转为 number
        const chainIdNum = typeof chainId === 'bigint' ? Number(chainId) : chainId;
        // 获取余额（单位：ETH，字符串）
        let balanceETH = "0";
        try {
            const balance = await coinbaseProvider.getBalance(address);
            balanceETH = ethers.formatEther(balance);
        } catch (e) {
            console.warn("Failed to fetch balance", e);
        }
        return {
            provider: coinbaseProvider,
            singerAdd: address, // singerAdd 用地址字符串
            chainId: chainIdNum,
            accounts,
            address,
            balanceETH, 
        };
    } catch (error) {
        console.log("Coinbase Wallet connection failed:", error);
        throw error;
    }
}
export const coinBaseWallet: Wallet = {
    id: 'coinbase',
    name: 'CoinBase Wallet',
    icon: 'https://avatars.githubusercontent.com/u/18060234?s=200&v=4',
    connector: connectCoinBase,
    description: 'Connect using Coinbase Wallet browser extension.',
    isinstalled: isCoinBaseInstalled(),
    downloadLink: 'https://www.coinbase.com/wallet/downloads'
};

export default coinBaseWallet;