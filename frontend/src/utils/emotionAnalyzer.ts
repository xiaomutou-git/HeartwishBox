/**
 * @fileOverview 情绪分析工具函数
 * @description 提供基于关键词匹配的情绪统计、任务类型分布统计、陪伴者偏好统计等功能，全部在本地运行，无需后端依赖。
 * @created 2026-07-14
 */

import { emotionCategories, emotionKeywords } from '../data/emotions';
import type { DiaryRecord, EmotionCategory, InsightResult, TaskType } from '../types';

/**
 * 情绪统计结果
 * @interface EmotionStats
 * @description 以情绪分类为键、出现次数为值的统计对象
 */
export interface EmotionStats {
  [key: string]: number;
}

/**
 * 任务类型分布统计
 * @interface TaskTypeDistribution
 * @description 三类任务各自的出现次数
 */
export interface TaskTypeDistribution {
  '拍照记录': number;
  '文字书写': number;
  '行动打卡': number;
}

/**
 * 陪伴者偏好统计
 * @interface CompanionStats
 * @description 以陪伴者名称为键、出现次数为值的统计对象
 */
export interface CompanionStats {
  [name: string]: number;
}

/**
 * 分析单段文本中的情绪关键词
 * @description 遍历情绪关键词库，统计文本中每个情绪分类的命中次数。
 * @param {string} text - 待分析的文本，可能为用户回应、洞察内容等
 * @returns {EmotionStats} 情绪分类到命中次数的映射；若文本为空则所有分类为 0
 * @example
 * analyzeEmotions('今天感觉很温暖，也有点疲惫')
 * // { 平静: 0, 温暖: 1, 开心: 0, 迷茫: 0, 疲惫: 1, 焦虑: 0, 难过: 0, 愤怒: 0 }
 */
export const analyzeEmotions = (text: string): EmotionStats => {
  const result: EmotionStats = {};

  emotionCategories.forEach((category: EmotionCategory) => {
    result[category] = 0;
  });

  if (!text || typeof text !== 'string') {
    return result;
  }

  emotionCategories.forEach((category: EmotionCategory) => {
    emotionKeywords[category].forEach((keyword: string) => {
      if (text.includes(keyword)) {
        result[category] += 1;
      }
    });
  });

  return result;
};

/**
 * 拼接洞察结果为字符串
 * @description 将 InsightResult 的三个字段拼接成一段文本，便于统一进行情绪分析。
 * @param {InsightResult | undefined} insights - AI 洞察结果对象
 * @returns {string} 拼接后的纯文本字符串
 */
const joinInsights = (insights: InsightResult | undefined): string => {
  if (!insights) {
    return '';
  }
  return `${insights.insight || ''} ${insights.poem || ''} ${insights.warm || ''}`;
};

/**
 * 合并多条记录的情绪分析
 * @description 对历史记录数组中的每条记录分别分析用户回应与洞察内容，并按权重合并统计。用户回应权重为 1，洞察内容权重为 2。
 * @param {DiaryRecord[]} history - 历史日记记录数组
 * @returns {EmotionStats} 合并后的情绪统计结果
 */
export const mergeEmotionAnalysis = (history: DiaryRecord[]): EmotionStats => {
  const merged: EmotionStats = {};

  emotionCategories.forEach((category: EmotionCategory) => {
    merged[category] = 0;
  });

  if (!Array.isArray(history) || history.length === 0) {
    return merged;
  }

  history.forEach((record: DiaryRecord) => {
    const responseEmotions: EmotionStats = analyzeEmotions(record.userResponse || '');
    const insightEmotions: EmotionStats = analyzeEmotions(joinInsights(record.insights));

    emotionCategories.forEach((category: EmotionCategory) => {
      merged[category] += responseEmotions[category] * 1 + insightEmotions[category] * 2;
    });
  });

  return merged;
};

/**
 * 计算任务类型分布
 * @description 统计历史记录中三类任务（拍照记录、文字书写、行动打卡）各自的出现次数。
 * @param {DiaryRecord[]} history - 历史日记记录数组
 * @returns {TaskTypeDistribution} 任务类型分布统计对象
 */
export const calculateTaskTypeDistribution = (history: DiaryRecord[]): TaskTypeDistribution => {
  const distribution: TaskTypeDistribution = {
    '拍照记录': 0,
    '文字书写': 0,
    '行动打卡': 0
  };

  if (!Array.isArray(history) || history.length === 0) {
    return distribution;
  }

  history.forEach((record: DiaryRecord) => {
    const type: TaskType | string = record.taskType || '其他';
    if (type in distribution) {
      distribution[type as keyof TaskTypeDistribution] += 1;
    }
  });

  return distribution;
};

/**
 * 计算陪伴者偏好统计
 * @description 统计历史记录中各陪伴者的使用次数。
 * @param {DiaryRecord[]} history - 历史日记记录数组
 * @returns {CompanionStats} 陪伴者名称到使用次数的映射
 */
export const calculateCompanionStats = (history: DiaryRecord[]): CompanionStats => {
  const stats: CompanionStats = {};

  if (!Array.isArray(history) || history.length === 0) {
    return stats;
  }

  history.forEach((record: DiaryRecord) => {
    const companion: string = record.companion || '未知';
    stats[companion] = (stats[companion] || 0) + 1;
  });

  return stats;
};

/**
 * 获取主导情绪
 * @description 根据情绪统计结果返回出现次数最多的情绪分类；若全部为零则返回 '平静' 作为默认情绪。
 * @param {EmotionStats} stats - 情绪统计结果
 * @returns {EmotionCategory} 主导情绪分类
 */
export const getDominantEmotion = (stats: EmotionStats): EmotionCategory => {
  let dominant: EmotionCategory = '平静';
  let maxCount: number = -1;

  emotionCategories.forEach((category: EmotionCategory) => {
    const count: number = stats[category] || 0;
    if (count > maxCount) {
      maxCount = count;
      dominant = category;
    }
  });

  return dominant;
};
