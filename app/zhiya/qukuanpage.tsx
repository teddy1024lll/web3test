"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { use, useState } from "react";
import { useAccount, useBalance } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { useMetaNodeStakeContract } from "./MetaNodeStakeContract";

export function QukuanPage() {
    const [unstakeValue, setUnstakeValue] = useState(0);
    const [message, setMessage] = useState('');
    const [isUnstakeLoading, setIsUnstakeLoading] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [currentTxType, setCurrentTxType] = useState<'unstake' | 'withdraw' | null>(null);

    const queryClient = useQueryClient();
    const {
        unstake,
        withdraw,
        stakedBalance,
        availableToWithdraw,
        pendingWithdraw,
        pendingRewards,
        queryAllStakingFunctions, // 添加这个函数
        writeData, // 交易哈希
        isSuccess, // 交易提交成功
        isError: isWriteError, // 交易提交失败
        writeError, // 交易错误
        isConfirming, // 正在确认
        isConfirmed, // 确认完成
        userInfo,
        withdrawInfo
    } = useMetaNodeStakeContract();

    // 使用 wagmi hooks 获取账户信息
    const { address, isConnected } = useAccount();
    const { data: balance, isError, isLoading } = useBalance({
        address: address,
    });

    function unstakeinput(value: string): void {
        setUnstakeValue(parseFloat(value) || 0);
    }
    //取款函数
    async function withdrawClick() {
        if (parseFloat(pendingWithdraw) <= 0) {
            setMessage('没有可提取的金额');
            return;
        }
        setIsWithdrawing(true);
        setCurrentTxType('withdraw');
        setMessage('正在提交取款交易...');

        try {
            await withdraw();
            setMessage('取款交易已提交，等待确认...');
        } catch (error: any) {
            if (error?.success === false) {
                setMessage(error.error || error.message || '取款操作失败');
            } else {
                setMessage('取款操作失败: ' + (error.message || '未知错误'));
            }
            setIsWithdrawing(false);
        }
    }
    // 解押点击处理函数
    async function unstakeClick() {
        if (unstakeValue <= 0) {
            setMessage('解压金额不对');
            return;
        }
        if (unstakeValue > parseFloat(stakedBalance)) {
            setMessage('你没质押那么多钱');
            return;
        }

        setIsUnstakeLoading(true);
        setCurrentTxType('unstake');
        setMessage('正在提交解押交易...');

        try {
            await unstake(unstakeValue.toString());
            setMessage('解押交易已提交，等待确认...');
        } catch (error: any) {
            console.error('Unstake error:', error);
            if (error?.success === false) {
                setMessage(error.error || error.message || '解押操作失败');
            } else {
                setMessage('解押操作失败: ' + (error.message || '未知错误'));
            }
            setIsUnstakeLoading(false);
        }
    }

    // 监听交易状态变化
    React.useEffect(() => {
        if (isSuccess && writeData) {
            setMessage(`交易已提交! 哈希: ${writeData.slice(0, 10)}...`);
        }

        if (isConfirming) {
            setMessage('⏳ 正在等待区块链确认...');
        }

        if (isConfirmed) {
            if (currentTxType === 'unstake') {
                setMessage('✅ 解押交易确认成功!');
                setIsUnstakeLoading(false);
                setUnstakeValue(0);
            } else if (currentTxType === 'withdraw') {
                setMessage('✅ 取款交易确认成功!');
                setIsWithdrawing(false);
            }

            // 重置交易类型
            setCurrentTxType(null);

            // 强制重新获取合约数据
            queryClient.invalidateQueries({
                queryKey: ['readContract']
            });
        }

        if (isWriteError && writeError) {
            if (currentTxType === 'unstake') {
                setMessage('❌ 解押交易失败: ' + writeError.message);
                setIsUnstakeLoading(false);
            } else if (currentTxType === 'withdraw') {
                setMessage('❌ 取款交易失败: ' + writeError.message);
                setIsWithdrawing(false);
            }
            setCurrentTxType(null);
        }
    }, [isSuccess, isConfirming, isConfirmed, isWriteError, writeData, writeError, currentTxType, queryClient]);



    if (!isConnected) {
        return <div className="w-200 bg-blue-500 border-2 border-blue-950 rounded-2xl flex flex-col gap-2 justify-center items-center p-5">
            <h1>请先连接钱包</h1>
        </div>;
    }
    return <div className="w-200 bg-blue-500 border-2 border-blue-950 rounded-2xl flex flex-col gap-2 justify-center items-center p-5">
        <div className="w-full h-20 flex flex-row justify-between">
            <div className="bg-gray-300 w-1/3 h-15 rounded-2xl flex flex-col justify-center items-center m-2">
                <h1>Staked Amount</h1>
                <h1>{stakedBalance}</h1>
            </div>
            <div className="bg-gray-300 w-1/3 h-15 rounded-2xl flex flex-col justify-center items-center m-2">
                <h1>Available to Withdraw</h1>
                <h1>{availableToWithdraw}</h1>
            </div>
            <div className="bg-gray-300 w-1/3 h-15 rounded-2xl flex flex-col justify-center items-center m-2">
                <h1>Pending Withdraw</h1>
                <h1>{pendingWithdraw}</h1>
            </div>
        </div>
        <h1>Unstake</h1>
        <Input className="w-30"
            type="number"
            min="0"
            step="0.001"
            name="name"
            placeholder="解压金额"
            value={unstakeValue || '0'}
            onChange={(e) => unstakeinput(e.target.value)}  ></Input>
        <Button
            onClick={unstakeClick}
            disabled={isUnstakeLoading || !isConnected || unstakeValue <= 0}
        >
            {isUnstakeLoading ? '处理中...' : 'unstake'}
        </Button>
        <h1>Withdraw</h1>
        <Button onClick={withdrawClick}>{isWithdrawing ? '处理中...' : 'Withdraw'}</Button>
        <div className={`${message.includes('成功') ? 'text-green-600' : 'text-red-600'}`}>
            <h1>{message}</h1>
        </div>
    </div>;
}