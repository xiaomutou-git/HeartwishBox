/**
 * @fileOverview 后端 API 服务层
 * @description 封装与后端的 HTTP 通信，提供情绪日记记录的 CRUD 接口。
 * 当后端服务不可用时自动降级到 localStorage，确保用户体验不受影响。
 * @created 2026-07-14
 */

import type { DiaryRecord, InsightResult, TaskType } from '../types';
import { getHistory, saveHistory as saveLocalHistory, setHistory } from '../utils/historyStorage';

/**
 * API 基础路径
 * @description 通过 Vite 代理转发到后端服务
 * @type {string}
 */
const BASE_URL = '/api';

/**
 * 后端记录数据结构
 * @interface ApiRecord
 */
interface ApiRecord {
  id: number;
  user_id: number;
  task_type: string;
  task_content: string;
  user_response: string | null;
  companion: string | null;
  insight: string | null;
  poem: string | null;
  warm: string | null;
  created_at: string;
}

/**
 * 创建记录请求体
 * @interface CreateRecordRequest
 */
interface CreateRecordRequest {
  taskType: TaskType;
  taskContent: string;
  userResponse?: string;
  companion?: string;
  insights?: InsightResult;
}

/**
 * API 响应结构
 * @interface ApiResponse<T>
 */
interface ApiResponse<T> {
  status: 'success' | 'error' | 'ok';
  data?: T;
  message?: string;
}

/**
 * 将后端记录转换为前端日记记录格式
 * @description 处理字段名映射（下划线转驼峰）和洞察结果的组装。
 * @param {ApiRecord} record - 后端返回的记录对象
 * @returns {DiaryRecord} 前端日记记录对象
 */
const transformApiRecord = (record: ApiRecord): DiaryRecord => {
  return {
    id: record.id,
    date: record.created_at,
    taskType: record.task_type as TaskType,
    taskContent: record.task_content,
    userResponse: record.user_response || '',
    companion: record.companion || '',
    insights: {
      insight: record.insight || '',
      poem: record.poem || '',
      warm: record.warm || '',
    },
  };
};

/**
 * 获取记录列表
 * @description 优先从后端 API 获取记录，失败时回退到 localStorage。
 * @returns {Promise<DiaryRecord[]>} 日记记录数组
 */
export const fetchRecords = async (): Promise<DiaryRecord[]> => {
  try {
    const response = await fetch(`${BASE_URL}/records`);
    const data: ApiResponse<ApiRecord[]> = await response.json();

    if (data.status === 'success' && Array.isArray(data.data)) {
      const records = data.data.map(transformApiRecord);
      setHistory(records);
      return records;
    }
  } catch (err) {
    console.warn('后端 API 不可用，使用本地存储:', err);
  }

  return getHistory();
};

/**
 * 创建新记录
 * @description 同时向后端 API 和 localStorage 保存记录，确保数据持久化。
 * @param {CreateRecordRequest} payload - 创建记录所需的字段
 * @returns {Promise<DiaryRecord | null>} 创建成功返回记录，失败返回 null
 */
export const createRecord = async (payload: CreateRecordRequest): Promise<DiaryRecord | null> => {
  const localRecord: DiaryRecord = {
    id: Date.now(),
    date: new Date().toISOString(),
    taskType: payload.taskType,
    taskContent: payload.taskContent,
    userResponse: payload.userResponse || '',
    companion: payload.companion || '',
    insights: payload.insights || { insight: '', poem: '', warm: '' },
  };

  saveLocalHistory(localRecord);

  try {
    const response = await fetch(`${BASE_URL}/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data: ApiResponse<unknown> = await response.json();

    if (data.status === 'success') {
      console.log('记录同步到后端成功');
      return localRecord;
    }

    console.warn('后端保存失败，仅保存在本地:', data.message);
  } catch (err) {
    console.warn('后端 API 不可用，仅保存在本地:', err);
  }

  return localRecord;
};

/**
 * 获取单条记录详情
 * @description 根据记录 ID 获取详情，失败时回退到 localStorage。
 * @param {number} id - 记录 ID
 * @returns {Promise<DiaryRecord | null>} 记录详情，未找到返回 null
 */
export const fetchRecordById = async (id: number): Promise<DiaryRecord | null> => {
  try {
    const response = await fetch(`${BASE_URL}/records/${id}`);
    const data: ApiResponse<ApiRecord> = await response.json();

    if (data.status === 'success' && data.data) {
      return transformApiRecord(data.data);
    }
  } catch (err) {
    console.warn('后端 API 不可用，从本地存储查找:', err);
  }

  const history = getHistory();
  return history.find((record) => record.id === id) || null;
};

/**
 * 更新记录
 * @description 更新用户回应和陪伴者信息。
 * @param {number} id - 记录 ID
 * @param {Partial<Pick<DiaryRecord, 'userResponse' | 'companion'>>} updates - 更新字段
 * @returns {Promise<boolean>} 更新成功返回 true，失败返回 false
 */
export const updateRecord = async (
  id: number,
  updates: Partial<Pick<DiaryRecord, 'userResponse' | 'companion'>>
): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/records/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    const data: ApiResponse<unknown> = await response.json();

    if (data.status === 'success') {
      const history = getHistory();
      const index = history.findIndex((record) => record.id === id);
      if (index !== -1) {
        history[index] = { ...history[index], ...updates };
        setHistory(history);
      }
      return true;
    }
  } catch (err) {
    console.warn('后端 API 不可用，仅更新本地存储:', err);
  }

  const history = getHistory();
  const index = history.findIndex((record) => record.id === id);
  if (index !== -1) {
    history[index] = { ...history[index], ...updates };
    setHistory(history);
    return true;
  }

  return false;
};

/**
 * 删除记录
 * @description 删除指定记录。
 * @param {number} id - 记录 ID
 * @returns {Promise<boolean>} 删除成功返回 true，失败返回 false
 */
export const deleteRecord = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/records/${id}`, {
      method: 'DELETE',
    });

    const data: ApiResponse<unknown> = await response.json();

    if (data.status === 'success') {
      const history = getHistory();
      const filtered = history.filter((record) => record.id !== id);
      setHistory(filtered);
      return true;
    }
  } catch (err) {
    console.warn('后端 API 不可用，仅删除本地存储:', err);
  }

  const history = getHistory();
  const filtered = history.filter((record) => record.id !== id);
  setHistory(filtered);
  return true;
};

/**
 * 健康检查
 * @description 检查后端服务是否可用。
 * @returns {Promise<boolean>} 服务正常返回 true，不可用返回 false
 */
export const checkHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data: ApiResponse<unknown> = await response.json();
    return data.status === 'ok';
  } catch (err) {
    return false;
  }
};
