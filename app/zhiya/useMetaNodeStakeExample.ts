// 基于测试结果的React Hook示例
import { useReadContract, useWriteContract } from 'wagmi';
import metaNodeStakeABI from './MetaNodeStakeABI';

const METANODE_STAKE_ADDRESS = '0xF136927bB54709e548fC77F7ee9947b5Ef3136ff' as const;

export function useMetaNodeStake() {
  // 读取函数


  // 写入函数
  const { writeContract: stake } = useWriteContract();
  const { writeContract: withdraw } = useWriteContract();
  const { writeContract: getReward } = useWriteContract();

  const handleStake = (amount: string) => {
    stake({
      address: METANODE_STAKE_ADDRESS,
      abi: metaNodeStakeABI,
      functionName: 'stake',
      args: [amount],
    });
  };

  return {
    // 读取数据

    
    // 操作函数
    stake: handleStake,
    withdraw,
    getReward,
  };
}