/**
 * @fileOverview 历史记录页组件
 * @description 展示用户的历史情绪日记记录，提供内心状态分析报告弹窗与记录清空功能。
 * @created 2026-07-14
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { emotionCategories, emotionColors, emotionEmojis } from '../data/emotions';
import type { DiaryRecord, EmotionCategory, TaskType } from '../types';
import {
  calculateCompanionStats,
  calculateTaskTypeDistribution,
  getDominantEmotion,
  mergeEmotionAnalysis
} from '../utils/emotionAnalyzer';
import { fetchRecords, deleteRecord } from '../services/apiService';
import { clearHistory } from '../utils/historyStorage';

/**
 * 历史记录页组件 props
 * @interface HistoryPageProps
 */
interface HistoryPageProps {
  /** 返回探索页回调 */
  onBack: () => void;
  /** 开启新的探索回调 */
  onRestart: () => void;
}

/**
 * 任务类型颜色映射
 * @description 用于任务类型分布展示。
 * @type {Record<TaskType, string>}
 */
const taskTypeColors: Record<TaskType, string> = {
  '拍照记录': '#708090',
  '文字书写': '#9b59b6',
  '行动打卡': '#27ae60'
};

/**
 * 历史记录页组件
 * @description 渲染历史记录列表、分析报告弹窗与操作按钮。
 * @param {HistoryPageProps} props - 组件 props
 * @returns {React.ReactElement} 历史记录页 JSX
 */
const HistoryPage: React.FC<HistoryPageProps> = ({ onBack }) => {
  /** 历史记录数组 */
  const [history, setHistory] = useState<DiaryRecord[]>([]);
  /** 是否显示分析报告弹窗 */
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
  /** 是否正在清除记录 */
  const [isClearing, setIsClearing] = useState<boolean>(false);

  /**
   * 加载历史记录
   * @description 优先从后端 API 获取记录，失败时回退到 localStorage。
   */
  const loadHistory = useCallback(async () => {
    try {
      const data: DiaryRecord[] = await fetchRecords();
      setHistory(data);
    } catch (err) {
      console.error('加载历史记录失败:', err);
      setHistory([]);
    }
  }, []);

  /**
   * 组件挂载时加载历史记录并滚动到页面顶部
   * @description 页面切换后滚动位置可能保留，进入历史页时强制回到顶部，确保用户从最新记录开始浏览。
   */
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('滚动到顶部失败:', err);
    }
    loadHistory();
  }, [loadHistory]);

  /**
   * 打开分析报告弹窗
   */
  const handleOpenAnalysis = useCallback(() => {
    setShowAnalysis(true);
  }, []);

  /**
   * 关闭分析报告弹窗
   */
  const handleCloseAnalysis = useCallback(() => {
    setShowAnalysis(false);
  }, []);

  /**
   * 清空所有历史记录
   * @description 清空 localStorage 和后端中的所有记录并刷新列表。
   */
  const handleClearHistory = useCallback(async () => {
    if (!window.confirm('确定要清空所有记录吗？此操作不可恢复。')) {
      return;
    }

    setIsClearing(true);
    try {
      await Promise.all(history.map((record) => deleteRecord(record.id)));
      clearHistory();
      setHistory([]);
    } catch (err) {
      console.error('清空历史记录失败:', err);
    } finally {
      setIsClearing(false);
    }
  }, [history]);

  /**
   * 分析报告数据
   * @description 基于历史记录计算情绪分布、任务类型分布、陪伴者偏好等。
   */
  const analysis = useMemo(() => {
    const emotionStats = mergeEmotionAnalysis(history);
    const totalEmotionCount: number = Object.values(emotionStats).reduce((sum, count) => sum + count, 0);
    const dominantEmotion: EmotionCategory = getDominantEmotion(emotionStats);
    const taskDistribution = calculateTaskTypeDistribution(history);
    const companionStats = calculateCompanionStats(history);

    return {
      emotionStats,
      totalEmotionCount,
      dominantEmotion,
      taskDistribution,
      companionStats,
      totalRecords: history.length
    };
  }, [history]);

  /**
   * 生成个性化建议
   * @description 根据主导情绪和任务类型分布生成建议文案。
   * @returns {string[]} 建议数组
   */
  const suggestions = useMemo((): string[] => {
    const result: string[] = [];
    const { dominantEmotion, taskDistribution, totalRecords } = analysis;

    if (totalRecords === 0) {
      return result;
    }

    const emoji: string = emotionEmojis[dominantEmotion] || '';
    result.push(`你近期最常出现的情绪是「${dominantEmotion}」${emoji}。每一种情绪都是内心的信使，试着不带评判地接纳它。`);

    const taskEntries = Object.entries(taskDistribution).sort((a, b) => b[1] - a[1]);
    const [topTaskType, topTaskCount] = taskEntries[0];
    if (topTaskCount > 0) {
      result.push(`你偏爱「${topTaskType}」类的任务。这种表达方式很适合你，可以继续用它与自己对话。`);
    }

    if (dominantEmotion === '焦虑' || dominantEmotion === '疲惫') {
      result.push('最近你可能承受了较多压力。记得给自己一些喘息的空间，哪怕是几分钟的深呼吸也很有帮助。');
    } else if (dominantEmotion === '难过' || dominantEmotion === '迷茫') {
      result.push('低落或迷茫时，允许自己慢慢来。记录下此刻的感受，就是走向清晰的第一步。');
    } else if (dominantEmotion === '开心' || dominantEmotion === '温暖') {
      result.push('你正处于比较积极的情绪状态。珍惜这些时刻，它们会成为你内心的力量储备。');
    } else {
      result.push('保持这份平和与觉察，继续用记录的方式陪伴自己成长。');
    }

    result.push('建议每周留出一个固定时刻，回顾这些记录。你会发现内心变化的轨迹。');

    return result;
  }, [analysis]);

  /**
   * 格式化日期显示
   * @description 将日期字符串格式化为中文日期时间。
   * @param {string} dateString - ISO 或本地日期字符串
   * @returns {string} 格式化后的日期字符串
   */
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      console.error('日期格式化失败:', err);
      return dateString;
    }
  };

  return (
    <section className="history-section active" id="historySection">
      <div className="section-header">
        <p className="section-label">My Journal</p>
        <h2 className="section-title">我的心情记录</h2>
      </div>

      <div className="history-summary">
        <p className="history-summary-text">这里记录着每一次你与自己对话的时刻。每一次探索，都值得被珍藏。</p>
      </div>

      <div className="history-list">
        {history.length === 0 ? (
          <div className="history-empty">
            <p>暂无记录。完成一次盲盒探索后，你的记录会出现在这里。</p>
          </div>
        ) : (
          history.map((record) => (
            <div key={record.id} className="history-card">
              <div className="history-header">
                <span className="history-date">{formatDate(record.date)}</span>
                <span className="history-type">{record.taskType}</span>
              </div>
              <div className="history-task">{record.taskContent}</div>
              <div className="history-label">我的回应</div>
              <div className="history-response">{record.userResponse}</div>
              <div className="history-companion">
                <span className="history-companion-dot" />
                <span>陪伴者：{record.companion}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="history-actions">
        <button className="restart-btn" onClick={onBack} type="button">
          返回探索
        </button>
        <button className="history-btn" onClick={handleOpenAnalysis} type="button">
          查看分析报告
        </button>
        <button
          className={`restart-btn history-clear-action ${isClearing ? 'clearing' : ''}`}
          onClick={handleClearHistory}
          type="button"
          disabled={isClearing || history.length === 0}
        >
          清除记录
        </button>
      </div>

      <div className="footer">
        <p className="footer-text">心语盲盒 · 与自己对话的片刻宁静</p>
      </div>

      {showAnalysis && (
        <div className="modal-overlay active" role="dialog" aria-modal="true">
          <div className="modal-box" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <div className="modal-title">你的内心状态分析报告</div>
              <button className="modal-close" onClick={handleCloseAnalysis} type="button" aria-label="关闭">
                ×
              </button>
            </div>
            <div className="modal-list">
              {history.length === 0 ? (
                <div className="analysis-empty">
                  <div className="analysis-empty-icon">🍃</div>
                  <p className="analysis-empty-text">还没有足够的数据</p>
                  <p className="analysis-empty-hint">完成几次探索后，你会看到专属的内心分析报告。</p>
                </div>
              ) : (
                <div className="analysis-report">
                  <div className="analysis-overview">
                    <div className="analysis-stat-card">
                      <div className="stat-number">{analysis.totalRecords}</div>
                      <div className="stat-label">记录总数</div>
                    </div>
                    <div className="analysis-stat-card">
                      <div className="stat-number">{emotionEmojis[analysis.dominantEmotion]}</div>
                      <div className="stat-label">主导情绪 {analysis.dominantEmotion}</div>
                    </div>
                    <div className="analysis-stat-card">
                      <div className="stat-number">
                        {Object.keys(analysis.companionStats).length}
                      </div>
                      <div className="stat-label">陪伴过你的角色</div>
                    </div>
                  </div>

                  <div className="analysis-section">
                    <h3 className="analysis-section-title">情绪分布</h3>
                    <p className="analysis-section-hint">基于你的回应与 AI 洞察内容综合统计</p>
                    <div className="emotion-bars">
                      {emotionCategories.map((category) => {
                        const count: number = analysis.emotionStats[category] || 0;
                        const percentage: number = analysis.totalEmotionCount > 0
                          ? Math.round((count / analysis.totalEmotionCount) * 100)
                          : 0;
                        return (
                          <div key={category} className="emotion-bar-item">
                            <div className="emotion-bar-header">
                              <span className="emotion-bar-label">
                                {emotionEmojis[category]} {category}
                              </span>
                              <span className="emotion-bar-percentage">{percentage}%</span>
                            </div>
                            <div className="emotion-bar-track">
                              <div
                                className="emotion-bar-fill"
                                style={{
                                  width: `${percentage}%`,
                                  background: emotionColors[category]
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="analysis-section">
                    <h3 className="analysis-section-title">任务类型分布</h3>
                    <div className="task-types">
                      {Object.entries(analysis.taskDistribution).map(([type, count]) => (
                        <div key={type} className="task-type-item">
                          <span
                            className="task-type-indicator"
                            style={{ background: taskTypeColors[type as TaskType] }}
                          />
                          <span className="task-type-name">{type}</span>
                          <span className="task-type-count">{count} 次</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="analysis-section">
                    <h3 className="analysis-section-title">陪伴者偏好</h3>
                    <div className="companion-preference">
                      {Object.entries(analysis.companionStats).map(([name, count]) => (
                        <div key={name} className="companion-preference-item">
                          <span className="companion-preference-name">{name}</span>
                          <span className="companion-preference-count">{count} 次</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="analysis-section">
                    <h3 className="analysis-section-title">给你的建议</h3>
                    <div className="analysis-suggestions">
                      {suggestions.map((suggestion, index) => (
                        <div key={index} className="suggestion-item">
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <div />
              <div className="modal-footer-btns">
                <button className="modal-btn" onClick={handleCloseAnalysis} type="button">
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HistoryPage;
