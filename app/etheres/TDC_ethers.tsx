import { ethers } from 'ethers';
import { CheckAddress } from '../viem/viem';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// TDC 代币合约地址
const TDC_TOKEN_ADDRESS = '0x85166220421C86B90a630E496840d6C38aa7455B';

// Sepolia 测试网 RPC URL
const SEPOLIA_RPC_URLS = [
    'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    'https://rpc.sepolia.org',
    'https://ethereum-sepolia-rpc.publicnode.com',
    'https://rpc2.sepolia.org',
];

// ERC20 标准 ABI - 包含查询和转账函数
const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function name() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)"
];

async function getTDCBalance(address: string): Promise<any> {
    if (!CheckAddress(address)) {
        return { success: false, result: '无效的地址格式' };
    }

    // 尝试每个 RPC 端点
    for (let i = 0; i < SEPOLIA_RPC_URLS.length; i++) {
        try {
            console.log(`🔍 尝试 RPC端点 ${i + 1}/${SEPOLIA_RPC_URLS.length}: ${SEPOLIA_RPC_URLS[i]}`);
            
            // 创建提供者
            const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URLS[i]);
            
            // 创建合约实例
            const tokenContract = new ethers.Contract(TDC_TOKEN_ADDRESS, ERC20_ABI, provider);
            
            // 设置超时时间 8秒
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('请求超时')), 8000)
            );

            // 并行获取代币信息
            const [balance, decimals, symbol, name] = await Promise.race([
                Promise.all([
                    tokenContract.balanceOf(address),
                    tokenContract.decimals(),
                    tokenContract.symbol(),
                    tokenContract.name()
                ]),
                timeout
            ]) as [bigint, number, string, string];

            // 格式化余额
            const formattedBalance = ethers.formatUnits(balance, decimals);
            
            console.log(`✅ RPC端点 ${i + 1} 成功!`);
            console.log(`📊 代币信息 - 名称: ${name}, 符号: ${symbol}, 小数位: ${decimals}`);
            console.log(`💰 余额: ${formattedBalance} ${symbol}`);
            
            return { 
                success: true, 
                result: {
                    balance: formattedBalance,
                    symbol: symbol,
                    name: name,
                    decimals: decimals,
                    rawBalance: balance.toString(),
                    address: address
                }
            };

        } catch (error) {
            console.error(`❌ RPC端点 ${i + 1} 失败:`, (error as Error).message);
            
            // 如果是最后一个端点，返回错误
            if (i === SEPOLIA_RPC_URLS.length - 1) {
                return { 
                    success: false, 
                    result: `所有RPC端点都失败了。最后错误: ${(error as Error).message}` 
                };
            }
            
            // 继续尝试下一个端点
            continue;
        }
    }

    return { success: false, result: '未知错误：没有可用的RPC端点' };
}

export function CheckTDC_ethers() {
    const [address, setAddress] = useState('');
    const [result, setResult] = useState('查询结果');
    const [loading, setLoading] = useState(false);

    async function ButtonClick() {
        if (!CheckAddress(address)) {
            setResult('无效的地址格式');
            return;
        }

        setLoading(true);
        setResult('正在查询代币余额...');

        const _result = await getTDCBalance(address);
        
        if (_result.success) {
            const data = _result.result;
            setResult(
                `地址: ${data.address}\n` +
                `代币名称: ${data.name}\n` +
                `代币符号: ${data.symbol}\n` +
                `余额: ${data.balance} ${data.symbol}\n` +
                `小数位数: ${data.decimals}`
            );
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
                        TDC代币余额查询
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                钱包地址
                            </label>
                            <Input
                                type="text"
                                placeholder="请输入以太坊地址"
                                className="w-full"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                查询结果
                            </label>
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm whitespace-pre-line">
                                {result}
                            </div>
                        </div>

                        <Button 
                            onClick={ButtonClick} 
                            type="button" 
                            className="w-full mt-6"
                            disabled={loading}
                        >
                            {loading ? '查询中...' : '查询TDC余额'}
                        </Button>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-2">
                        <p><strong>合约地址:</strong> {TDC_TOKEN_ADDRESS}</p>
                        <p><strong>快速测试地址:</strong> 0x4e3b47e1037e24cc80bb8ef99b709f9f2d5258d6</p>
                    </div>
                </form>
            </div>
        </div>
    );
}

async function sendTDC(toAddress: string, amount: string): Promise<any> {
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
        console.log(`📥 接收方地址: ${toAddress}`);
        console.log(`💰 转账金额: ${amount} TDC`);

        // 创建代币合约实例（连接签名者）
        const tokenContract = new ethers.Contract(TDC_TOKEN_ADDRESS, ERC20_ABI, signer);

        // 获取代币信息
        const [decimals, symbol, senderBalance] = await Promise.all([
            tokenContract.decimals(),
            tokenContract.symbol(),
            tokenContract.balanceOf(fromAddress)
        ]);

        console.log(`📊 代币信息 - 符号: ${symbol}, 小数位: ${decimals}`);

        // 转换转账金额到最小单位
        const transferAmount = ethers.parseUnits(amount, decimals);
        console.log(`🔢 转换后金额: ${transferAmount.toString()} (最小单位)`);

        // 检查余额是否足够
        const balanceFormatted = parseFloat(ethers.formatUnits(senderBalance, decimals));
        const sendAmountFloat = parseFloat(amount);
        
        if (balanceFormatted < sendAmountFloat) {
            return { 
                success: false, 
                result: `余额不足！当前余额: ${balanceFormatted.toFixed(6)} ${symbol}，尝试发送: ${sendAmountFloat} ${symbol}` 
            };
        }

        console.log(`💰 当前余额: ${balanceFormatted} ${symbol}`);

        // 估算 Gas 费用（可选）
        try {
            const gasEstimate = await tokenContract.transfer.estimateGas(toAddress, transferAmount);
            console.log(`⛽ 估算 Gas: ${gasEstimate.toString()}`);
        } catch (gasError) {
            console.warn('⚠️ Gas 估算失败:', gasError);
        }

        console.log('📋 准备发送 TDC 转账交易...');

        // 执行转账
        const transaction = await tokenContract.transfer(toAddress, transferAmount);
        console.log(`🚀 交易已发送! Hash: ${transaction.hash}`);
        
        // 等待确认
        console.log('⏳ 等待交易确认...');
        const receipt = await transaction.wait();
        
        if (receipt && receipt.status === 1) {
            console.log('✅ TDC 转账确认成功!', receipt);
            return { 
                success: true, 
                result: `TDC 转账成功！\n交易哈希: ${transaction.hash}\n转账金额: ${amount} ${symbol}\n接收地址: ${toAddress}`,
                hash: transaction.hash,
                receipt: receipt
            };
        } else {
            return { success: false, result: 'TDC 转账失败或被拒绝' };
        }

    } catch (error: any) {
        console.error('💥 sendTDC 错误:', error);
        
        // 用户拒绝交易
        if (error.code === 4001 || error.message?.includes('User rejected')) {
            return { success: false, result: '用户取消了 TDC 转账' };
        }
        
        // 余额不足
        if (error.message?.includes('insufficient funds') || error.message?.includes('transfer amount exceeds balance')) {
            return { success: false, result: 'TDC 余额不足，请检查账户余额' };
        }
        
        // 网络错误
        if (error.message?.includes('network')) {
            return { success: false, result: '网络错误，请检查网络连接' };
        }

        // Gas 相关错误
        if (error.message?.includes('gas') || error.message?.includes('Gas')) {
            return { success: false, result: 'Gas 费用不足，请增加 ETH 余额支付 Gas 费' };
        }
        
        return { success: false, result: `TDC 转账失败: ${error.message || '未知错误'}` };
    }
}

export function SendTDC_ethers() {
    const [toAddress, setToAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [result, setResult] = useState('转账结果');
    const [loading, setLoading] = useState(false);

    async function handleSendTDC() {
        setLoading(true);
        setResult('正在处理 TDC 转账...');
        
        const _result = await sendTDC(toAddress, amount);
        
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
                        TDC代币转账
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
                                转账数量 (TDC)
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
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm whitespace-pre-line">
                                {result}
                            </div>
                        </div>

                        <Button 
                            onClick={handleSendTDC} 
                            type="button" 
                            className="w-full mt-6"
                            disabled={loading}
                        >
                            {loading ? 'TDC转账中...' : '发送TDC代币'}
                        </Button>
                    </div>

                    <div className="text-sm text-gray-600 space-y-2">
                        <p><strong>TDC 合约:</strong> {TDC_TOKEN_ADDRESS}</p>
                        <p><strong>测试接收地址:</strong> 0xfe40a649d3df87418852575843f761a25e3ec7a7</p>
                        <p className="text-orange-600">⚠️ 确保您有足够的 ETH 支付 Gas 费用</p>
                    </div>
                </form>
            </div>
        </div>
    );
}
