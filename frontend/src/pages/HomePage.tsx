/**
 * @fileOverview 首页组件
 * @description 心语盲盒的沉浸式入口页面，包含 Logo、标题、副标题与进入按钮。
 * @created 2026-07-14
 */

import React from 'react';

/**
 * 首页组件 props
 * @interface HomePageProps
 * @description 仅接收一个进入下一页的回调函数
 */
interface HomePageProps {
  /** 点击"开启旅程"按钮时的回调 */
  onEnter: () => void;
}

/**
 * 首页组件
 * @description 渲染沉浸式首页，包含品牌 Logo、主标题、副标题和进入按钮。
 * @param {HomePageProps} props - 组件 props
 * @returns {React.ReactElement} 首页 JSX
 */
const HomePage: React.FC<HomePageProps> = ({ onEnter }) => {
  return (
    <section className="hero" id="首页">
      <div className="logo-symbol">
        <svg viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="50" stroke="var(--charcoal)" strokeWidth="0.5" opacity="0.3" />
          <circle cx="60" cy="60" r="40" stroke="var(--charcoal)" strokeWidth="0.3" opacity="0.2" />
          <circle cx="60" cy="60" r="8" fill="var(--charcoal)" opacity="0.6" />
          <path
            d="M60 20 Q80 40 60 60 Q40 80 60 100"
            stroke="var(--charcoal)"
            strokeWidth="0.8"
            fill="none"
            opacity="0.4"
          />
        </svg>
      </div>
      <div className="logo-mark">心语盲盒</div>
      <h1 className="hero-title">探索内心</h1>
      <p className="hero-subtitle">打开盲盒，与自己对话</p>
      <button className="enter-btn" onClick={onEnter} type="button">
        开启旅程
      </button>
    </section>
  );
};

export default HomePage;
