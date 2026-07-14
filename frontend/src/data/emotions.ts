/**
 * @fileOverview 情绪分析数据模块
 * @description 提供情绪关键词、分类、颜色与 Emoji 映射，用于前端情绪统计、图表展示与洞察分析。
 * @created 2026-07-14
 */

import type { EmotionCategory, EmotionColors, EmotionEmojis, EmotionKeywords } from '../types';

/**
 * 情绪关键词库
 * @description 用于从用户回应与 AI 洞察文本中匹配情绪状态。每个分类包含一组代表性中文关键词。
 * @type {EmotionKeywords}
 */
export const emotionKeywords: EmotionKeywords = {
  平静: ['平静', '安宁', '安静', '舒缓', '放松', '轻松', '自在', '从容'],
  温暖: ['温暖', '感恩', '幸福', '满足', '美好', '感动', '被爱', '爱'],
  开心: ['开心', '快乐', '高兴', '兴奋', '喜悦', '愉快', '棒', '美好'],
  迷茫: ['迷茫', '困惑', '纠结', '犹豫', '迷失', '不确定', '彷徨'],
  疲惫: ['疲惫', '累', '疲劳', '困', '没精神', '乏力', '倦怠'],
  焦虑: ['焦虑', '紧张', '担心', '担忧', '害怕', '不安', '压力', '心慌'],
  难过: ['难过', '伤心', '悲伤', '失落', '寂寞', '孤独', '痛苦', '委屈'],
  愤怒: ['生气', '愤怒', '讨厌', '烦', '气', '火', '怒', '恨']
};

/**
 * 情绪分类数组
 * @description 情绪分类的标准顺序，用于图表、统计与遍历。
 * @type {EmotionCategory[]}
 */
export const emotionCategories: EmotionCategory[] = ['平静', '温暖', '开心', '迷茫', '疲惫', '焦虑', '难过', '愤怒'];

/**
 * 情绪颜色映射
 * @description 每种情绪对应一个 HEX 颜色，用于饼图、柱状图、标签等可视化场景。
 * @type {EmotionColors}
 */
export const emotionColors: EmotionColors = {
  平静: '#708090',
  温暖: '#e67e22',
  开心: '#27ae60',
  迷茫: '#9b59b6',
  疲惫: '#95a5a6',
  焦虑: '#e74c3c',
  难过: '#3498db',
  愤怒: '#c0392b'
};

/**
 * 情绪 Emoji 映射
 * @description 每种情绪对应一个 Emoji，用于卡片、统计概览等轻量表达。
 * @type {EmotionEmojis}
 */
export const emotionEmojis: EmotionEmojis = {
  平静: '🧘',
  温暖: '💝',
  开心: '😊',
  迷茫: '🌫️',
  疲惫: '😴',
  焦虑: '😰',
  难过: '😢',
  愤怒: '😤'
};
