# 坐标系统修复说明

## 问题
当前代码在创建 Group 时，子对象使用绝对坐标（left + ...），这导致坐标系统混乱。

## 解决方案
参考 aigen-studio 的实现，使用相对坐标系统：
1. 子对象使用相对坐标（从 0,0 开始，相对于 Group）
2. Group 创建时直接指定 left/top（绝对坐标）
3. 这样坐标系统清晰，不会出现坐标偏移问题

## 修复状态
- ✅ TextToImageTemplate - 已修复
- ⏳ MultiImageToImageTemplate - 需要修复
- ⏳ SingleImageToImageTemplate - 需要修复

## 修复模式
将所有子对象的坐标从 `left + ...` 改为相对坐标，例如：
- `left: left + padding` → `left: padding`
- `top: top + padding` → `top: padding`

然后在创建 Group 时直接指定 `left` 和 `top`。

