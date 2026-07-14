/**
 * @fileOverview 历史记录本地存储工具
 * @description 基于 localStorage 实现情绪日记记录的增删改查，作为后端接口不可用时的本地兜底方案。
 * @created 2026-07-14
 */

import type { DiaryRecord } from '../types';

/**
 * localStorage 中历史记录的存储键名
 * @description 统一使用此键名读写，避免分散管理导致的数据不一致。
 * @type {string}
 */
const HISTORY_STORAGE_KEY = 'xinyu_blind_box_history';

/**
 * 读取所有历史记录
 * @description 从 localStorage 读取记录数组；若解析失败或不存在则返回空数组。
 * @returns {DiaryRecord[]} 历史记录数组，按时间倒序排列
 * @throws {Error} 不会抛出异常，所有解析错误均在函数内部捕获并返回空数组
 */
export const getHistory = (): DiaryRecord[] => {
  try {
    const data: string | null = localStorage.getItem(HISTORY_STORAGE_KEY);

    if (!data) {
      return [];
    }

    const parsed: unknown = JSON.parse(data);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as DiaryRecord[];
  } catch (err) {
    console.error('读取历史记录失败:', err);
    return [];
  }
};

/**
 * 保存单条历史记录
 * @description 将新记录插入到数组头部（最新的在最前面），然后持久化到 localStorage。
 * @param {DiaryRecord} record - 要保存的日记记录
 * @returns {boolean} 保存成功返回 true，失败返回 false
 * @throws {Error} 不会抛出异常，保存失败时返回 false 并打印日志
 */
export const saveHistory = (record: DiaryRecord): boolean => {
  try {
    const history: DiaryRecord[] = getHistory();
    history.unshift(record);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    return true;
  } catch (err) {
    console.error('保存历史记录失败:', err);
    return false;
  }
};

/**
 * 覆盖保存全部历史记录
 * @description 用传入的数组完全替换 localStorage 中的历史记录。
 * @param {DiaryRecord[]} history - 新的历史记录数组
 * @returns {boolean} 保存成功返回 true，失败返回 false
 * @throws {Error} 不会抛出异常，保存失败时返回 false 并打印日志
 */
export const setHistory = (history: DiaryRecord[]): boolean => {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    return true;
  } catch (err) {
    console.error('覆盖历史记录失败:', err);
    return false;
  }
};

/**
 * 删除单条历史记录
 * @description 根据数组索引删除对应记录并持久化。索引越界时不做任何修改。
 * @param {number} index - 要删除的记录在历史数组中的索引
 * @returns {boolean} 删除成功返回 true，失败或索引越界返回 false
 * @throws {Error} 不会抛出异常，删除失败时返回 false 并打印日志
 */
export const deleteHistoryItem = (index: number): boolean => {
  try {
    const history: DiaryRecord[] = getHistory();

    if (index < 0 || index >= history.length) {
      return false;
    }

    history.splice(index, 1);
    return setHistory(history);
  } catch (err) {
    console.error('删除历史记录失败:', err);
    return false;
  }
};

/**
 * 批量删除历史记录
 * @description 根据索引数组批量删除记录；按从大到小排序后删除以避免索引错位。
 * @param {number[]} indices - 要删除的索引数组
 * @returns {boolean} 删除成功返回 true，失败或索引为空返回 false
 * @throws {Error} 不会抛出异常，删除失败时返回 false 并打印日志
 */
export const deleteHistoryItems = (indices: number[]): boolean => {
  try {
    if (!Array.isArray(indices) || indices.length === 0) {
      return false;
    }

    const history: DiaryRecord[] = getHistory();
    const sortedIndices: number[] = [...indices].sort((a: number, b: number) => b - a);

    sortedIndices.forEach((idx: number) => {
      if (idx >= 0 && idx < history.length) {
        history.splice(idx, 1);
      }
    });

    return setHistory(history);
  } catch (err) {
    console.error('批量删除历史记录失败:', err);
    return false;
  }
};

/**
 * 清空所有历史记录
 * @description 删除 localStorage 中保存的全部历史记录。
 * @returns {boolean} 清空成功返回 true，失败返回 false
 * @throws {Error} 不会抛出异常，清空失败时返回 false 并打印日志
 */
export const clearHistory = (): boolean => {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    return true;
  } catch (err) {
    console.error('清空历史记录失败:', err);
    return false;
  }
};
