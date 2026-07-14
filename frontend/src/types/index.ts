/**
 * @fileOverview 心语盲盒前端类型定义
 * @description 定义项目中使用的核心数据结构，包括情绪任务、陪伴者、聊天记录和历史记录等
 * @created 2026-07-14
 */

/** 任务类型 */
export type TaskType = '拍照记录' | '文字书写' | '行动打卡';

/** 情绪任务项 */
export interface EmotionTask {
  /** 任务类型 */
  type: TaskType;
  /** 任务内容描述，可能包含换行符 */
  task: string;
}

/** 任务类型的洞察内容集合 */
export interface TaskInsights {
  /** 情绪洞察文案数组 */
  insights: string[];
  /** 诗意表达文案数组 */
  poems: string[];
  /** 温暖话语文案数组 */
  warms: string[];
}

/** 陪伴者回复分类 */
export type ReplyCategory =
  | '问候'
  | '开心'
  | '难过'
  | '焦虑'
  | '愤怒'
  | '孤独'
  | '提问怎么办'
  | '提问为什么'
  | '自我反思'
  | '感谢'
  | '任务分享'
  | '迷茫'
  | '疲惫'
  | '默认';

/** 陪伴者（情绪人物）完整配置 */
export interface Companion {
  /** 陪伴者名称 */
  name: string;
  /** 陪伴者标语 */
  tagline: string;
  /** 开场白数组 */
  greetings: string[];
  /** 按分类组织的回复库 */
  replies: Record<ReplyCategory, string[]>;
}

/** 情绪分类名称 */
export type EmotionCategory =
  | '平静'
  | '温暖'
  | '开心'
  | '迷茫'
  | '疲惫'
  | '焦虑'
  | '难过'
  | '愤怒';

/** 情绪关键词映射 */
export type EmotionKeywords = Record<EmotionCategory, string[]>;

/** 情绪颜色映射 */
export type EmotionColors = Record<EmotionCategory, string>;

/** 情绪 Emoji 映射 */
export type EmotionEmojis = Record<EmotionCategory, string>;

/** AI 生成的洞察结果 */
export interface InsightResult {
  /** 情绪洞察 */
  insight: string;
  /** 诗意表达 */
  poem: string;
  /** 温暖话语 */
  warm: string;
}

/** 聊天消息 */
export interface ChatMessage {
  /** 消息角色 */
  role: 'user' | 'bot';
  /** 消息内容 */
  content: string;
}

/** 历史记录（本地存储/后端返回） */
export interface DiaryRecord {
  /** 记录唯一标识 */
  id: number;
  /** 记录日期时间 */
  date: string;
  /** 任务类型 */
  taskType: TaskType;
  /** 任务内容 */
  taskContent: string;
  /** 用户回应 */
  userResponse: string;
  /** 陪伴者名称 */
  companion: string;
  /** AI 洞察结果 */
  insights: InsightResult;
}

/** 前端应用当前页面 */
export type AppPage = 'home' | 'draw' | 'insight' | 'history';
