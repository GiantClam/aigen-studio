// 导出模板系统的主要组件
export { BaseTemplate, TemplateType } from './BaseTemplate'
export type { TemplateConfig, TemplateGenerationOptions, AIGenerationCallbacks } from './BaseTemplate'
export { TextToImageTemplate, TTI_ROLES } from './TextToImageTemplate'
export type { TextToImageTemplateConfig } from './TextToImageTemplate'
export { SingleImageToImageTemplate, SITI_ROLES } from './SingleImageToImageTemplate'
export type { SingleImageToImageTemplateConfig } from './SingleImageToImageTemplate'
export { MultiImageToImageTemplate, MITI_ROLES } from './MultiImageToImageTemplate'
export type { MultiImageToImageTemplateConfig } from './MultiImageToImageTemplate'
export { TemplateManager } from './TemplateManager'
export { TemplateFactory } from './TemplateFactory'
export type { TemplateFactoryConfig, CreateTemplateOptions } from './TemplateFactory'

// 导出模板类型枚举，方便外部使用
export { TemplateType as TemplateTypes } from './BaseTemplate'
