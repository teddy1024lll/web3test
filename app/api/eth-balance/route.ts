import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'

// 支持浏览器访问的 Sepolia RPC 端点
const SEPOLIA_RPC_URLS = [
    'https://rpc.sepolia.org',
    'https://ethereum-sepolia-rpc.publicnode.com',
    'https://rpc2.sepolia.org',
    'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
];

export async function POST(request: NextRequest) {
    try {
        const { address } = await request.json()
        
        if (!address) {
            return NextResponse.json(
                { success: false, result: '地址不能为空' },
                { status: 400 }
            )
        }

        // 尝试每个 RPC 端点
        for (let i = 0; i < SEPOLIA_RPC_URLS.length; i++) {
            try {
                console.log(`🔍 服务端尝试 RPC端点 ${i + 1}: ${SEPOLIA_RPC_URLS[i]}`)
                
                const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URLS[i])
                const balanceWei = await provider.getBalance(address)
                const balanceETH = ethers.formatEther(balanceWei)
                
                console.log(`✅ 服务端查询成功! 余额: ${balanceETH} ETH`)
                
                return NextResponse.json({
                    success: true,
                    result: parseFloat(balanceETH).toString(),
                    rpcUsed: SEPOLIA_RPC_URLS[i]
                })
                
            } catch (error) {
                console.error(`❌ 服务端 RPC端点 ${i + 1} 失败:`, (error as Error).message)
                continue
            }
        }
        
        return NextResponse.json(
            { success: false, result: '所有 RPC 端点都失败了' },
            { status: 500 }
        )
        
    } catch (error) {
        console.error('API 错误:', error)
        return NextResponse.json(
            { success: false, result: '服务器内部错误' },
            { status: 500 }
        )
    }
}