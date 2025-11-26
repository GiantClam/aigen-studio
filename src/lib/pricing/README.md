# 价格配置系统

## 概述

这个模块管理所有 AI 模型的价格配置和 credit 成本计算。

## 模型价格配置

### Gemini 2.5 Flash Image
- **Credit 成本**: $0.039 per image（所有尺寸）
- **实际成本**: 约 $0.0387 per image（1290 tokens × $30/1M）

### Gemini 3 Pro Image
- **Credit 成本**:
  - 1K/2K 输出: **$0.20 per credit**
  - 4K 输出: **$0.35 per credit**
- **实际成本**:
  - 1K/2K: $0.0011 (输入) + $0.1344 (输出) = **$0.1355**
  - 4K: $0.0011 (输入) + $0.24 (输出) = **$0.2411**
- **利润率**:
  - 1K/2K: ~48%
  - 4K: ~45%

## 使用方法

### 获取模型 credit 成本

```typescript
import { getModelCreditCost } from '@/lib/pricing'

// 获取默认尺寸（2K）的 credit 成本
const cost = getModelCreditCost('gemini-3-pro-image-preview')
// 返回: 0.20

// 获取特定尺寸的 credit 成本
const cost4K = getModelCreditCost('gemini-3-pro-image-preview', '4K')
// 返回: 0.35
```

### 根据输出尺寸自动计算

```typescript
import { getCreditCostForSize } from '@/lib/pricing/utils'

// 根据实际输出尺寸计算
const cost = getCreditCostForSize('gemini-3-pro-image-preview', 2048, 2048)
// 返回: 0.20 (2K 尺寸)
```

### 获取价格摘要

```typescript
import { getModelPricingSummary } from '@/lib/pricing/utils'

const summary = getModelPricingSummary('gemini-3-pro-image-preview')
console.log(summary)
// {
//   model: 'gemini-3-pro-image-preview',
//   name: 'Gemini 3 Pro Image',
//   pricing: {
//     '1K': { actualCost: 0.1355, creditCost: 0.20, profitMargin: '32.3%' },
//     '2K': { actualCost: 0.1355, creditCost: 0.20, profitMargin: '32.3%' },
//     '4K': { actualCost: 0.2411, creditCost: 0.35, profitMargin: '31.1%' }
//   }
// }
```

### 计算批量成本

```typescript
import { calculateBatchCost } from '@/lib/pricing/utils'

// 计算生成 10 张 2K 图片的 credit 成本
const totalCost = calculateBatchCost('gemini-3-pro-image-preview', 10, '2K')
// 返回: 2.0 (10 × $0.20)
```

## 价格配置结构

```typescript
interface ModelPricing {
  model: string
  name: string
  inputCost: {
    perImage: number        // 每张图片输入成本（美元）
    perToken?: number        // 每 token 成本
    tokensPerImage?: number  // 每张图片的 token 数
  }
  outputCost: {
    perMillionTokens: number  // 每 100 万 tokens 成本（美元）
    tokensPerImage: {
      '1K': number  // 1024x1024
      '2K': number  // 2048x2048
      '4K': number  // 4096x4096
    }
  }
  creditCost: {
    '1K': number  // 1K 输出每 credit 成本（美元）
    '2K': number  // 2K 输出每 credit 成本（美元）
    '4K': number  // 4K 输出每 credit 成本（美元）
  }
}
```

## 添加新模型

在 `models.ts` 中的 `MODEL_PRICING` 对象中添加新模型配置：

```typescript
'new-model-name': {
  model: 'new-model-name',
  name: 'New Model Name',
  inputCost: {
    perImage: 0.001,
    tokensPerImage: 500,
  },
  outputCost: {
    perMillionTokens: 100,
    tokensPerImage: {
      '1K': 1000,
      '2K': 1000,
      '4K': 2000,
    },
  },
  creditCost: {
    '1K': 0.15,
    '2K': 0.15,
    '4K': 0.30,
  },
}
```

## 注意事项

1. **Credit 成本**应该高于实际成本，以包含利润空间
2. **利润率**建议保持在 30-50% 之间
3. 价格更新时，需要同步更新前端显示
4. 考虑批量折扣和促销活动

