/**
 * 价格计算工具函数
 */

import { getModelPricing, getModelCreditCost, getModelActualCost, type ModelPricing } from './models'

/**
 * 根据输出尺寸获取 credit 成本
 */
export function getCreditCostForSize(
  model: string,
  width: number,
  height: number
): number {
  // 确定输出尺寸类别
  const maxDimension = Math.max(width, height)
  let outputSize: '1K' | '2K' | '4K' = '2K'
  
  if (maxDimension <= 1024) {
    outputSize = '1K'
  } else if (maxDimension <= 2048) {
    outputSize = '2K'
  } else {
    outputSize = '4K'
  }
  
  return getModelCreditCost(model, outputSize)
}

/**
 * 格式化价格显示
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(price)
}

/**
 * 格式化 credit 价格显示（简化版）
 */
export function formatCreditPrice(price: number): string {
  if (price < 0.01) {
    return `$${price.toFixed(4)}`
  }
  return `$${price.toFixed(2)}`
}

/**
 * 获取模型价格信息摘要
 */
export function getModelPricingSummary(model: string) {
  const pricing = getModelPricing(model)
  if (!pricing) {
    return null
  }

  const actualCost1K = getModelActualCost(model, '1K')
  const actualCost2K = getModelActualCost(model, '2K')
  const actualCost4K = getModelActualCost(model, '4K')
  
  const creditCost1K = getModelCreditCost(model, '1K')
  const creditCost2K = getModelCreditCost(model, '2K')
  const creditCost4K = getModelCreditCost(model, '4K')

  return {
    model: pricing.model,
    name: pricing.name,
    pricing: {
      '1K': {
        actualCost: actualCost1K,
        creditCost: creditCost1K,
        profitMargin: ((creditCost1K - actualCost1K) / creditCost1K * 100).toFixed(1) + '%',
      },
      '2K': {
        actualCost: actualCost2K,
        creditCost: creditCost2K,
        profitMargin: ((creditCost2K - actualCost2K) / creditCost2K * 100).toFixed(1) + '%',
      },
      '4K': {
        actualCost: actualCost4K,
        creditCost: creditCost4K,
        profitMargin: ((creditCost4K - actualCost4K) / creditCost4K * 100).toFixed(1) + '%',
      },
    },
  }
}

/**
 * 计算批量生成的 credit 成本
 */
export function calculateBatchCost(
  model: string,
  count: number,
  outputSize: '1K' | '2K' | '4K' = '2K'
): number {
  const creditCost = getModelCreditCost(model, outputSize)
  return creditCost * count
}

