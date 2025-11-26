/**
 * Stripe 支付服务
 * 仅在服务器端使用
 */

import type { StripeConfig, PaymentResult } from '../types'

// 动态导入 Stripe（避免在客户端打包）
let Stripe: any
if (typeof window === 'undefined') {
  Stripe = require('stripe').default
}

export class StripeService {
  private stripe: any
  private publishableKey: string

  constructor(config: StripeConfig) {
    if (typeof window !== 'undefined') {
      throw new Error('StripeService can only be used on the server side')
    }
    
    if (!Stripe) {
      throw new Error('Stripe package is not available. Make sure it is installed.')
    }
    
    this.publishableKey = config.publishableKey
    this.stripe = new Stripe(config.secretKey, {
      apiVersion: '2024-12-18.acacia',
    })
  }

  /**
   * 创建支付会话
   */
  async createCheckoutSession(
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, string>
  ): Promise<PaymentResult> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: 'AI Image Generation Credits',
              },
              unit_amount: amount * 100, // Stripe 使用分为单位
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/payment/cancel`,
        metadata: metadata || {},
      })

      return {
        success: true,
        sessionId: session.id,
      }
    } catch (error) {
      console.error('Stripe checkout error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create checkout session',
      }
    }
  }

  /**
   * 创建支付意图（用于客户端直接支付）
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, string>
  ): Promise<PaymentResult> {
    try {
      const intent = await this.stripe.paymentIntents.create({
        amount: amount * 100,
        currency,
        metadata: metadata || {},
        automatic_payment_methods: {
          enabled: true,
        },
      })

      return {
        success: true,
        clientSecret: intent.client_secret || undefined,
      }
    } catch (error) {
      console.error('Stripe payment intent error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment intent',
      }
    }
  }

  /**
   * 验证 webhook 签名
   */
  verifyWebhookSignature(payload: string | Buffer, signature: string, secret: string): any {
    return this.stripe.webhooks.constructEvent(payload, signature, secret)
  }

  /**
   * 获取发布密钥（用于客户端）
   */
  getPublishableKey(): string {
    return this.publishableKey
  }
}

