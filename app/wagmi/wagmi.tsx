import { getBalance, sendTransaction, writeContract, watchContractEvent, getAccount, getConnections } from '@wagmi/core'
import { erc20Abi, parseUnits, formatUnits } from 'viem'
import { config } from '@/providers/rainbow-provider'

/**
 * 检查钱包连接状态
 * @returns { isConnected: boolean, address: string | null, chainId: number | null }
 */
export function getWalletStatus() {
    const account = getAccount(config);
    return {
        isConnected: account.isConnected,
        address: account.address || null,
        chainId: account.chainId || null,
        connector: account.connector?.name || null
    };
}

/**
 * 获取指定地址的 ETH 余额，返回 number 类型
 * @param address 钱包地址
 * @returns Promise<number> 余额（ETH 单位）
 */
export async function GetETHBalance(address: string): Promise<number> {
    try {
        const balance = await getBalance(config, {
            address: address as `0x${string}`,
        })

        // 将 wei 转换为 ETH，并转换为 number
        const balanceInEth = parseFloat(balance.formatted)
        return balanceInEth
    } catch (error) {
        console.log('获取余额失败:', error)
        return 0
    }
}

/**
 * 获取代币余额，返回 number 类型
 * @param address 钱包地址
 * @param tokenAddress 代币合约地址
 * @returns Promise<number> 代币余额
 */
const tokenAddress = '0x85166220421C86B90a630E496840d6C38aa7455B';

export async function GetTDCBalance(address: string): Promise<any> {
    try {
        const result = await getBalance(config, {
            address: address as `0x${string}`,
            token: tokenAddress as `0x${string}`,
        })

        // const balanceInToken = parseFloat(balance.formatted)

        return { success: true, result: result };
    } catch (error) {
        console.error('获取代币余额失败:', error)
        return { success: false, result: null, error: error };
    }
}

export async function SendETH(address: string, amount: number) {
    try {
        // 检查钱包连接状态
        const account = getAccount(config);
        if (!account.isConnected || !account.address) {
            return {
                success: false,
                hash: null,
                error: '请先连接钱包。请点击页面右上角的 "Connect Wallet" 按钮连接您的钱包。'
            };
        }

        const tx = await sendTransaction(config, {
            to: address as `0x${string}`,
            value: BigInt(Math.floor(amount)), // 转换为 wei
        })
        return { success: true, hash: tx, error: null }
    } catch (error) {
        console.error('转账失败:', error)
        let errorMessage = '未知错误';

        if (error instanceof Error) {
            if (error.message.includes('ConnectorNotConnectedError')) {
                errorMessage = '钱包未连接，请先连接钱包再进行转账';
            } else if (error.message.includes('insufficient funds')) {
                errorMessage = '余额不足，请检查账户余额';
            } else if (error.message.includes('User rejected')) {
                errorMessage = '用户取消了交易';
            } else {
                errorMessage = error.message;
            }
        }

        return { success: false, hash: null, error: errorMessage };
    }
}

/**
 * 发送 TDC 代币
 * @param toAddress 接收地址
 * @param amount 转账数量（代币单位）
 * @returns Promise<string | null> 交易哈希或 null
 */
export async function SendTDC(toAddress: string, amount: number) {
    try {
        // 检查钱包连接状态
        const account = getAccount(config);
        if (!account.isConnected || !account.address) {
            return {
                success: false,
                hash: null,
                error: '请先连接钱包。请点击页面右上角的 "Connect Wallet" 按钮连接您的钱包。'
            };
        }

        const tx = await writeContract(config, {
            address: tokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: 'transfer',
            args: [
                toAddress as `0x${string}`,
                parseUnits(amount.toString(), 18) // 转换为最小单位（18位小数）
            ],
        })
        return { success: true, hash: tx, error: null }
    } catch (error) {
        console.error('TDC转账失败:', error)
        let errorMessage = '未知错误';

        if (error instanceof Error) {
            if (error.message.includes('ConnectorNotConnectedError')) {
                errorMessage = '钱包未连接，请先连接钱包再进行转账';
            } else if (error.message.includes('insufficient funds')) {
                errorMessage = 'TDC代币余额不足，请检查账户余额';
            } else if (error.message.includes('User rejected')) {
                errorMessage = '用户取消了交易';
            } else {
                errorMessage = error.message;
            }
        }

        return { success: false, hash: null, error: errorMessage };
    }
}



