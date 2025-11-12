"use client"

import React, { useState } from 'react';
import CheckBalance from "./chenkBalance"
import SendETH from "./sendETH";
import TokenBalance from "./tokenBalance";
import SendTDC from "./sendTDC";
import { Button } from '@/components/ui/button';

export default function Home() {
  const [activeTab, setActiveTab] = useState('sendTDC');

  const tabs = [
    { id: 'sendTDC', name: 'TDC转账', component: <SendTDC /> },
    { id: 'sendETH', name: 'ETH转账', component: <SendETH /> },
    { id: 'checkBalance', name: '查询余额', component: <CheckBalance /> },
    { id: 'tokenBalance', name: '代币余额', component: <TokenBalance /> }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      {/* 导航栏 */}
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">🚀 DApp钱包</h1>
            </div>
            
            {/* 导航按钮 */}
            <div className="flex space-x-1">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'bg-white text-gray-700 hover:bg-blue-50 border-gray-200'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <main className="container mx-auto px-4 py-8">
        {/* 当前选中的组件 */}
        <div className="transition-opacity duration-300 ease-in-out">
          {activeTab === 'sendTDC' && <SendTDC />}
          {activeTab === 'sendETH' && <SendETH />}
          {activeTab === 'checkBalance' && <CheckBalance />}
          {activeTab === 'tokenBalance' && <TokenBalance />}
        </div>
      </main>

      {/* 底部状态栏 */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4">
      
        </div>
      </footer>
    </div>
  );
}
