/**
 * @fileOverview 墨迹背景组件
 * @description 渲染宣纸质感背景、呼吸墨滴装饰与可动画的 SVG 墨迹线条。墨迹线条动画使用 requestAnimationFrame 实现，确保跨浏览器兼容。
 * @created 2026-07-14
 */

import React, { useEffect, useRef } from 'react';

/**
 * 墨迹背景组件
 * @description 全屏固定的背景层，包含墨滴呼吸动画与底部 SVG 墨迹线条动画。不接收任何 props，渲染效果完全由内部状态驱动。
 * @returns {React.ReactElement} 背景 JSX 元素
 */
const InkBackground: React.FC = () => {
  /**
   * SVG 路径元素引用
   * @type {React.RefObject<SVGPathElement | null>}
   */
  const pathRef = useRef<SVGPathElement | null>(null);

  /**
   * 动画帧 ID，用于组件卸载时取消动画
   * @type {React.MutableRefObject<number | null>}
   */
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const pathElement = pathRef.current;

    if (!pathElement) {
      return;
    }

    /**
     * 正弦缓动函数
     * @description 将线性时间进度转换为平滑的 ease-in-out 进度
     * @param {number} t - 0 到 1 的线性进度
     * @returns {number} 缓动后的进度
     */
    const easeInOutSine = (t: number): number => {
      return -(Math.cos(Math.PI * t) - 1) / 2;
    };

    /**
     * 线性插值函数
     * @description 根据起始值、结束值与进度计算中间值
     * @param {number} start - 起始值
     * @param {number} end - 结束值
     * @param {number} t - 0 到 1 的进度
     * @returns {number} 插值结果
     */
    const lerp = (start: number, end: number, t: number): number => {
      return start + (end - start) * t;
    };

    const duration: number = 20000;
    const startTime: number = performance.now();

    // 两个关键路径的控制点数组
    const path1: number[] = [25, 30, 50, 50, 100, 50];
    const path2: number[] = [25, 70, 50, 50, 100, 50];

    /**
     * 动画帧回调
     * @description 每帧根据时间进度插值计算新的 SVG 路径 d 属性
     */
    const animate = () => {
      try {
        const now: number = performance.now();
        const elapsed: number = (now - startTime) % duration;
        const rawProgress: number = elapsed / duration;
        const progress: number = easeInOutSine(rawProgress < 0.5 ? rawProgress * 2 : (1 - rawProgress) * 2);

        const current: number[] = path1.map((start: number, index: number) => {
          return lerp(start, path2[index], progress);
        });

        const [controlX1, controlY1, endX1, endY1, endX2, endY2] = current;
        const d = `M0,50 Q${controlX1},${controlY1} ${endX1},${endY1} T${endX2},${endY2}`;

        pathElement.setAttribute('d', d);
        animationFrameRef.current = requestAnimationFrame(animate);
      } catch (err) {
        console.error('墨迹线条动画异常:', err);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className="ink-drop" style={{ top: '10%', left: '-200px' }} />
      <div className="ink-drop" style={{ bottom: '20%', right: '-150px', animationDelay: '2s' }} />
      <div className="ink-drop" style={{ top: '60%', left: '20%', animationDelay: '4s' }} />

      <svg className="ink-line" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          ref={pathRef}
          d="M0,50 Q25,30 50,50 T100,50"
          fill="none"
          stroke="var(--charcoal)"
          strokeWidth="0.1"
          opacity="0.1"
        />
      </svg>
    </>
  );
};

export default InkBackground;
