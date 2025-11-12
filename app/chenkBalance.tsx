"use client"
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState } from "react";
import { getETHBalance, CheckAddress } from "./viem/viem";
import { AwardIcon } from "lucide-react";

export default function checkBalance() {
    const [address, setAddress] = useState('');
    const [result, setResult] = useState('查询结果');

    async function ButtonClick() {
        //检查是不是正确的地址
        if (!CheckAddress(address)) return;
        let _result = await getETHBalance(address);
        _result && setResult(`地址 ${address} 的余额是: ${_result} ETH`);
    }


    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
 
            {/* 主要内容 */}
            <div className="flex justify-center items-center py-10">
                <form action="" className="w-full max-w-xl flex flex-col gap-6 bg-white p-8 rounded-2xl shadow-xl">
                    <h2 className="text-center text-3xl font-bold text-gray-800 mb-4">
                        查询
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
