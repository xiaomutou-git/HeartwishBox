/**
 * @fileOverview 聊天对话辅助工具函数
 * @description 提供用户输入意图分析与基于当前陪伴者的回复生成功能，完全在本地运行。
 * @created 2026-07-14
 */

import { companionMap } from '../data/companions';
import type { Companion, ReplyCategory } from '../types';

/**
 * 分析用户输入的意图分类
 * @description 基于关键词正则匹配判断用户消息所属的情绪或场景分类，用于选择陪伴者回复库中的对应条目。
 * @param {string} message - 用户输入的聊天消息
 * @returns {ReplyCategory} 匹配到的回复分类；未匹配时返回 '默认'
 * @example
 * analyzeIntent('今天感觉很开心')
 * // '开心'
 */
export const analyzeIntent = (message: string): ReplyCategory => {
  if (!message || typeof message !== 'string') {
    return '默认';
  }

  const msg: string = message.toLowerCase();

  // 问候类
  if (/你好|您好|嗨|hello|hi|在吗|在么|哈喽|早上好|晚上好|下午好|晚安/.test(msg)) {
    return '问候';
  }

  // 开心/喜悦类
  if (/开心|高兴|快乐|兴奋|很好|不错|棒|喜欢|幸福|满足|舒服|温暖|爱|哈哈|笑/.test(msg)) {
    return '开心';
  }

  // 难过/悲伤类
  if (/难过|伤心|悲伤|失落|孤独|寂寞|哭|眼泪|不开心|不高兴|低落|痛苦|心碎|委屈|遗憾/.test(msg)) {
    return '难过';
  }

  // 焦虑/担忧类
  if (/焦虑|紧张|担心|担忧|害怕|恐惧|不安|心慌|慌|压力|怕|忐忑|烦恼|烦躁|乱/.test(msg)) {
    return '焦虑';
  }

  // 愤怒/生气类
  if (/生气|愤怒|讨厌|烦|气|火|怒|恨|无法忍受|受不了|崩溃|无语/.test(msg)) {
    return '愤怒';
  }

  // 迷茫/困惑类
  if (/迷茫|困惑|不知道|不确定|纠结|犹豫|迷失|找不到方向|怎么办|不知道怎么办/.test(msg)) {
    return '迷茫';
  }

  // 疲惫/累类
  if (/累|疲惫|疲劳|困|没精神|没力气|精疲力竭|筋疲力尽|心力交瘁|辛苦/.test(msg)) {
    return '疲惫';
  }

  // 提问"怎么办"类
  if (/怎么办|怎么做|应该|如何|怎么处理|有什么办法|能否|能不能|可以吗|是否/.test(msg)) {
    return '提问怎么办';
  }

  // 提问"为什么"类
  if (/为什么|为何|原因|怎么会|为什么会|凭什么|到底/.test(msg)) {
    return '提问为什么';
  }

  // 自我反思/思考类
  if (/我觉得|我想|我认为|也许|可能|是不是|是否|反思|想想|思考|问问自己/.test(msg)) {
    return '自我反思';
  }

  // 感谢类
  if (/谢谢|感谢|多谢|谢谢你|感谢你|辛苦你|麻烦你/.test(msg)) {
    return '感谢';
  }

  // 任务分享类（提到任务/今天/感受等关键词）
  if (/任务|今天|感受|我写了|我记录了|拍了|照了|觉察|冥想|呼吸/.test(msg)) {
    return '任务分享';
  }

  return '默认';
};

/**
 * 根据意图分类获取陪伴者回复
 * @description 从指定陪伴者的 replies 库中，根据分类随机选择一条回复；若分类不存在则使用 '默认' 分类兜底。
 * @param {Companion} companion - 当前选中的陪伴者对象
 * @param {ReplyCategory} category - 回复分类
 * @returns {string} 随机选中的回复内容
 * @throws {Error} 当 companion 无效或 replies 为空时可能返回空字符串
 */
export const getReplyByCategory = (companion: Companion, category: ReplyCategory): string => {
  if (!companion || !companion.replies) {
    return '';
  }

  const pool: string[] = companion.replies[category] || companion.replies['默认'] || [];

  if (pool.length === 0) {
    return '';
  }

  const randomIndex: number = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
};

/**
 * 生成聊天回复
 * @description 综合意图分析与当前陪伴者配置，返回一条适合用户当前情绪的回复。
 * @param {string} message - 用户输入的聊天消息
 * @param {string} companionName - 当前陪伴者名称
 * @returns {string} 生成的回复内容；若陪伴者不存在则返回空字符串
 */
export const generateChatReply = (message: string, companionName: string): string => {
  const companion: Companion | undefined = companionMap[companionName];

  if (!companion) {
    return '';
  }

  const intent: ReplyCategory = analyzeIntent(message);
  return getReplyByCategory(companion, intent);
};

/**
 * 获取随机开场白
 * @description 从指定陪伴者的 greetings 数组中随机选择一条作为开场白。
 * @param {string} companionName - 陪伴者名称
 * @returns {string} 开场白内容；若陪伴者不存在或 greetings 为空则返回空字符串
 */
export const getRandomGreeting = (companionName: string): string => {
  const companion: Companion | undefined = companionMap[companionName];

  if (!companion || !Array.isArray(companion.greetings) || companion.greetings.length === 0) {
    return '';
  }

  const randomIndex: number = Math.floor(Math.random() * companion.greetings.length);
  return companion.greetings[randomIndex];
};
