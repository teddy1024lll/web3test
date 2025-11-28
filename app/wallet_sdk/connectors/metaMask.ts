import { promises } from "dns";
import { ethers } from "ethers";
import { ConnectResult, Wallet } from "../types";
import exp from "constants";

const connectMetaMask = async (): Promise<ConnectResult> => {
    //
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log("accounts:", accounts);
        if (!accounts || accounts.length === 0) {
            throw new Error("No accounts found in MetaMask");
        }
        const provider = new ethers.BrowserProvider(window.ethereum);
        const { chainId } = await provider.getNetwork();
        const singeter = await provider.getSigner();
        //监听账户变化
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
            console.log("accountsChanged", accounts);
            if (accounts.length === 0) {
                window.dispatchEvent(new CustomEvent('wallet-disconnected'));
            } else {
                window.dispatchEvent(new CustomEvent('wallet-connected', { detail: { accounts: accounts } }));
            }
        });
        //监听网络变化
        window.ethereum.on('chainChanged', (chainId: number) => {
            console.log("chainChanged");
            window.dispatchEvent(new CustomEvent('wallet-chain-changed', { detail: { chainId: chainId } }));
        });
        // 获取主账户地址
        const address = accounts[0] || "";
        // 获取余额（单位：ETH，字符串）
        let balanceETH = "0";
        try {
            const balance = await provider.getBalance(address);
            balanceETH = ethers.formatEther(balance);
        } catch (e) {
            console.warn("Failed to fetch balance", e);
        }
        return {
            provider,
            singerAdd: singeter.address,
            chainId: chainId,
            accounts,
            address,
            balanceETH,
        };
    } catch (error) {
        console.error("MetaMask connection failed:", error);
        throw error;
    }
}

function setState(arg0: any) {
    throw new Error("Function not implemented.");
}

export const metaMaskWallet: Wallet = {
    id: 'metamask',
    name: 'MetaMask',
    icon: 'https://support.metamask.io/img/supportlogo.svg',
    connector: connectMetaMask,
    description: 'Connect using MetaMask browser extension.',
    isinstalled: typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask,
    downloadLink: 'https://metamask.io/download.html'
};

export default metaMaskWallet;