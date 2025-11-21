'use client'
import { usePublicClient } from 'wagmi'

export function CheckWagmiConfig() {
    const publicClient = usePublicClient()
    
    const showConfig = () => {
        console.log('=== Wagmi 配置信息 ===')
        console.log('当前链:', publicClient?.chain)
        console.log('传输配置:', publicClient?.transport)
        console.log('RPC URL:', publicClient?.chain?.rpcUrls)
        
        if (publicClient?.transport) {
            // @ts-ignore
            console.log('实际使用的端点:', publicClient.transport.url || publicClient.transport)
        }
    }
    
    return (
        <div className="p-4">
            <h3 className="text-lg font-bold mb-4">Wagmi 节点配置检查</h3>
            <button 
                onClick={showConfig}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                查看 wagmi 使用的节点
            </button>
            <div className="mt-4 text-sm text-gray-600">
                <p>点击按钮查看控制台，可以看到 wagmi 自动配置的节点信息</p>
            </div>
        </div>
    )
}