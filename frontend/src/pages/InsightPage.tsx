/**
 * @fileOverview 洞察页组件
 * @description 展示 AI 情绪洞察、诗意表达与温暖话语，提供陪伴者选择与即时对话功能。
 * @created 2026-07-14
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { companionList, companionMap } from '../data/companions';
import { generateChatReply, getRandomGreeting } from '../utils/chatHelpers';
import { generateInsight } from '../utils/taskHelpers';
import type { ChatMessage, EmotionTask, InsightResult } from '../types';

/**
 * 洞察页组件 props
 * @interface InsightPageProps
 */
interface InsightPageProps {
  /** 当前完成的任务 */
  task: EmotionTask;
  /** 用户对任务的回应 */
  response: string;
  /** 默认选中的陪伴者名称 */
  initialCompanion?: string;
  /** 开启新的探索回调 */
  onRestart: () => void;
  /** 查看历史记录回调 */
  onViewHistory: () => void;
  /** 保存记录回调，传入选中的陪伴者和聊天记录 */
  onSaveRecord: (companion: string, messages: ChatMessage[]) => void;
}

/**
 * 陪伴者头像 SVG 组件
 * @description 根据陪伴者名称渲染对应的头像图标。
 * @param {object} props - 组件 props
 * @param {string} props.name - 陪伴者名称
 * @returns {React.ReactElement} 头像 SVG
 */
const CompanionAvatar: React.FC<{ name: string }> = ({ name }) => {
  const renderPaths = () => {
    switch (name) {
      case '静水深流':
        return (
          <>
            <circle cx="30" cy="30" r="25" stroke="currentColor" strokeWidth="1" />
            <circle cx="30" cy="22" r="8" fill="currentColor" opacity="0.6" />
            <path d="M30 32 Q20 40 30 50 Q40 40 30 32" fill="currentColor" opacity="0.4" />
          </>
        );
      case '晨曦微光':
        return (
          <>
            <circle cx="30" cy="30" r="25" stroke="currentColor" strokeWidth="1" />
            <circle cx="30" cy="22" r="8" fill="currentColor" opacity="0.6" />
            <path d="M30 32 L22 42 L38 42 Z" fill="currentColor" opacity="0.4" />
          </>
        );
      case '山间明月':
        return (
          <>
            <circle cx="30" cy="30" r="25" stroke="currentColor" strokeWidth="1" />
            <circle cx="30" cy="22" r="8" fill="currentColor" opacity="0.6" />
            <path d="M30 32 Q25 40 30 48 Q35 40 30 32" fill="currentColor" opacity="0.4" />
          </>
        );
      case '清风徐来':
      default:
        return (
          <>
            <circle cx="30" cy="30" r="25" stroke="currentColor" strokeWidth="1" />
            <circle cx="30" cy="22" r="8" fill="currentColor" opacity="0.6" />
            <path d="M20 35 Q30 30 40 35" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6" />
          </>
        );
    }
  };

  return (
    <svg viewBox="0 0 60 60" fill="none">
      {renderPaths()}
    </svg>
  );
};

/**
 * 洞察页组件
 * @description 渲染洞察卡片、陪伴者选择器、聊天对话与页面操作按钮。
 * @param {InsightPageProps} props - 组件 props
 * @returns {React.ReactElement} 洞察页 JSX
 */
const InsightPage: React.FC<InsightPageProps> = ({
  task,
  response: _response,
  initialCompanion = '静水深流',
  onRestart,
  onViewHistory: _onViewHistory,
  onSaveRecord
}) => {
  /** AI 生成的洞察结果 */
  const insight: InsightResult = useMemo(() => generateInsight(task.type), [task.type]);
  /** 当前选中的陪伴者名称 */
  const [selectedCompanion, setSelectedCompanion] = useState<string>(initialCompanion);
  /** 聊天记录数组 */
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  /** 输入框当前值 */
  const [inputValue, setInputValue] = useState<string>('');
  /** 是否正在显示机器人打字中 */
  const [isTyping, setIsTyping] = useState<boolean>(false);
  /** 洞察卡片是否可见，用于入场动画 */
  const [isVisible, setIsVisible] = useState<boolean>(false);

  /** 聊天消息容器 DOM 引用 */
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  /** 输入框 DOM 引用 */
  const inputRef = useRef<HTMLInputElement | null>(null);

  /**
   * 滚动到聊天区域底部
   * @description 在新增消息后自动滚动到底部。
   */
  const scrollToBottom = useCallback(() => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('滚动聊天区域失败:', err);
    }
  }, []);

  /**
   * 初始化入场动画与问候语
   * @description 组件挂载后依次显示洞察卡片，并添加当前陪伴者的开场白。
   */
  useEffect(() => {
    const visibilityTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    const greetingTimer = setTimeout(() => {
      const greeting: string = getRandomGreeting(selectedCompanion);
      if (greeting) {
        setMessages([{ role: 'bot', content: greeting }]);
      }
    }, 800);

    return () => {
      clearTimeout(visibilityTimer);
      clearTimeout(greetingTimer);
    };
  }, [selectedCompanion]);

  /**
   * 聊天记录变化时滚动到底部
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  /**
   * 选择陪伴者
   * @description 更新当前陪伴者并发送一条新的开场白。
   * @param {string} name - 陪伴者名称
   */
  const handleSelectCompanion = useCallback((name: string) => {
    if (name === selectedCompanion) {
      return;
    }
    setSelectedCompanion(name);
    const greeting: string = getRandomGreeting(name);
    if (greeting) {
      setMessages((prev) => [...prev, { role: 'bot', content: greeting }]);
    }
  }, [selectedCompanion]);

  /**
   * 发送聊天消息
   * @description 将用户消息加入聊天记录，并模拟陪伴者回复。
   */
  const handleSendMessage = useCallback(() => {
    const trimmed: string = inputValue.trim();
    if (!trimmed) {
      return;
    }

    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setInputValue('');
    setIsTyping(true);

    const timer = setTimeout(() => {
      try {
        const reply: string = generateChatReply(trimmed, selectedCompanion);
        setIsTyping(false);
        if (reply) {
          setMessages((prev) => [...prev, { role: 'bot', content: reply }]);
        }
      } catch (err) {
        console.error('生成回复失败:', err);
        setIsTyping(false);
      }
    }, 600);

    return () => {
      clearTimeout(timer);
    };
  }, [inputValue, selectedCompanion]);

  /**
   * 处理输入框键盘事件
   * @description 按下 Enter 键时发送消息。
   * @param {React.KeyboardEvent<HTMLInputElement>} event - 键盘事件
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  /**
   * 完成探索并保存记录
   * @description 将当前陪伴者和聊天记录传递给父组件保存。
   */
  const handleComplete = useCallback(() => {
    onSaveRecord(selectedCompanion, messages);
  }, [onSaveRecord, selectedCompanion, messages]);

  const insightCards: Array<{ type: string; content: string; poetry?: boolean; icon: React.ReactNode }> = [
    {
      type: '情绪洞察',
      content: insight.insight,
      icon: (
        <svg className="insight-icon" viewBox="0 0 50 50" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="25" cy="20" r="12" />
          <path d="M25 32 L25 45" />
          <path d="M15 40 L35 40" />
        </svg>
      )
    },
    {
      type: '诗意表达',
      content: insight.poem,
      poetry: true,
      icon: (
        <svg className="insight-icon" viewBox="0 0 50 50" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 40 Q15 20 25 25 Q35 30 40 10" />
          <circle cx="40" cy="10" r="3" fill="currentColor" />
        </svg>
      )
    },
    {
      type: '温暖话语',
      content: insight.warm,
      icon: (
        <svg className="insight-icon" viewBox="0 0 50 50" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 25 Q25 10 40 25 Q25 40 10 25" />
          <circle cx="25" cy="25" r="5" />
        </svg>
      )
    }
  ];

  const currentCompanion = companionMap[selectedCompanion];

  return (
    <section className="洞察页 active" id="洞察页">
      <div className="section-header">
        <p className="section-label">AI Insights</p>
        <h2 className="section-title">你的内心独白</h2>
      </div>

      <div className="insight-grid">
        {insightCards.map((card, index) => (
          <div
            key={card.type}
            className={`insight-card ${card.poetry ? 'poetry' : ''} ${isVisible ? 'visible' : ''}`}
            style={{ transitionDelay: `${index * 0.15}s` }}
          >
            {card.icon}
            <p className="insight-type">{card.type}</p>
            <p className="insight-content">{card.content}</p>
          </div>
        ))}
      </div>

      <div className={`companion-selector ${isVisible ? 'visible' : ''}`}>
        <p className="companion-label">选择你的陪伴者</p>
        <div className="companion-list">
          {companionList.map((companion) => (
            <div
              key={companion.name}
              className={`companion-item ${selectedCompanion === companion.name ? 'active' : ''}`}
              onClick={() => handleSelectCompanion(companion.name)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSelectCompanion(companion.name);
                }
              }}
            >
              <div className="companion-avatar">
                <CompanionAvatar name={companion.name} />
              </div>
              <span className="companion-name">{companion.name}</span>
              <span className="companion-desc">{companion.tagline.split('，')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-area">
        <div className="current-companion">
          <span className="current-companion-dot" />
          <span>{currentCompanion ? `${currentCompanion.name} 陪伴中` : '陪伴中'}</span>
        </div>
        <div className="chat-messages">
          <div className="chat-message bot">
            <p>
              今天你完成了「
              <span>{task.task.split('\n')[0]}</span>
              」，这是我们对话的开始。
            </p>
          </div>
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`chat-message ${message.role}`}>
              <p>{message.content}</p>
            </div>
          ))}
          {isTyping && (
            <div className="chat-message bot">
              <p>
                <span className="chat-typing">
                  <span className="chat-typing-dot" />
                  <span className="chat-typing-dot" />
                  <span className="chat-typing-dot" />
                </span>
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-wrap">
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder="写下你的想法..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="chat-send" onClick={handleSendMessage} type="button" aria-label="发送">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="action-buttons">
        <button className="restart-btn" onClick={onRestart} type="button">
          开启新的探索
        </button>
        <button className="history-btn" onClick={handleComplete} type="button">
          保存并查看记录
        </button>
      </div>

      <div className="footer">
        <p className="footer-text">心语盲盒 · 与自己对话的片刻宁静</p>
      </div>
    </section>
  );
};

export default InsightPage;
