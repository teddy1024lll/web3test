import { ethers } from 'ethers';
import { CheckAddress } from '../viem/viem';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Sepolia 测试网 RPC URL - 使用支持浏览器 CORS 的端点
const SEPOLIA_RPC_URLS = [
    'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', // Infura 公共端点
    'https://rpc.sepolia.org', // 公共端点，支持 CORS
    'https://ethereum-sepolia-rpc.publicnode.com', // PublicNode - 支持 CORS
    'https://rpc2.sepolia.org', // 备用公共端点
    'https://sepolia.gateway.tenderly.co' // Tenderly 网关
];
export function CheckETH_ethers() {
    const [address, setAddress] = useState('');
    const [result, setResult] = useState('查询结果');

    async function ButtonClick() {
        let _result = await getETHBalance(address);
        if (_result.success) {
            setResult(`地址 ${address} 的余额是: ${_result.result} ETH`);
        } else {
            setResult(_result.result);
        }
    }
    return (

        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
            {/* 主要内容 */}
            <div className="flex justify-center items-center py-10">
                <form action="" className="w-full max-w-xl flex flex-col gap-6 bg-white p-8 rounded-2xl shadow-xl">
                    <h2 className="text-center text-3xl font-bold text-gray-800 mb-4">
                        ethers查询
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
                            ethers查询
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

async function getETHBalance(address: string): Promise<any> {
    if (!CheckAddress(address)) {
        return { success: false, result: ('获取ETH余额失败  地址无效') };
    }

    const corsErrors: string[] = [];
    const otherErrors: string[] = [];

    // 逐个尝试每个RPC端点
    for (let i = 0; i < SEPOLIA_RPC_URLS.length; i++) {
        try {
            console.log(`🔍 尝试 RPC端点 ${i + 1}/${SEPOLIA_RPC_URLS.length}: ${SEPOLIA_RPC_URLS[i]}`);

            // 创建提供者
            const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URLS[i]);

            // 设置超时时间 8秒
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('请求超时')), 8000)
            );

            // 获取余额 (Wei) - 带超时
            const balanceWei = await Promise.race([
                provider.getBalance(address),
                timeout
            ]) as bigint;

            // 转换为 ETH 并返回数字
            const balanceETH = ethers.formatEther(balanceWei);
            console.log(`✅ RPC端点 ${i + 1} 成功! 余额: ${balanceETH} ETH`);
            console.log('🔚 查询完成，停止尝试其他端点');
            return { success: true, result: parseFloat(balanceETH).toString() };

        } catch (error) {
            const errorMessage = (error as Error).message;
            const errorString = error?.toString() || '';

            // 识别 CORS 错误
            if (errorMessage.includes('CORS') || errorMessage.includes('Access-Control-Allow-Origin') ||
                errorString.includes('CORS') || errorString.includes('blocked')) {
                console.error(`🚫 RPC端点 ${i + 1} CORS 错误:`, errorMessage);
                corsErrors.push(`端点${i + 1}: CORS限制`);
            } else {
                console.error(`❌ RPC端点 ${i + 1} 失败:`, errorMessage);
                otherErrors.push(`端点${i + 1}: ${errorMessage}`);
            }

            // 如果是最后一个端点，返回详细错误信息
            if (i === SEPOLIA_RPC_URLS.length - 1) {
                let errorReport = '所有RPC端点都失败了。\n';
                if (corsErrors.length > 0) {
                    errorReport += `🚫 CORS问题: ${corsErrors.join(', ')}\n`;
                }
                if (otherErrors.length > 0) {
                    errorReport += `❌ 其他错误: ${otherErrors.join(', ')}`;
                }
                return { success: false, result: errorReport };
            }

            // 继续尝试下一个端点
            continue;
        }
    }

    return { success: false, result: '未知错误：没有可用的RPC端点' };
}

async function sendETH(toAddress: string, amount: string): Promise<any> {
    if (!CheckAddress(toAddress)) {
        return { success: false, result: '无效的接收地址' };
    }

    if (!amount || parseFloat(amount) <= 0) {
        return { success: false, result: '请输入有效的转账数量' };
    }

    try {
        // 检查是否有连接的钱包
        if (typeof window.ethereum === 'undefined') {
            return { success: false, result: '请安装 MetaMask 钱包' };
        }

        // 创建提供者和签名者
        const provider = new ethers.BrowserProvider(window.ethereum);

        // 请求钱包连接
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();

        // 获取当前账户地址
        const fromAddress = await signer.getAddress();
        console.log(`📤 发送方地址: ${fromAddress}`);
        // 检查余额是否足够
        const balance = await provider.getBalance(fromAddress);
        const balanceETH = parseFloat(ethers.formatEther(balance));
        const sendAmount = parseFloat(amount);

        if (balanceETH < sendAmount) {
            return {
                success: false,
                result: `余额不足！当前余额: ${balanceETH.toFixed(6)} ETH，尝试发送: ${sendAmount} ETH`
            };
        }

        // 准备交易
        const tx = {
            to: toAddress,
            value: ethers.parseEther(amount),
            // gasLimit 和 gasPrice 让钱包自动估算
        }; 
        // 发送交易
        const transaction = await signer.sendTransaction(tx); 

        // 等待确认（可选） 
        const receipt = await transaction.wait();

        if (receipt && receipt.status === 1) {
            console.log('✅ 交易确认成功!', receipt);
            return {
                success: true,
                result: `转账成功！交易哈希: ${transaction.hash}`,
                hash: transaction.hash,
                receipt: receipt
            };
        } else {
            return { success: false, result: '交易失败或被拒绝' };
        }

    } catch (error: any) {
        console.error('💥 sendETH 错误:', error); 
        // 用户拒绝交易
        if (error.code === 4001 || error.message?.includes('User rejected')) {
            return { success: false, result: '用户取消了交易' };
        } 
        // 余额不足
        if (error.message?.includes('insufficient funds')) {
            return { success: false, result: '余额不足，请检查账户余额' };
        }

        // 网络错误
        if (error.message?.includes('network')) {
            return { success: false, result: '网络错误，请检查网络连接' };
        }

        return { success: false, result: `转账失败: ${error.message || '未知错误'}` };
    }
}

export function SendETH_ethers() {
    const [toAddress, setToAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [result, setResult] = useState('转账结果');
    const [loading, setLoading] = useState(false);

    async function handleSendETH() {
        setLoading(true);
        setResult('正在处理转账...');

        const _result = await sendETH(toAddress, amount);

        if (_result.success) {
            setResult(_result.result);
            // 清空输入框
            setToAddress('');
            setAmount('');
        } else {
            setResult(_result.result);
        }

        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
            <div className="flex justify-center items-center py-10">
                <form className="w-full max-w-xl flex flex-col gap-6 bg-white p-8 rounded-2xl shadow-xl">
                    <h2 className="text-center text-3xl font-bold text-gray-800 mb-4">
                        ethers转账ETH
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                接收地址
                            </label>
                            <Input
                                type="text"
                                placeholder="请输入接收方的以太坊地址"
                                className="w-full"
                                value={toAddress}
                                onChange={(e) => setToAddress(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                转账数量 (ETH)
                            </label>
                            <Input
                                type="number"
                                step="0.001"
                                min="0"
                                placeholder="请输入转账数量"
                                className="w-full"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                转账结果
                            </label>
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
                                {result}
                            </div>
                        </div>

                        <Button
                            onClick={handleSendETH}
                            type="button"
                            className="w-full mt-6"
                            disabled={loading}
                        >
                            {loading ? '转账中...' : '发送ETH'}
                        </Button>
                    </div>
                </form>
            </div>
            <div className="flex justify-center items-center">
                <h1>测试接收地址: 0xfe40a649d3df87418852575843f761a25e3ec7a7</h1>
            </div>
        </div>
    );
}