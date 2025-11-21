"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAccount, useBalance } from 'wagmi';
import { useMetaNodeStakeContract } from "./MetaNodeStakeContract";
import Link from "next/link";

export function ZhiyaPage() {
    const [zhiyaAmount, setZhiyaAmount] = useState('');
    // 使用 wagmi hooks 获取账户信息
    const { address, isConnected } = useAccount();
    const { data: balance, isError, isLoading } = useBalance({
        address: address,
    });

    // 使用 MetaNodeStake 合约
    const {
        depositETH, 
        stakedBalance,
        availableToWithdraw,
        pendingWithdraw,
        pendingRewards
    } = useMetaNodeStakeContract();

    function setStakeAmount(value: string): void {
        // 允许输入数字、小数点和空字符串
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setZhiyaAmount(value);
        }
    }

    if (!isConnected) {
        return <div className="w-200 bg-blue-500 border-2 border-blue-950 rounded-2xl flex flex-col gap-2 justify-center items-center p-5">
            <h1>请先连接钱包</h1>
        </div>;
    }
    return <div className="w-200 bg-blue-500 border-2 border-blue-950 rounded-2xl flex flex-col gap-2 justify-center items-center p-5">

        <Input className="w-30"
            type="number"
            step="0.001"
            min="0"
            placeholder="请输入质押金额"
            value={zhiyaAmount}
            onChange={(e) => setStakeAmount(e.target.value)}  ></Input>
        <h1>账户内余额：{isLoading ? "加载中..." : balance?.formatted}</h1>
        <h1>已质押：{stakedBalance} ETH</h1>
        <h1>可提取：{availableToWithdraw} ETH</h1>
        <h1>待处理：{pendingWithdraw} ETH</h1>
        <h1>待奖励：{pendingRewards} ETH</h1>
        <Button onClick={zhiyaClick}>质押</Button>
 

    </div>;

    async function zhiyaClick() {
        try {
            // 验证输入金额
            if (!zhiyaAmount || parseFloat(zhiyaAmount) <= 0) {
                alert('请输入有效的质押金额');
                return;
            }
            // 调用质押函数（传入字符串格式的金额）
            await depositETH(zhiyaAmount);

        } catch (error) {
            console.error('质押失败:', error);
        }
    }

}



