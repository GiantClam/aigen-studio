/**
 * AI 模型价格配置
 */

export interface ModelPricing {
  model: string
  name: string
  inputCost: {
    perImage: number // 美元
    perToken?: number // 每 token 成本（美元）
    tokensPerImage?: number // 每张图片的 token 数
  }
  outputCost: {
    perMillionTokens: number // 每 100 万 tokens 成本（美元）
    tokensPerImage: {
      '1K': number // 1024x1024
      '2K': number // 2048x2048
      '4K': number // 4096x4096
    }
  }
  creditCost: {
    '1K': number // 1K 输出每 credit 成本（美元）
    '2K': number // 2K 输出每 credit 成本（美元）
    '4K': number // 4K 输出每 credit 成本（美元）
  }
}

/**
 * 计算每张图片的总成本
 */
export function calculateImageCost(
  pricing: ModelPricing,
  outputSize: '1K' | '2K' | '4K' = '2K'
): number {
  const inputCost = pricing.inputCost.perImage
  const outputTokens = pricing.outputCost.tokensPerImage[outputSize]
  const outputCost = (outputTokens / 1_000_000) * pricing.outputCost.perMillionTokens
  
  return inputCost + outputCost
}

/**
 * 所有模型的价格配置
 */
export const MODEL_PRICING: Record<string, ModelPricing> = {
  'gemini-2.5-flash-image-preview': {
    model: 'gemini-2.5-flash-image-preview',
    name: 'Gemini 2.5 Flash Image',
    inputCost: {
      perImage: 0, // 免费或包含在输出中
      perToken: 0.00003, // $30 per 1M tokens
      tokensPerImage: 0,
    },
    outputCost: {
      perMillionTokens: 30, // $30 per 1M tokens
      tokensPerImage: {
        '1K': 1290,
        '2K': 1290,
        '4K': 1290,
      },
    },
    creditCost: {
      '1K': 0.039, // $0.039 per credit (实际成本约 $0.0387)
      '2K': 0.039,
      '4K': 0.039,
    },
  },
  'gemini-3-pro-image-preview': {
    model: 'gemini-3-pro-image-preview',
    name: 'Gemini 3 Pro Image',
    inputCost: {
      perImage: 0.0011, // $0.0011 per image
      perToken: 0.00000196, // $0.0011 / 560 tokens
      tokensPerImage: 560,
    },
    outputCost: {
      perMillionTokens: 120, // $120 per 1M tokens
      tokensPerImage: {
        '1K': 1120, // 1024x1024 to 2048x2048
        '2K': 1120, // 1024x1024 to 2048x2048
        '4K': 2000, // 4096x4096
      },
    },
    creditCost: {
      // 成本计算：
      // 1K/2K: $0.0011 (输入) + ($120/1M * 1120) = $0.0011 + $0.1344 = $0.1355
      // 4K: $0.0011 (输入) + ($120/1M * 2000) = $0.0011 + $0.24 = $0.2411
      // 设置合理的 credit 价格（包含利润空间）：
      '1K': 0.20, // $0.20 per credit (成本 $0.1355，利润率 ~48%)
      '2K': 0.20, // $0.20 per credit (成本 $0.1355，利润率 ~48%)
      '4K': 0.35, // $0.35 per credit (成本 $0.2411，利润率 ~45%)
    },
  },
}

/**
 * 获取模型价格配置
 */
export function getModelPricing(model: string): ModelPricing | null {
  return MODEL_PRICING[model] || null
}

/**
 * 获取模型的 credit 成本
 */
export function getModelCreditCost(
  model: string,
  outputSize: '1K' | '2K' | '4K' = '2K'
): number {
  const pricing = getModelPricing(model)
  if (!pricing) {
    // 默认价格
    return 0.05
  }
  return pricing.creditCost[outputSize]
}

/**
 * 计算实际成本（用于成本分析）
 */
export function getModelActualCost(
  model: string,
  outputSize: '1K' | '2K' | '4K' = '2K'
): number {
  const pricing = getModelPricing(model)
  if (!pricing) {
    return 0
  }
  return calculateImageCost(pricing, outputSize)
}

