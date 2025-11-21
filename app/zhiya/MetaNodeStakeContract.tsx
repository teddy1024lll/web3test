'use client'

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useConfig } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { StakeAbi } from './MetaNodeStakeABI';

// MetaNodeStake 合约地址 (Sepolia 测试网)
export const META_NODE_STAKE_ADDRESS = '0xF136927bB54709e548fC77F7ee9947b5Ef3136ff' as const;

// ETH池ID（通常是0）- 使用BigInt类型
const ETH_PID = BigInt(0);

// React Hook: MetaNodeStake 合约交互
export const useMetaNodeStakeContract = () => {
  const { address, isConnected } = useAccount();
  const { writeContract, data: writeData, isSuccess, isError, error: writeError } = useWriteContract();
  const config = useConfig();

  // 等待交易确认的hook
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  // 1. 用户质押信息 - user函数返回 stAmount, finishedMetaNode, pendingMetaNode
  const { data: userInfo } = useReadContract({
    address: META_NODE_STAKE_ADDRESS,
    abi: StakeAbi,
    functionName: 'user',
    args: address ? [ETH_PID, address] : undefined,
    query: { enabled: !!address }
  });

  // 2. 用户待领取的奖励
  const { data: pendingRewards } = useReadContract({
    address: META_NODE_STAKE_ADDRESS,
    abi: StakeAbi,
    functionName: 'pendingMetaNode',
    args: address ? [ETH_PID, address] : undefined,
    query: { enabled: !!address }
  });

  // 3. 用户可提取信息
  const { data: withdrawInfo } = useReadContract({
    address: META_NODE_STAKE_ADDRESS,
    abi: StakeAbi,
    functionName: 'withdrawAmount',
    args: address ? [ETH_PID, address] : undefined,
    query: { enabled: !!address }
  });

  // 4. 全局信息
  const { data: metaNodePerBlock } = useReadContract({
    address: META_NODE_STAKE_ADDRESS,
    abi: StakeAbi,
    functionName: 'MetaNodePerBlock',
    query: { enabled: true }
  });

  const { data: endBlock } = useReadContract({
    address: META_NODE_STAKE_ADDRESS,
    abi: StakeAbi,
    functionName: 'endBlock',
    query: { enabled: true }
  });

  // 5. 暂停状态检查
  const { data: claimPaused } = useReadContract({
    address: META_NODE_STAKE_ADDRESS,
    abi: StakeAbi,
    functionName: 'claimPaused',
    query: { enabled: true }
  });

  const { data: withdrawPaused } = useReadContract({
    address: META_NODE_STAKE_ADDRESS,
    abi: StakeAbi,
    functionName: 'withdrawPaused',
    query: { enabled: true }
  });

  // 解析用户信息
  const stakedBalance = userInfo ? formatEther(userInfo[0] as bigint) : '0'; // stAmount
  const finishedRewards = userInfo ? formatEther(userInfo[1] as bigint) : '0'; // finishedMetaNode
  const pendingFromUser = userInfo ? formatEther(userInfo[2] as bigint) : '0'; // pendingMetaNode

  // 解析提取信息
  const availableToWithdraw = withdrawInfo ? formatEther(withdrawInfo[0] as bigint) : '0'; // requestAmount
  const pendingWithdraw = withdrawInfo ? formatEther(withdrawInfo[1] as bigint) : '0'; // pendingWithdrawAmount

  // 测试所有函数的综合查询
  const queryAllStakingFunctions = () => {
    // console.log('用户地址:', address);
    // console.log('合约地址:', META_NODE_STAKE_ADDRESS);
    // console.log('ETH池ID:', ETH_PID.toString());

    // console.log('🧪 测试合约函数调用...');

    setTimeout(() => {
      // console.log('📊 真实ABI查询结果:');
      // console.log('- userInfo (stAmount, finishedMetaNode, pendingMetaNode):', userInfo?.map(v => v.toString()));
      // console.log('- pendingRewards:', pendingRewards?.toString());
      // console.log('- withdrawInfo (requestAmount, pendingWithdrawAmount):', withdrawInfo?.map(v => v.toString()));
      // console.log('- metaNodePerBlock:', metaNodePerBlock?.toString());
      // console.log('- endBlock:', endBlock?.toString());
      // console.log('- claimPaused:', claimPaused);
      // console.log('- withdrawPaused:', withdrawPaused);

      // console.log('\n📈 格式化的数据:');
      // console.log('- 质押余额:', stakedBalance, 'ETH');
      // console.log('- 已完成奖励:', finishedRewards, 'MetaNode');
      // console.log('- 待处理奖励:', pendingFromUser, 'MetaNode');
      // console.log('- 可提取金额:', availableToWithdraw, 'ETH');
      // console.log('- 待处理提取:', pendingWithdraw, 'ETH');

      // 检查非零值
      const hasStaked = userInfo && userInfo[0] > BigInt(0);
      const hasPendingRewards = pendingRewards && pendingRewards > BigInt(0);
      const canWithdraw = withdrawInfo && withdrawInfo[0] > BigInt(0);

      if (hasStaked || hasPendingRewards || canWithdraw) {
        console.log('🎉 发现活跃数据:');
        if (hasStaked) console.log('✅ 用户有质押:', formatEther(userInfo[0]), 'ETH');
        if (hasPendingRewards) console.log('✅ 有待领奖励:', formatEther(pendingRewards), 'MetaNode');
        if (canWithdraw) console.log('✅ 可以提取:', formatEther(withdrawInfo[0]), 'ETH');
      } else {
        console.log('ℹ️ 当前用户无活跃质押或奖励');
      }
    }, 2000);
  };



  // ETH质押函数
  const depositETH = async (amount: string) => {
    if (!isConnected || !address) {
      throw new Error('请先连接钱包');
    }

    const amountInWei = parseEther(amount);

    console.log('🚀 开始ETH质押...');
    console.log('质押金额:', amount, 'ETH');
    console.log('Wei值:', amountInWei.toString());

    try {
      await writeContract({
        address: META_NODE_STAKE_ADDRESS,
        abi: StakeAbi,
        functionName: 'depositETH',
        value: amountInWei, // 发送ETH
      });

      console.log('✅ 质押交易已提交');
    } catch (error) {
      console.error('❌ 质押失败:', error);
      throw error;
    }
  };

  // 代币质押函数（需要先有代币余额）
  const deposit = async (amount: string) => {
    if (!isConnected || !address) {
      throw new Error('请先连接钱包');
    }

    const amountInWei = parseEther(amount);

    try {
      await writeContract({
        address: META_NODE_STAKE_ADDRESS,
        abi: StakeAbi,
        functionName: 'deposit',
        args: [ETH_PID, amountInWei],
      });

      console.log('✅ 代币质押交易已提交');
    } catch (error) {
      console.error('❌ 代币质押失败:', error);
      throw error;
    }
  };


  const unstake = async (amount: string) => {
    if (!isConnected || !address) {
      throw new Error('请先连接钱包');
    }

    // 验证输入金额
    if (!amount || parseFloat(amount) <= 0) {
      throw new Error('请输入有效的解押金额');
    }

    // 检查余额是否足够
    const currentStaked = parseFloat(stakedBalance);
    const unstakeAmount = parseFloat(amount);

    if (unstakeAmount > currentStaked) {
      throw new Error(`解押金额(${amount} ETH)超过当前质押余额(${stakedBalance} ETH)`);
    }

    try {
      const amountInWei = parseEther(amount);

      console.log('🚀 开始解押交易...');
      console.log('解押金额:', amount, 'ETH');
      
      // 使用 writeContract，它会自动更新 writeData
      writeContract({
        address: META_NODE_STAKE_ADDRESS,
        abi: StakeAbi,
        functionName: 'unstake',
        args: [ETH_PID, amountInWei],
      });

      console.log('📤 交易已提交');
      
      // 返回状态信息，实际的交易哈希会在 writeData 中
      return {
        success: true,
        message: `解押 ${amount} ETH 交易已提交，正在等待确认...`,
        isConfirming: isConfirming,
        isConfirmed: isConfirmed
      };

    } catch (error: any) {
      console.error('❌ 解押失败:', error);

      // 解析错误信息
      let errorMessage = '解押操作失败';

      if (error?.message) {
        if (error.message.includes('User rejected')) {
          errorMessage = '用户取消了交易';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = '账户ETH余额不足支付Gas费';
        } else if (error.message.includes('execution reverted')) {
          errorMessage = '合约执行失败，可能是金额不足或合约暂停';
        } else if (error.message.includes('network')) {
          errorMessage = '网络连接失败，请检查网络';
        } else {
          errorMessage = error.message;
        }
      }

      // 返回错误信息
      const errorResult = {
        success: false,
        error: errorMessage,
        originalError: error
      };

      throw errorResult;
    }
  };

  // 提取函数
  const withdraw = async () => {
    if (!isConnected || !address) {
      throw new Error('请先连接钱包');
    }

    try {
      await writeContract({
        address: META_NODE_STAKE_ADDRESS,
        abi: StakeAbi,
        functionName: 'withdraw',
        args: [ETH_PID],
      });

      console.log('✅ 提取交易已提交');
    } catch (error) {
      console.error('❌ 提取失败:', error);
      throw error;
    }
  };

  // 领取奖励函数
  const claimRewards = async () => {
    if (!isConnected || !address) {
      throw new Error('请先连接钱包');
    }

    try {
      await writeContract({
        address: META_NODE_STAKE_ADDRESS,
        abi: StakeAbi,
        functionName: 'claim',
        args: [ETH_PID],
      });

      console.log('✅ 领取奖励交易已提交');
    } catch (error) {
      console.error('❌ 领取奖励失败:', error);
      throw error;
    }
  };

  return {
    // 原始数据
    userInfo,
    pendingRewards,
    withdrawInfo,
    metaNodePerBlock,
    endBlock,
    claimPaused,
    withdrawPaused,

    // 格式化数据
    stakedBalance,
    finishedRewards,
    pendingFromUser,
    availableToWithdraw,
    pendingWithdraw, 
    // 交易状态
    writeData, // 交易哈希
    isSuccess, // 交易提交成功
    isError, // 交易提交失败
    writeError, // 交易错误
    isConfirming, // 正在确认
    isConfirmed, // 确认完成

    // 操作函数 
    queryAllStakingFunctions,
    depositETH,
    deposit,
    unstake,
    withdraw,
    claimRewards,

    // 状态
    isConnected,
    address,
    contractAddress: META_NODE_STAKE_ADDRESS,
  };
};