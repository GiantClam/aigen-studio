/**
 * 生成URL友好的slug
 * @param text 要转换的文本
 * @returns URL友好的slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // 移除特殊字符，只保留字母、数字、空格和连字符
    .replace(/[^\w\s-]/g, '')
    // 将空格和多个连字符替换为单个连字符
    .replace(/[\s_-]+/g, '-')
    // 移除开头和结尾的连字符
    .replace(/^-+|-+$/g, '')
}

/**
 * 从slug还原为原始文本（用于显示）
 * @param slug URL slug
 * @returns 格式化的文本
 */
export function formatSlugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * 验证slug是否有效
 * @param slug 要验证的slug
 * @returns 是否为有效slug
 */
export function isValidSlug(slug: string): boolean {
  // 只允许字母、数字和连字符
  const slugRegex = /^[a-z0-9-]+$/
  return slugRegex.test(slug) && slug.length > 0 && !slug.startsWith('-') && !slug.endsWith('-')
}
