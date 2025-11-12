import { createPublicClient, http, formatEther, isAddress, parseEther, createWalletClient, custom, erc20Abi, formatUnits, parseUnits } from 'viem'
import { watchContractEvent } from 'viem/actions'
import { mainnet, sepolia } from 'viem/chains'

const client = createPublicClient({
    chain: sepolia,
    transport: http()
})

// 查询 ETH 余额
async function getETHBalance(address: string) {
    try {
        const balance = await client.getBalance({
            address: address as `0x${string}`
        });

        // 转换为可读格式 (从 wei 转换为 ETH)
        const balanceInEth = formatEther(balance);

        console.log(`ETH 余额: ${balanceInEth} ETH`);
        return balanceInEth;
    } catch (error) {
        // console.error('查询余额失败:', error);
        alert('查询余额失败：' + error);
        return null;
    }
}


function CheckAddress(address: string) {
    console.log('输入的地址:', address);

    // 1. 检查是否为空
    if (!address || address.trim() === '') {
        alert('请输入地址');
        return false;
    }

    // 2. 检查地址长度和格式
    const trimmedAddress = address.trim();

    if (!trimmedAddress.startsWith('0x')) {
        alert('地址必须以 0x 开头');
        return false;
    }

    if (trimmedAddress.length !== 42) {
        alert('地址长度必须是 42 个字符（包括 0x）');
        return false;
    }

    // 3. 检查是否只包含有效的十六进制字符
    const hexPattern = /^0x[a-fA-F0-9]{40}$/;
    if (!hexPattern.test(trimmedAddress)) {
        alert('地址包含无效字符，只能包含 0-9 和 a-f');
        return false;
    }

    // 4. 使用 viem 的 isAddress 进行最终验证
    if (!isAddress(trimmedAddress)) {
        alert('地址格式不正确');
        return false;
    }
    return true;
}

// ETH 转账功能
async function transETH(toAddress: string, amount: string) {
    try {
        // 检查是否有 MetaMask 或其他钱包
        if (!window.ethereum) {
            throw new Error('请安装 MetaMask 钱包');
        }

        // 检查并切换到 Sepolia 网络
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xaa36a7' }], // Sepolia 的十六进制链 ID
            });
        } catch (switchError: any) {
            // 如果网络不存在，添加网络
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0xaa36a7',
                        chainName: 'Sepolia test network',
                        rpcUrls: ['https://rpc.sepolia.org'],
                        nativeCurrency: {
                            name: 'ETH',
                            symbol: 'ETH',
                            decimals: 18
                        },
                        blockExplorerUrls: ['https://sepolia.etherscan.io']
                    }],
                });
            } else {
                throw switchError;
            }
        }

        // 创建钱包客户端
        const walletClient = createWalletClient({
            chain: sepolia,
            transport: custom(window.ethereum)
        });

        // 请求用户授权
        const [account] = await walletClient.requestAddresses();

        if (!account) {
            throw new Error('请连接钱包');
        }

        // 验证目标地址
        if (!isAddress(toAddress)) {
            throw new Error('无效的接收地址');
        }

        // 转换金额为 wei (amount 已经是 wei 单位)
        const amountInWei = BigInt(amount);

        // 发送交易
        const hash = await walletClient.sendTransaction({
            account,
            to: toAddress as `0x${string}`,
            value: amountInWei,
        });

        console.log('交易哈希:', hash);

        // 等待交易确认
        const receipt = await client.waitForTransactionReceipt({ hash });

        console.log('交易确认:', receipt);

        return {
            success: true,
            hash,
            receipt
        };

    } catch (error: any) {
        console.error('转账失败:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
const tokenAddress = '0x85166220421C86B90a630E496840d6C38aa7455B';
async function teddyCoinBalance(userAddress: string) {

    try {
        // 同时获取余额、小数位数、名称和符号
        const [balance, decimals, name, symbol] = await Promise.all([
            client.readContract({
                address: tokenAddress as `0x${string}`,
                abi: erc20Abi,
                functionName: 'balanceOf',
                args: [userAddress as `0x${string}`]
            }),
            client.readContract({
                address: tokenAddress as `0x${string}`,
                abi: erc20Abi,
                functionName: 'decimals',
                args: []
            }),
            client.readContract({
                address: tokenAddress as `0x${string}`,
                abi: erc20Abi,
                functionName: 'name',
                args: []
            }),
            client.readContract({
                address: tokenAddress as `0x${string}`,
                abi: erc20Abi,
                functionName: 'symbol',
                args: []
            })
        ]);

        console.log('Token Balance:', balance);
        console.log('Token Decimals:', decimals);
        console.log('Token Name:', name);
        console.log('Token Symbol:', symbol);

        // 将原始余额转换为正确的代币金额
        const formattedBalance = formatUnits(balance, decimals);

        console.log('代币余额 (格式化):', formattedBalance);

        return {
            raw: balance,           // 原始余额 (BigInt)
            formatted: formattedBalance, // 格式化余额 (字符串)
            decimals: decimals,     // 小数位数
            name: name,            // 代币名称
            symbol: symbol         // 代币符号
        };
    } catch (error) {
        console.error('获取代币余额失败:', error);
        return null;
    }

}

// 代币转账功能
async function transToken(toAddress: string, amount: string, decimals: number = 18) {
    try {
        // 检查是否有 MetaMask 或其他钱包
        if (!window.ethereum) {
            throw new Error('请安装 MetaMask 钱包');
        }

        // 检查并切换到 Sepolia 网络
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xaa36a7' }], // Sepolia 的十六进制链 ID
            });
        } catch (switchError: any) {
            // 如果网络不存在，添加网络
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0xaa36a7',
                        chainName: 'Sepolia test network',
                        rpcUrls: ['https://rpc.sepolia.org'],
                        nativeCurrency: {
                            name: 'ETH',
                            symbol: 'ETH',
                            decimals: 18
                        },
                        blockExplorerUrls: ['https://sepolia.etherscan.io']
                    }],
                });
            } else {
                throw switchError;
            }
        }

        // 创建钱包客户端
        const walletClient = createWalletClient({
            chain: sepolia,
            transport: custom(window.ethereum)
        });

        // 请求用户授权
        const [account] = await walletClient.requestAddresses();

        if (!account) {
            throw new Error('请连接钱包');
        }

        // 验证目标地址
        if (!isAddress(toAddress)) {
            throw new Error('无效的接收地址');
        }

        // 转换金额到正确的单位（根据代币的 decimals）
        const amountInTokenUnits = parseUnits(amount, decimals);

        // 发送代币转账交易
        const hash = await walletClient.writeContract({
            account,
            address: tokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: 'transfer',
            args: [toAddress as `0x${string}`, amountInTokenUnits],
        });
        // 发送交易 eth
        // const hash = await walletClient.sendTransaction({
        //     account,
        //     to: toAddress as `0x${string}`,
        //     value: amountInWei,
        // });
        // console.log('代币转账哈希:', hash);

        // 等待交易确认
        const receipt = await client.waitForTransactionReceipt({ hash });

        // console.log('代币转账确认:', receipt);

        return {
            success: true,
            hash,
            receipt
        };

    } catch (error: any) {
        console.error('代币转账失败:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

export { client, getETHBalance, CheckAddress, transETH, teddyCoinBalance, transToken }

