/**
 * @fileOverview 应用根组件
 * @description 心语盲盒应用入口，管理首页、抽取页、洞察页与历史页之间的状态流转与页面切换。
 * @created 2026-07-14
 */

import React, { useCallback, useState } from 'react';
import InkBackground from './components/InkBackground';
import DrawPage from './pages/DrawPage';
import HistoryPage from './pages/HistoryPage';
import HomePage from './pages/HomePage';
import InsightPage from './pages/InsightPage';
import { generateInsight } from './utils/taskHelpers';
import { createRecord } from './services/apiService';
import type { AppPage, ChatMessage, EmotionTask, InsightResult } from './types';

/**
 * 应用根组件
 * @description 渲染背景、当前页面，并维护任务、回应、洞察、陪伴者等全局状态。
 * @returns {React.ReactElement} 应用 JSX
 */
const App: React.FC = () => {
  /** 当前展示页面 */
  const [currentPage, setCurrentPage] = useState<AppPage>('home');
  /** 当前抽取到的任务 */
  const [currentTask, setCurrentTask] = useState<EmotionTask | null>(null);
  /** 用户对当前任务的回应 */
  const [currentResponse, setCurrentResponse] = useState<string>('');
  /** 当前生成的洞察结果 */
  const [currentInsight, setCurrentInsight] = useState<InsightResult | null>(null);
  /** 当前选中的陪伴者名称 */
  const [currentCompanion, setCurrentCompanion] = useState<string>('静水深流');

  /**
   * 进入抽取页
   * @description 从首页点击进入后切换到抽取页。
   */
  const handleEnter = useCallback(() => {
    setCurrentPage('draw');
  }, []);

  /**
   * 提交任务回应
   * @description 在抽取页提交后生成洞察结果，并切换到洞察页。
   * @param {EmotionTask} task - 当前任务
   * @param {string} response - 用户回应
   */
  const handleSubmit = useCallback((task: EmotionTask, response: string) => {
    try {
      const insight: InsightResult = generateInsight(task.type);
      setCurrentTask(task);
      setCurrentResponse(response);
      setCurrentInsight(insight);
      setCurrentPage('insight');
    } catch (err) {
      console.error('提交任务失败:', err);
    }
  }, []);

  /**
   * 保存记录并进入历史页
   * @description 将当前任务、回应、洞察与陪伴者打包为日记记录，同时同步到后端 API 和 localStorage，然后切换到历史页。
   * @param {string} companion - 选中的陪伴者名称
   * @param {ChatMessage[]} messages - 聊天记录
   */
  const handleSaveRecord = useCallback(async (companion: string, _messages: ChatMessage[]) => {
    try {
      if (!currentTask || !currentInsight) {
        return;
      }

      await createRecord({
        taskType: currentTask.type,
        taskContent: currentTask.task,
        userResponse: currentResponse || '（未填写）',
        companion,
        insights: currentInsight
      });

      setCurrentCompanion(companion);
      setCurrentPage('history');
    } catch (err) {
      console.error('保存记录失败:', err);
    }
  }, [currentTask, currentResponse, currentInsight]);

  /**
   * 重新开始探索
   * @description 清空当前任务状态并返回抽取页。
   */
  const handleRestart = useCallback(() => {
    setCurrentTask(null);
    setCurrentResponse('');
    setCurrentInsight(null);
    setCurrentPage('draw');
  }, []);

  /**
   * 从历史页返回探索
   * @description 返回抽取页，保留用户当前状态。
   */
  const handleBackToDraw = useCallback(() => {
    setCurrentPage('draw');
  }, []);

  /**
   * 渲染当前页面
   * @description 根据 currentPage 状态渲染对应页面组件。
   * @returns {React.ReactElement} 当前页面 JSX
   */
  const renderPage = (): React.ReactElement => {
    switch (currentPage) {
      case 'home':
        return <HomePage onEnter={handleEnter} />;
      case 'draw':
        return <DrawPage onSubmit={handleSubmit} />;
      case 'insight':
        if (!currentTask) {
          return <DrawPage onSubmit={handleSubmit} />;
        }
        return (
          <InsightPage
            task={currentTask}
            response={currentResponse}
            initialCompanion={currentCompanion}
            onRestart={handleRestart}
            onViewHistory={() => setCurrentPage('history')}
            onSaveRecord={handleSaveRecord}
          />
        );
      case 'history':
      default:
        return <HistoryPage onBack={handleBackToDraw} onRestart={handleRestart} />;
    }
  };

  return (
    <div className="app">
      <InkBackground />
      <main className="container">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
