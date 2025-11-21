
"use client"
import { GetETHBalance, GetTDCBalance, SendETH } from '../wagmi/wagmi';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatEther, isAddress } from 'viem';
import { CheckAddress } from '../viem/viem';
import React from 'react';


export function CheckETH_wagmi() {
    const [address, setAddress] = useState('');
    const [result, setResult] = useState('查询结果');

    async function ButtonClick() {
        //检查是不是正确的地址
        if (!CheckAddress(address)) return;
        let _result = await GetETHBalance(address);
        _result && setResult(`地址 ${address} 的余额是: ${_result} ETH`);
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">

            {/* 主要内容 */}
            <div className="flex justify-center items-center py-10">
                <form action="" className="w-full max-w-xl flex flex-col gap-6 bg-white p-8 rounded-2xl shadow-xl">
                    <h2 className="text-center text-3xl font-bold text-gray-800 mb-4">
                        wagami查询
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                名称
                            </label>
                            <Input
                                type="text"
                                name="name"
                                placeholder="请输入应用名称"
                                className="w-full"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                结果
                            </label>
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
                                {result}
                            </div>
                        </div>

                        <Button onClick={ButtonClick} type="button" className="w-full mt-6">
                            查询
                        </Button>
                    </div>
                </form>
            </div>
            <div className="flex justify-center items-center">
                <h1>直接复制这个快速查询</h1>
                <h1>---</h1>
                <h1>0x4e3b47e1037e24cc80bb8ef99b709f9f2d5258d6</h1></div>
        </div>
    );
}


 

export function SendETH_wagmi() {
    const [toAddress, setToAddress] = React.useState('');
    const [amount, setAmount] = React.useState('');
    const [result, setResult] = React.useState('结果显示');
    function handleSendETH() {
        if (!CheckAddress(toAddress)) {
            setResult('无效的接收地址');
            return;
        }
        let _sendamount = Number(amount);
        if (isNaN(_sendamount) || _sendamount <= 0) {
            setResult('请输入有效的金额');
            return;
        }
        SendETH(toAddress, _sendamount).then((res) => {
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
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">ETH 转账wagmi</h2>
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