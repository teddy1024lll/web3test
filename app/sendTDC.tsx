"use client"
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
    createWalletClient,
    custom,
    parseEther,
    isAddress,
    formatEther,
    erc20Abi,
    formatUnits
} from 'viem'
import { Button } from '@/components/ui/button';
import { CheckAddress, client, transToken } from './viem/viem';
import { watchContractEvent } from 'viem/actions';

export default function sendTDC() {
    const [toAddress, setToAddress] = React.useState('');
    const [amount, setAmount] = React.useState('');
    const [result, setResult] = React.useState('结果显示');
    const [logList, setlogList] = useState<any[]>([]);

    useEffect(() => {
        console.log('🟢 sendTDC组件挂载，开始创建事件监听器');
        const unwatch = watchTDCTransfers();
        console.log('🎧 事件监听器创建完成，unwatch函数:', typeof unwatch);
       
        return () => {
            console.log('🔴 sendTDC组件即将卸载，开始清理事件监听器');
            if (unwatch) {
                console.log('🧹 执行unwatch函数，取消事件监听');
                unwatch();
                console.log('✅ 事件监听器已取消');
            }
        };
    }, []);
    // 监听实时 Transfer 事件
    function watchTDCTransfers() {
        console.log('📡 开始监听合约 Transfer 事件...');
        const unwatch = watchContractEvent(client, {
            address: '0x85166220421C86B90a630E496840d6C38aa7455B',
            abi: erc20Abi,
            eventName: 'Transfer',
            onLogs: (logs) => {
                console.log(logList);
                let list: any[] = [];
                logs.forEach((log) => {
                    let obj = {
                        from: log.args.from,
                        to: log.args.to,
                        value: log.args.value?.toString(),
                        transactionHash: log.transactionHash,
                        blockNumber: log.blockNumber
                    }
                    list.push(obj);
                });
                setlogList((prevList) => [...prevList, ...list]);
            },
        });
        console.log('✅ Transfer事件监听器已创建');
        // 返回取消监听的函数
        return unwatch;
    }
    function handleSendTDC() {
        if (!CheckAddress(toAddress)) {
            setResult('无效的接收地址');
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            setResult('请输入有效的转账数量');
            return;
        }

        setResult('正在处理代币转账...');

        // 调用代币转账函数 (TDC通常有18位小数)
        transToken(toAddress, amount, 18).then((res) => {
            if (res.success) {
                setResult(`TDC转账成功! 交易哈希: ${res.hash}`);
            } else {
                setResult(`TDC转账失败: ${res.error}`);
            }
        });
    }
    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
            <div className="flex justify-center items-center py-10">
                <form action="" className="w-full max-w-xl flex flex-col gap-3 bg-white p-8 rounded-2xl shadow-xl">
                    <h1>直接复制这个--0xfe40a649d3df87418852575843f761a25e3ec7a7</h1>
                    <Input value={toAddress} onChange={(e) => setToAddress(e.target.value)} placeholder="Recipient Address" />
                    <Input
                        type="number"
                        step="0.001"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="TDC Amount"
                    />
                    <Button type="button" className="bg-green-500 text-white py-2 px-4 rounded"
                        onClick={handleSendTDC}>
                        Send TDC
                    </Button>
                </form>

            </div>
            <div className="flex justify-center items-center">
                <h2>{result}</h2>
            </div>
            {logList.map((log, index) => (
                <div key={index} className="p-4 m-2 border border-gray-300 rounded-lg bg-white shadow">
                    <p><strong>Index:</strong> {index}</p>
                    <p><strong>From:</strong> {log.from}</p>
                    <p><strong>To:</strong> {log.to}</p>
                    <p><strong>Value:</strong> {log.value ? formatUnits(BigInt(log.value), 18) : '0'} TDC</p>
                    <p><strong>Transaction Hash:</strong> {log.transactionHash}</p>
                    <p><strong>Block Number:</strong> {log.blockNumber?.toString()}</p>
                </div>
            ))}
        </div>
    );
}