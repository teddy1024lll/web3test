"use client"
import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckAddress } from '../viem/viem';
import { GetTDCBalance, SendTDC as SendTDCFunction } from './wagmi';
import { erc20Abi, formatUnits } from 'viem';
import { useWatchContractEvent } from 'wagmi';


export function CheckTDC_wagmi() {
    const [sender, setSender] = useState('');
    const [toAddress, setToAddress] = useState('');
    const [result, setResult] = useState('结果显示');

    async function handleSendETH() {
        if (!CheckAddress(toAddress)) {
            setResult('无效的地址');
            return;
        }
        let data = await GetTDCBalance(toAddress);
        if (data.success) {
            console.log('TDC Balance:', result);
            setResult(`${toAddress}中${data.result.symbol}代币余额: ${data.result.formatted}`);
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
                        wagmi查询TDC余额
                    </Button>
                </form>

            </div>
            <div className="flex justify-center items-center">
                <h2>{result}</h2>
            </div>
        </div >
    );
}

export function SendTDC_wagmi() {
    const [toAddress, setToAddress] = React.useState('');
    const [amount, setAmount] = React.useState('');
    const [result, setResult] = React.useState('结果显示');
    const [logList, setlogList] = useState<any[]>([]);
    const [isWatching, setIsWatching] = useState(false); // 新增：控制是否监听事件

    // 只有在用户主动启用时才监听事件
    useWatchContractEvent({
        address: '0x85166220421C86B90a630E496840d6C38aa7455B' as `0x${string}`,
        abi: erc20Abi,
        eventName: 'Transfer',
        enabled: isWatching, // 关键：只有启用时才监听
        onLogs(logs) {
            console.log('🔥 收到新的转账事件:', logs);
            const newEvents = logs.map((log: any) => ({
                from: log.args.from,
                to: log.args.to,
                value: log.args.value?.toString(),
                transactionHash: log.transactionHash,
                blockNumber: log.blockNumber?.toString(),
                timestamp: new Date().toLocaleString()
            }));

            setlogList(prev => [...newEvents, ...prev].slice(0, 20)); // 只保留最新20条
        }
    });

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

        // 调用代币转账函数
        SendTDCFunction(toAddress, parseFloat(amount)).then((res: any) => {
            if (res && res.success) {
                setResult(`TDC转账成功! 交易哈希: ${res.hash}`);
            } else {
                setResult(`TDC转账失败: ${res?.error || '未知错误'}`);
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
                    
                    {/* 事件监听控制开关 */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">实时事件监听</span>
                        <Button 
                            type="button" 
                            onClick={() => {
                                setIsWatching(!isWatching);
                                if (!isWatching) {
                                    setlogList([]); // 清空之前的日志
                                    console.log('🔴 开始监听 TDC 转账事件');
                                } else {
                                    console.log('🟢 停止监听 TDC 转账事件');
                                }
                            }}
                            className={isWatching ? "bg-red-500" : "bg-blue-500"}
                        >
                            {isWatching ? "停止监听" : "开始监听"}
                        </Button>
                    </div>
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