'use client'
import { ethers } from 'ethers';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

// TDC 代币合约地址
const TDC_TOKEN_ADDRESS = '0x85166220421C86B90a630E496840d6C38aa7455B';

// Sepolia 测试网 RPC URL - 更新为更稳定的端点
const SEPOLIA_RPC_URLS = [
    'https://rpc.sepolia.org',
    'https://ethereum-sepolia-rpc.publicnode.com', 
    'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    'https://rpc2.sepolia.org',
    'https://sepolia.gateway.tenderly.co',
    'https://eth-sepolia.public.blastapi.io',
];

// ERC20 ABI 包含 Transfer 事件
const ERC20_ABI = [
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function name() view returns (string)"
];

interface TransferEvent {
    from: string;
    to: string;
    amount: string;
    hash: string;
    blockNumber: number;
    timestamp: string;
    type: 'ETH' | 'TDC'; // 新增：区分事件类型
    symbol: string; // 新增：代币符号
}

export function ListenerEthers() {
    const [isListening, setIsListening] = useState(false);
    const [transfers, setTransfers] = useState<TransferEvent[]>([]);
    const [status, setStatus] = useState('未开始监听');
    const [listenETH, setListenETH] = useState(true); // 新增：是否监听ETH
    const [listenTDC, setListenTDC] = useState(true); // 新增：是否监听TDC
    const contractRef = useRef<ethers.Contract | null>(null);
    const providerRef = useRef<ethers.JsonRpcProvider | null>(null);
    const ethListenerRef = useRef<any>(null); // 新增：ETH事件监听器引用

    // 开始监听事件
    async function startListening() {
        try {
            setStatus('🔄 正在尝试连接到区块链...');
            
            if (!listenETH && !listenTDC) {
                setStatus('❌ 请至少选择一种监听类型');
                return;
            }
            
            // 尝试连接到可用的 RPC 端点
            let provider: ethers.JsonRpcProvider | null = null;
            let successfulRpc = '';
            
            setStatus('🔄 正在测试 RPC 连接...');
            
            for (let i = 0; i < SEPOLIA_RPC_URLS.length; i++) {
                const rpcUrl = SEPOLIA_RPC_URLS[i];
                try {
                    setStatus(`🔄 测试端点 ${i + 1}/${SEPOLIA_RPC_URLS.length}: ${rpcUrl.split('/')[2]}...`);
                    console.log(`🔍 尝试连接到: ${rpcUrl}`);
                    
                    const testProvider = new ethers.JsonRpcProvider(rpcUrl);
                    
                    // 设置超时测试连接
                    const timeout = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('连接超时')), 10000)
                    );
                    
                    // 测试连接 - 获取区块号和网络信息
                    const [blockNumber, network] = await Promise.race([
                        Promise.all([
                            testProvider.getBlockNumber(),
                            testProvider.getNetwork()
                        ]),
                        timeout
                    ]) as [number, any];
                    
                    console.log(`✅ 连接成功! 区块号: ${blockNumber}, 网络: ${network.name}, Chain ID: ${network.chainId}`);
                    
                    // 验证是否为 Sepolia 网络
                    if (network.chainId.toString() === '11155111') {
                        provider = testProvider;
                        successfulRpc = rpcUrl;
                        setStatus(`✅ 成功连接到 Sepolia (区块: ${blockNumber})`);
                        break;
                    } else {
                        console.warn(`❌ 网络不匹配: Chain ID ${network.chainId}, 期望: 11155111`);
                        throw new Error(`错误的网络: ${network.chainId}`);
                    }
                    
                } catch (error) {
                    console.warn(`❌ 端点 ${i + 1} 连接失败:`, rpcUrl, error);
                    
                    // 显示具体错误信息
                    const errorMsg = (error as Error).message;
                    if (errorMsg.includes('timeout') || errorMsg.includes('超时')) {
                        console.warn('  原因: 连接超时');
                    } else if (errorMsg.includes('CORS')) {
                        console.warn('  原因: CORS 限制');
                    } else if (errorMsg.includes('network')) {
                        console.warn('  原因: 网络错误');
                    } else {
                        console.warn('  原因:', errorMsg);
                    }
                    
                    continue;
                }
            }

            if (!provider) {
                setStatus('❌ 所有 RPC 端点连接失败，请检查网络连接');
                console.error('🚨 所有 RPC 端点都无法连接');
                return;
            }

            providerRef.current = provider;
            let statusParts = [];

            console.log(`🎯 使用 RPC: ${successfulRpc}`);
            setStatus(`🔄 正在设置事件监听器...`);

            // 监听 TDC 代币转账
            if (listenTDC) {
                try {
                    setStatus(`🔄 正在设置 TDC 代币监听...`);
                    
                    const contract = new ethers.Contract(TDC_TOKEN_ADDRESS, ERC20_ABI, provider);
                    contractRef.current = contract;

                    // 测试合约连接
                    const timeout = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('合约查询超时')), 8000)
                    );

                    // 获取代币信息
                    const [decimals, symbol, name] = await Promise.race([
                        Promise.all([
                            contract.decimals(),
                            contract.symbol(),
                            contract.name()
                        ]),
                        timeout
                    ]) as [number, string, string];

                    console.log(`📊 代币信息 - 名称: ${name}, 符号: ${symbol}, 小数位: ${decimals}`);

                    // TDC Transfer 事件监听器
                    const tdcTransferHandler = (from: string, to: string, value: bigint, event: any) => {
                        console.log('🪙 收到 TDC 转账事件!', {
                            from, to, value: value.toString(), hash: event.transactionHash
                        });

                        const formattedAmount = ethers.formatUnits(value, decimals);
                        const newTransfer: TransferEvent = {
                            from,
                            to,
                            amount: formattedAmount,
                            hash: event.transactionHash,
                            blockNumber: event.blockNumber,
                            timestamp: new Date().toLocaleString(),
                            type: 'TDC',
                            symbol: symbol
                        };

                        setTransfers(prev => [newTransfer, ...prev].slice(0, 50)); // 保留最新50条
                    };

                    contract.on("Transfer", tdcTransferHandler);
                    statusParts.push(`${symbol} 代币`);
                    console.log(`✅ TDC 监听器设置成功`);
                } catch (error) {
                    console.error('❌ TDC 监听设置失败:', error);
                    setStatus(`❌ TDC 监听设置失败: ${(error as Error).message}`);
                    return;
                }
            }

            // 监听 ETH 转账
            if (listenETH) {
                try {
                    setStatus(`🔄 正在设置 ETH 转账监听...`);
                    
                    // ETH 转账监听器（监听新区块中的交易）
                    const ethTransferHandler = async (blockNumber: number) => {
                        try {
                            const block = await provider.getBlock(blockNumber, true);
                            if (block && block.transactions) {
                                for (const txHash of block.transactions) {
                                    try {
                                        // 获取完整的交易信息
                                        const tx = await provider.getTransaction(txHash as string);
                                        
                                        // 只处理 ETH 转账（to 不为空且 value > 0）
                                        if (tx && tx.to && tx.value && BigInt(tx.value.toString()) > BigInt("0")) {
                                            const ethAmount = ethers.formatEther(tx.value);
                                            
                                            // 只显示金额大于 0.001 ETH 的转账（过滤小额交易）
                                            if (parseFloat(ethAmount) >= 0.001) {
                                                console.log('💰 收到 ETH 转账事件!', {
                                                    from: tx.from, to: tx.to, value: ethAmount, hash: tx.hash
                                                });

                                                const newTransfer: TransferEvent = {
                                                    from: tx.from || '',
                                                    to: tx.to,
                                                    amount: ethAmount,
                                                    hash: tx.hash || '',
                                                    blockNumber: blockNumber,
                                                    timestamp: new Date().toLocaleString(),
                                                    type: 'ETH',
                                                    symbol: 'ETH'
                                                };

                                                setTransfers(prev => [newTransfer, ...prev].slice(0, 50));
                                            }
                                        }
                                    } catch (txError) {
                                        // 跳过有问题的交易
                                        continue;
                                    }
                                }
                            }
                        } catch (blockError) {
                            console.warn('处理区块失败:', blockError);
                        }
                    };

                    provider.on("block", ethTransferHandler);
                    ethListenerRef.current = ethTransferHandler;
                    statusParts.push('ETH');
                    console.log(`✅ ETH 监听器设置成功`);
                } catch (error) {
                    console.error('❌ ETH 监听设置失败:', error);
                    setStatus(`❌ ETH 监听设置失败: ${(error as Error).message}`);
                    return;
                }
            }

            setIsListening(true);
            setStatus(`✅ 正在监听 ${statusParts.join(' + ')} 转账事件... (RPC: ${successfulRpc.split('/')[2]})`);

            // 错误处理
            provider.on("error", (error) => {
                console.error('Provider 错误:', error);
                setStatus(`❌ 网络错误: ${error.message}`);
                stopListening();
            });

        } catch (error) {
            console.error('启动监听失败:', error);
            setStatus(`❌ 启动失败: ${(error as Error).message}`);
        }
    }

    // 停止监听
    function stopListening() {
        try {
            // 停止 TDC 监听
            if (contractRef.current) {
                contractRef.current.removeAllListeners("Transfer");
                contractRef.current = null;
            }

            // 停止 ETH 监听
            if (providerRef.current && ethListenerRef.current) {
                providerRef.current.off("block", ethListenerRef.current);
                ethListenerRef.current = null;
            }

            if (providerRef.current) {
                providerRef.current.removeAllListeners();
                providerRef.current = null;
            }

            setIsListening(false);
            setStatus('⏹️ 已停止监听');
            console.log('🔴 停止监听所有转账事件');
        } catch (error) {
            console.error('停止监听失败:', error);
            setStatus(`❌ 停止失败: ${(error as Error).message}`);
        }
    }

    // 清空事件列表
    function clearTransfers() {
        setTransfers([]);
    }

    // 测试 RPC 连接
    async function testConnections() {
        setStatus('🔄 正在测试所有 RPC 连接...');
        const results = [];

        for (let i = 0; i < SEPOLIA_RPC_URLS.length; i++) {
            const rpcUrl = SEPOLIA_RPC_URLS[i];
            const shortUrl = rpcUrl.split('/')[2];
            
            try {
                setStatus(`🔄 测试 ${i + 1}/${SEPOLIA_RPC_URLS.length}: ${shortUrl}...`);
                
                const testProvider = new ethers.JsonRpcProvider(rpcUrl);
                const timeout = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('超时')), 5000)
                );
                
                const start = Date.now();
                const [blockNumber, network] = await Promise.race([
                    Promise.all([
                        testProvider.getBlockNumber(),
                        testProvider.getNetwork()
                    ]),
                    timeout
                ]) as [number, any];
                const duration = Date.now() - start;
                
                const isCorrectNetwork = network.chainId.toString() === '11155111';
                results.push({
                    url: shortUrl,
                    status: isCorrectNetwork ? '✅ 正常' : '❌ 网络错误',
                    latency: `${duration}ms`,
                    block: blockNumber,
                    chainId: network.chainId.toString()
                });
                
                console.log(`${isCorrectNetwork ? '✅' : '❌'} ${shortUrl}: ${duration}ms, Block: ${blockNumber}, Chain: ${network.chainId}`);
                
            } catch (error) {
                const errorMsg = (error as Error).message;
                results.push({
                    url: shortUrl,
                    status: `❌ ${errorMsg}`,
                    latency: '-',
                    block: '-',
                    chainId: '-'
                });
                console.log(`❌ ${shortUrl}: ${errorMsg}`);
            }
        }
        
        // 显示测试结果
        const workingEndpoints = results.filter(r => r.status.includes('✅')).length;
        const resultSummary = results.map(r => `${r.url}: ${r.status} (${r.latency})`).join('\n');
        
        setStatus(`📊 连接测试完成: ${workingEndpoints}/${results.length} 个端点可用\n${resultSummary}`);
        console.log('🏁 连接测试完成:', results);
    }

    // 组件卸载时清理
    useEffect(() => {
        return () => {
            if (isListening) {
                stopListening();
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* 控制面板 */}
                    <div className="bg-white p-6 rounded-2xl shadow-xl mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
                            🎧 ethers.js 事件监听器
                        </h1>

                        {/* 监听类型选择 */}
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-4">
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center space-x-2">
                                    <input 
                                        type="checkbox" 
                                        checked={listenETH} 
                                        onChange={(e) => setListenETH(e.target.checked)}
                                        disabled={isListening}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm font-medium">💰 监听 ETH 转账</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input 
                                        type="checkbox" 
                                        checked={listenTDC} 
                                        onChange={(e) => setListenTDC(e.target.checked)}
                                        disabled={isListening}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm font-medium">🪙 监听 TDC 代币</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                            <Button 
                                onClick={isListening ? stopListening : startListening}
                                className={`px-6 py-3 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                                disabled={status.includes('正在连接') || status.includes('测试')}
                            >
                                {isListening ? '🔴 停止监听' : '🟢 开始监听'}
                            </Button>

                            <Button 
                                onClick={testConnections}
                                variant="outline"
                                className="px-6 py-3 bg-blue-50 hover:bg-blue-100"
                                disabled={isListening || status.includes('测试')}
                            >
                                🔧 测试连接
                            </Button>

                            <Button 
                                onClick={clearTransfers}
                                variant="outline"
                                className="px-6 py-3"
                                disabled={transfers.length === 0}
                            >
                                🗑️ 清空列表
                            </Button>
                        </div>

                        {/* 状态显示 */}
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-center font-medium whitespace-pre-line">{status}</p>
                            <p className="text-center text-sm text-gray-600 mt-2">
                                已监听到 <span className="font-bold text-blue-600">{transfers.length}</span> 个转账事件
                            </p>
                        </div>

                        {/* 合约信息 */}
                        <div className="mt-4 text-sm text-gray-600 text-center space-y-1">
                            <p><strong>网络:</strong> Sepolia 测试网</p>
                            <p><strong>TDC 合约:</strong> {TDC_TOKEN_ADDRESS}</p>
                            <p><strong>ETH 监听:</strong> 监听所有 ETH 转账（≥ 0.001 ETH）</p>
                        </div>
                    </div>

                    {/* 事件列表 */}
                    <div className="bg-white p-6 rounded-2xl shadow-xl">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            📋 转账事件列表
                        </h2>

                        {transfers.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <div className="text-4xl mb-4">👂</div>
                                <p>暂无监听到的转账事件</p>
                                <p className="text-sm mt-2">开始监听后，新的转账事件将显示在这里</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {transfers.map((transfer, index) => (
                                    <div 
                                        key={`${transfer.hash}-${index}`} 
                                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                                                    <span className="text-sm text-gray-500">{transfer.timestamp}</span>
                                                </div>
                                                
                                                <div className="text-sm space-y-1">
                                                    <p className="flex items-center gap-2">
                                                        <span className="font-medium">类型:</span>
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                            transfer.type === 'ETH' 
                                                                ? 'bg-blue-100 text-blue-800' 
                                                                : 'bg-purple-100 text-purple-800'
                                                        }`}>
                                                            {transfer.type === 'ETH' ? '💰 ETH' : '🪙 TDC'}
                                                        </span>
                                                    </p>
                                                    <p>
                                                        <span className="font-medium">发送方:</span> 
                                                        <span className="font-mono text-gray-700 ml-2 break-all">{transfer.from}</span>
                                                    </p>
                                                    <p>
                                                        <span className="font-medium">接收方:</span> 
                                                        <span className="font-mono text-gray-700 ml-2 break-all">{transfer.to}</span>
                                                    </p>
                                                    <p>
                                                        <span className="font-medium">金额:</span> 
                                                        <span className={`font-bold ml-2 ${
                                                            transfer.type === 'ETH' ? 'text-blue-600' : 'text-purple-600'
                                                        }`}>
                                                            {transfer.amount} {transfer.symbol}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right text-sm">
                                                <p className="font-medium text-gray-600">区块 #{transfer.blockNumber}</p>
                                                <a 
                                                    href={`https://sepolia.etherscan.io/tx/${transfer.hash}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:text-blue-700 font-mono break-all"
                                                >
                                                    {transfer.hash.slice(0, 10)}...{transfer.hash.slice(-8)}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}