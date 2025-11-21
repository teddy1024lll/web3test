'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import metaNodeStakeABI from './MetaNodeStakeABI';

const METANODE_STAKE_ADDRESS = '0xF136927bB54709e548fC77F7ee9947b5Ef3136ff' as const;

export function useMetaNodeStake() {
  const { address } = useAccount();
  
  // 读取合约数据 (使用错误处理来优雅处理失败的调用)
  const { data: totalSupply } = useReadContract({
    address: METANODE_STAKE_ADDRESS,
    abi: metaNodeStakeABI,
    functionName: 'totalSupply',
    query: {
      retry: false, // 禁用重试来快速失败
    }
  });
  
  const { data: userBalance } = useReadContract({
    address: METANODE_STAKE_ADDRESS,
    abi: metaNodeStakeABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      retry: false,
    }
  });
  
  const { data: userStake } = useReadContract({
    address: METANODE_STAKE_ADDRESS,
    abi: metaNodeStakeABI,
    functionName: 'stakeOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      retry: false,
    }
  });
  
  const { data: earned } = useReadContract({
    address: METANODE_STAKE_ADDRESS,
    abi: metaNodeStakeABI,
    functionName: 'earned',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      retry: false,
    }
  });
  
  const { data: rewardRate } = useReadContract({
    address: METANODE_STAKE_ADDRESS,
    abi: metaNodeStakeABI,
    functionName: 'rewardRate',
    query: {
      retry: false,
    }
  });
  
  // 写入函数
  const { 
    writeContract: stakeTokens, 
    isPending: isStaking,
    data: stakeHash 
  } = useWriteContract();
  
  const { 
    writeContract: withdrawTokens, 
    isPending: isWithdrawing,
    data: withdrawHash 
  } = useWriteContract();
  
  const { 
    writeContract: stakeETHTokens, 
    isPending: isStakingETH,
    data: stakeETHHash 
  } = useWriteContract();
  
  const { 
    writeContract: claimRewards, 
    isPending: isClaiming,
    data: claimHash 
  } = useWriteContract();
  
  // 等待交易确认
  const { isLoading: isStakeConfirming } = useWaitForTransactionReceipt({
    hash: stakeHash,
  });
  
  const { isLoading: isWithdrawConfirming } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  });
  
  const { isLoading: isStakeETHConfirming } = useWaitForTransactionReceipt({
    hash: stakeETHHash,
  });
  
  const { isLoading: isClaimConfirming } = useWaitForTransactionReceipt({
    hash: claimHash,
  });
  
  // 操作函数
  const handleStake = (amount: string) => {
    if (!amount) return;
    
    stakeTokens({
      address: METANODE_STAKE_ADDRESS,
      abi: metaNodeStakeABI,
      functionName: 'stake',
      args: [parseEther(amount)],
    });
  };
  
  const handleStakeETH = (amount: string) => {
    if (!amount) return;
    
    stakeETHTokens({
      address: METANODE_STAKE_ADDRESS,
      abi: metaNodeStakeABI,
      functionName: 'stakeETH',
      value: parseEther(amount),
    });
  };
  
  const handleWithdraw = (amount: string) => {
    if (!amount) return;
    
    withdrawTokens({
      address: METANODE_STAKE_ADDRESS,
      abi: metaNodeStakeABI,
      functionName: 'withdraw',
      args: [parseEther(amount)],
    });
  };
  
  const handleClaimRewards = () => {
    claimRewards({
      address: METANODE_STAKE_ADDRESS,
      abi: metaNodeStakeABI,
      functionName: 'getReward',
    });
  };
  
  const handleExit = () => {
    withdrawTokens({
      address: METANODE_STAKE_ADDRESS,
      abi: metaNodeStakeABI,
      functionName: 'exit',
    });
  };
  
  return {
    // 合约数据
    contractAddress: METANODE_STAKE_ADDRESS,
    totalSupply: totalSupply ? formatEther(totalSupply) : '0',
    userBalance: userBalance ? formatEther(userBalance) : '0',
    userStake: userStake ? formatEther(userStake) : '0', 
    earned: earned ? formatEther(earned) : '0',
    rewardRate: rewardRate ? formatEther(rewardRate) : '0',
    
    // 状态
    isStaking: isStaking || isStakeConfirming,
    isWithdrawing: isWithdrawing || isWithdrawConfirming,
    isStakingETH: isStakingETH || isStakeETHConfirming,
    isClaiming: isClaiming || isClaimConfirming,
    
    // 操作函数
    stake: handleStake,
    stakeETH: handleStakeETH,
    withdraw: handleWithdraw,
    claimRewards: handleClaimRewards,
    exit: handleExit,
    
    // 原始数据 (用于调试)
    raw: {
      totalSupply,
      userBalance,
      userStake,
      earned,
      rewardRate,
    },
    
    // 交易哈希
    transactions: {
      stakeHash,
      withdrawHash,
      stakeETHHash,
      claimHash,
    }
  };
}

export default useMetaNodeStake;