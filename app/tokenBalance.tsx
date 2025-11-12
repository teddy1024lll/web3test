"use client"
import React from 'react';
import { Input } from '@/components/ui/input';
import {
    formatEther
} from 'viem'
import { Button } from '@/components/ui/button';
import { CheckAddress, transETH, teddyCoinBalance } from './viem/viem';

export default function TokenBalance() {
    const [sender, setSender] = React.useState('');
    const [toAddress, setToAddress] = React.useState('');
    const [result, setResult] = React.useState('结果显示');
    async function handleSendETH() {
        if (!CheckAddress(toAddress)) {
            setResult('无效的地址');
            return;
        }
        let result = await teddyCoinBalance(toAddress);
        if (result) {
            setResult(`${result.symbol}代币余额: ${result.formatted}`);
        } else {
            setResult('查询代币余额失败');
        }
    }
    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
            <div className="flex justify-center items-center py-10">
                <form action="" className="w-full max-w-xl flex flex-col gap-3 bg-white p-8 rounded-2xl shadow-xl">
                    <Input value={toAddress} onChange={(e) => setToAddress(e.target.value)} placeholder="Recipient Address" />
                    <Button type="button" className="bg-blue-500 text-white py-2 px-4 rounded"
                        onClick={handleSendETH}>
                        Send ETH
                    </Button>
                </form>

            </div>
            <div className="flex justify-center items-center">
                <h2>{result}</h2>
            </div>
        </div >
    );
}