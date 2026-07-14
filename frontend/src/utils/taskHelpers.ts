/**
 * @fileOverview 任务辅助工具函数
 * @description 提供任务随机抽取、类型筛选、洞察随机选择等纯函数，便于页面组件调用。
 * @created 2026-07-14
 */

import { insightLibrary, taskList } from '../data/tasks';
import type { EmotionTask, InsightResult, TaskType } from '../types';

/**
 * 根据任务类型筛选任务
 * @description 当 type 为 '全部' 或无效时返回全部任务；否则返回匹配类型的任务子集。
 * @param {TaskType | '全部'} type - 任务类型筛选条件
 * @returns {EmotionTask[]} 符合条件的任务数组
 */
export const filterTasksByType = (type: TaskType | '全部'): EmotionTask[] => {
  if (type === '全部') {
    return [...taskList];
  }

  const filtered: EmotionTask[] = taskList.filter((item: EmotionTask) => item.type === type);

  // 若筛选结果为空，兜底返回全部任务
  return filtered.length > 0 ? filtered : [...taskList];
};

/**
 * 随机抽取一条任务
 * @description 根据指定类型筛选任务后，随机返回其中一条。结果包含深拷贝，避免外部修改影响原始数据。
 * @param {TaskType | '全部'} [type='全部'] - 任务类型筛选条件，默认为 '全部'
 * @returns {EmotionTask} 随机抽取到的情绪任务
 */
export const drawRandomTask = (type: TaskType | '全部' = '全部'): EmotionTask => {
  const availableTasks: EmotionTask[] = filterTasksByType(type);
  const randomIndex: number = Math.floor(Math.random() * availableTasks.length);
  const selected: EmotionTask = availableTasks[randomIndex];

  return {
    type: selected.type,
    task: selected.task
  };
};

/**
 * 获取任务类型的中文显示名
 * @description 主要用于 UI 标签、统计图表等场景。
 * @param {TaskType | string} type - 任务类型
 * @returns {string} 类型中文名称；未知类型原样返回
 */
export const getTaskTypeLabel = (type: TaskType | string): string => {
  const labelMap: Record<string, string> = {
    '拍照记录': '拍照记录',
    '文字书写': '文字书写',
    '行动打卡': '行动打卡',
    '全部': '全部'
  };

  return labelMap[type] || String(type);
};

/**
 * 将任务内容按换行符拆分为标题与描述
 * @description 任务字符串中通常用 \n 分隔任务动作与引导问题。该函数将其拆分为两部分，便于 UI 分层展示。
 * @param {string} taskContent - 任务原始字符串
 * @returns {{ title: string; description: string }} 拆分后的标题与描述
 */
export const splitTaskContent = (taskContent: string): { title: string; description: string } => {
  if (!taskContent || typeof taskContent !== 'string') {
    return { title: '', description: '' };
  }

  const parts: string[] = taskContent.split('\n');
  const title: string = parts[0] || '';
  const description: string = parts.slice(1).join('\n') || '';

  return { title, description };
};

/**
 * 随机生成一组洞察内容
 * @description 根据任务类型从洞察库中随机抽取一条洞察、一首诗、一句温暖话语，组成 InsightResult。
 * @param {TaskType} [type='文字书写'] - 任务类型；若类型不存在则使用 '文字书写' 兜底
 * @returns {InsightResult} 包含 insight、poem、warm 的洞察结果
 */
export const generateInsight = (type: TaskType = '文字书写'): InsightResult => {
  const data = insightLibrary[type] || insightLibrary['文字书写'];

  const randomIndex = (arr: string[]): number => Math.floor(Math.random() * arr.length);

  return {
    insight: data.insights[randomIndex(data.insights)] || '',
    poem: data.poems[randomIndex(data.poems)] || '',
    warm: data.warms[randomIndex(data.warms)] || ''
  };
};
