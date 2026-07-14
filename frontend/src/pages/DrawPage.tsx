/**
 * @fileOverview 抽取页组件
 * @description 心语盲盒核心交互页面，包含盲盒抽取、任务类型筛选、任务回应输入与提交。
 * @created 2026-07-14
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { drawRandomTask, splitTaskContent } from '../utils/taskHelpers';
import type { EmotionTask, TaskType } from '../types';

/**
 * 抽取页组件 props
 * @interface DrawPageProps
 */
interface DrawPageProps {
  /** 提交任务后跳转到洞察页的回调 */
  onSubmit: (task: EmotionTask, response: string) => void;
}

/**
 * 任务类型选项
 * @type {Array<{ label: string; value: TaskType | '全部' }>}
 */
const taskTypeOptions: Array<{ label: string; value: TaskType | '全部' }> = [
  { label: '全部', value: '全部' },
  { label: '拍照记录', value: '拍照记录' },
  { label: '文字书写', value: '文字书写' },
  { label: '行动打卡', value: '行动打卡' }
];

/**
 * 抽取页组件
 * @description 渲染盲盒卡片、任务类型标签、输入框与提交按钮，管理盲盒打开动画与鼠标跟随效果。
 * @param {DrawPageProps} props - 组件 props
 * @returns {React.ReactElement} 抽取页 JSX
 */
const DrawPage: React.FC<DrawPageProps> = ({ onSubmit }) => {
  /** 当前选中的任务类型筛选 */
  const [selectedType, setSelectedType] = useState<TaskType | '全部'>('全部');
  /** 当前抽取到的任务 */
  const [currentTask, setCurrentTask] = useState<EmotionTask>(() => drawRandomTask('全部'));
  /** 盲盒是否处于打开状态 */
  const [isOpened, setIsOpened] = useState<boolean>(false);
  /** 盲盒是否正在播放打开动画 */
  const [isOpening, setIsOpening] = useState<boolean>(false);
  /** 用户输入的任务回应 */
  const [response, setResponse] = useState<string>('');
  /** 卡片 transform 样式，用于鼠标跟随倾斜 */
  const [cardTransform, setCardTransform] = useState<string>('');

  /** 盲盒卡片 DOM 引用 */
  const cardRef = useRef<HTMLDivElement | null>(null);

  /**
   * 打开盲盒并抽取任务
   * @description 触发打开动画，并根据当前选中的类型随机抽取一条任务。
   * @param {TaskType | '全部'} [forcedType] - 强制指定的任务类型
   */
  const openGiftBox = useCallback((forcedType?: TaskType | '全部') => {
    if (isOpening) {
      return;
    }

    const taskType: TaskType | '全部' = forcedType || selectedType;
    const newTask: EmotionTask = drawRandomTask(taskType);

    setIsOpening(true);
    setIsOpened(false);
    setCardTransform('');
    setCurrentTask(newTask);

    // 短暂延迟后播放打开动画
    setTimeout(() => {
      setIsOpened(true);
    }, 100);

    // 动画结束后恢复鼠标跟随
    setTimeout(() => {
      setIsOpening(false);
    }, 700);
  }, [isOpening, selectedType]);

  /**
   * 选择任务类型
   * @description 更新选中的任务类型并立即重新抽取任务。
   * @param {TaskType | '全部'} type - 要选中的任务类型
   */
  const handleSelectType = useCallback((type: TaskType | '全部') => {
    setSelectedType(type);
    openGiftBox(type);
  }, [openGiftBox]);

  /**
   * 处理鼠标移动，实现卡片倾斜跟随效果
   * @description 根据鼠标在卡片上的相对位置计算 rotateX 与 rotateY。
   * @param {React.MouseEvent<HTMLDivElement>} event - 鼠标移动事件
   */
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (isOpening || isOpened) {
      return;
    }

    const card = cardRef.current;
    if (!card) {
      return;
    }

    try {
      const rect: DOMRect = card.getBoundingClientRect();
      const x: number = event.clientX - rect.left;
      const y: number = event.clientY - rect.top;
      const centerX: number = rect.width / 2;
      const centerY: number = rect.height / 2;
      const rotateX: number = ((y - centerY) / centerY) * -8;
      const rotateY: number = ((x - centerX) / centerX) * 8;

      setCardTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
    } catch (err) {
      console.error('鼠标跟随效果异常:', err);
    }
  }, [isOpening, isOpened]);

  /**
   * 处理鼠标离开，重置卡片倾斜
   */
  const handleMouseLeave = useCallback(() => {
    setCardTransform('');
  }, []);

  /**
   * 提交任务
   * @description 将当前任务与用户回应传递给父组件。
   */
  const handleSubmit = useCallback(() => {
    onSubmit(currentTask, response.trim() || '（未填写）');
  }, [currentTask, response, onSubmit]);

  /**
   * 组件挂载时自动打开一次盲盒
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      openGiftBox();
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [openGiftBox]);

  const { title, description } = splitTaskContent(currentTask.task);

  return (
    <section className="抽取页 active" id="抽取页">
      <div className="section-header">
        <p className="section-label">Moment of Discovery</p>
        <h2 className="section-title">抽取你的情绪任务</h2>
      </div>

      <div className="盲盒-container">
        <div
          ref={cardRef}
          className={`盲盒-card ${!isOpening ? 'tilting' : ''}`}
          style={{ transform: cardTransform }}
          onClick={() => openGiftBox()}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              openGiftBox();
            }
          }}
        >
          <div className={`盲盒-wrapper ${isOpened ? 'opened' : ''}`}>
            <div className="盲盒-base">
              <p className="盲盒-task-label">Your Mission</p>
              <p className="盲盒-task">
                {title}
                {description && (
                  <>
                    <br />
                    {description}
                  </>
                )}
              </p>
            </div>
            <div className="盲盒-lid">
              <svg className="盲盒-icon" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="20" y="30" width="60" height="50" rx="4" />
                <path d="M20 40 L50 55 L80 40" />
                <line x1="50" y1="55" x2="50" y2="65" />
                <circle cx="50" cy="70" r="3" fill="currentColor" />
                <path d="M35 30 L35 20 Q35 15 40 15 L60 15 Q65 15 65 20 L65 30" />
              </svg>
              <p className="盲盒-question">今日，你想探索什么？</p>
              <p className="盲盒-hint">点击开启盲盒</p>
            </div>
          </div>
        </div>
      </div>

      <div className="task-tags">
        {taskTypeOptions.map((option) => (
          <span
            key={option.value}
            className={`task-tag ${selectedType === option.value ? 'active' : ''}`}
            onClick={() => handleSelectType(option.value)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleSelectType(option.value);
              }
            }}
          >
            {option.label}
          </span>
        ))}
      </div>

      <div className={`task-input-area ${isOpened ? 'visible' : ''}`}>
        <p className="task-input-label">完成任务后，记录你的感受：</p>
        <textarea
          className="task-input"
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="在这里写下你的回应..."
          rows={5}
        />
      </div>

      <button
        className={`submit-btn ${isOpened ? 'visible' : ''}`}
        onClick={handleSubmit}
        type="button"
      >
        完成探索
      </button>
    </section>
  );
};

export default DrawPage;
