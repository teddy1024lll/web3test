"use client"
import React from 'react';
import { Input } from '@/components/ui/input';
import {
    createWalletClient,
    custom,
    parseEther,
    isAddress,
    formatEther
} from 'viem'
import { Button } from '@/components/ui/button';
import { CheckAddress, transETH } from './viem/viem';

export default function sendETH() {
    const [sender, setSender] = React.useState('');
    const [toAddress, setToAddress] = React.useState('');
    const [amount, setAmount] = React.useState('');
    const [result, setResult] = React.useState('结果显示');
    function handleSendETH() {
        if (!CheckAddress(toAddress)) {
            setResult('无效的接收地址');
            return;
        }
        transETH(toAddress, amount).then((res) => {
            if (res.success) {
                setResult(`转账成功! 交易哈希: ${res.hash}`);
            } else {
                setResult(`转账失败: ${res.error}`);
            }
        });
    }
    return (
        <div className="w-full">
            <div className="flex justify-center items-center py-6">
                <form action="" className="w-full max-w-2xl flex flex-col gap-4 bg-white p-8 rounded-2xl shadow-xl">
                    <div className="text-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">ETH 转账</h2>
                        <p className="text-sm text-gray-600">发送以太币到指定地址</p>
                    </div>
                    <Input value={toAddress} onChange={(e) => setToAddress(e.target.value)} placeholder="接收地址 (Recipient Address)" />
                    <Input
                        type="number"
                        step="1"
                        min="0"
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value)
                            const ethAmount = formatEther(BigInt(e.target.value));
                            setResult(`Amount in ETH: ${ethAmount}`);
                        }}
                        placeholder="金额 (Amount in Wei)"
                    />
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