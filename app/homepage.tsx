"use client"
import React, { useState } from 'react';
import CheckBalance from "./chenkBalance"
import SendETH from "./sendETH";
import TokenBalance from "./tokenBalance";
import SendTDC from "./sendTDC";
import { Button } from '@/components/ui/button';
import { CheckETH_wagmi, SendETH_wagmi } from './wagmi/ETH_wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CheckTDC_wagmi, SendTDC_wagmi } from './wagmi/TDC_wagmi';
import { CheckETH_ethers, SendETH_ethers } from './etheres/ETH_ethers';
import { CheckTDC_ethers, SendTDC_ethers } from './etheres/TDC_ethers';
import { ListenerEthers } from './etheres/Listener_ethers';
import { CheckWagmiConfig } from './wagmi/check-config';

export default function HomePage() {
    const [activeTab, setActiveTab] = useState('sendTDC');

    const tabs = [
        { id: 'checkBalance', name: 'ETH余额', component: <CheckBalance /> },
        { id: 'tokenBalance', name: '代币余额', component: <TokenBalance /> },
        { id: 'sendTDC', name: 'TDC转账', component: <SendTDC /> },
        { id: 'sendETH', name: 'ETH转账', component: <SendETH /> },

        { id: 'checkETH_wagmi', name: 'ETH余额_wagmi', component: <CheckETH_wagmi /> },
        { id: 'sendETH_wagmi', name: 'ETH转账_wagmi', component: <SendETH_wagmi /> },
        { id: 'checkBalance_wagmi', name: 'TDC转账_wagmi', component: <SendTDC_wagmi /> },
        { id: 'CheckTDC_wagmi', name: '代币余额_wagmi', component: <CheckTDC_wagmi /> },

        { id: 'checkETH_ethers', name: 'ETH余额_ethers', component: <CheckETH_ethers /> },
        { id: 'sendETH_ethers', name: 'ETH转账_ethers', component: <SendETH_ethers /> },
        { id: 'CheckTDC_ethers', name: 'TDC余额_ethers', component: <CheckTDC_ethers /> },
        { id: 'sendTDC_ethers', name: 'TDC转账_ethers', component: <SendTDC_ethers /> },
        { id: 'listener_ethers', name: '事件监听_ethers', component: <ListenerEthers /> },

        { id: 'wagmi_config', name: 'Wagmi配置', component: <CheckWagmiConfig /> }
    ];

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
            {/* 导航栏 */}
            <div className="flex flex-row px-4 py-4 items-center">
                <h1 className="text-2xl font-bold text-gray-800 w-64 shrink-0">🚀 DApp钱包</h1>
                <div className="flex flex-wrap justify-center gap-2 flex-1">
                    {tabs.map((tab) => (
                        <Button
                            key={tab.id}
                            variant={activeTab === tab.id ? "default" : "outline"}
                            className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${activeTab === tab.id
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'bg-white text-gray-700 hover:bg-blue-50 border-gray-200'
                                }`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.name}
                        </Button>
                    ))}
                </div>
                {/* 钱包连接按钮 */}
                <div className="ml-4">
                    <ConnectButton />
                </div>
            </div>

            {/* 主要内容区域 */}
            <main className="container mx-auto px-4 py-8 pt-0">{/* 增加 pt-32 为导航栏留出更多空间 */}
                {/* 当前选中的组件 */}
                <div className="transition-opacity duration-300 ease-in-out">
                    {activeTab === 'sendTDC' && <SendTDC />}
                    {activeTab === 'sendETH' && <SendETH />}
                    {activeTab === 'checkBalance' && <CheckBalance />}
                    {activeTab === 'tokenBalance' && <TokenBalance />}
                    {activeTab === 'checkETH_wagmi' && <CheckETH_wagmi />}
                    {activeTab === 'sendETH_wagmi' && <SendETH_wagmi />}
                    {activeTab === 'checkBalance_wagmi' && <SendTDC_wagmi />}
                    {activeTab === 'CheckTDC_wagmi' && <CheckTDC_wagmi />}
                    {activeTab === 'checkETH_ethers' && <CheckETH_ethers />}
                    {activeTab === 'sendETH_ethers' && <SendETH_ethers />}
                    {activeTab === 'CheckTDC_ethers' && <CheckTDC_ethers />}
                    {activeTab === 'sendTDC_ethers' && <SendTDC_ethers />}
                    {activeTab === 'listener_ethers' && <ListenerEthers />}
                    {activeTab === 'wagmi_config' && <CheckWagmiConfig />}

                </div>
            </main>
        </div>
    );
}