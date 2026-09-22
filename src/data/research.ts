/**
 * 研究方向
 *
 * 四个方向与实验室官方主页（web.xidian.edu.cn/yangx）上「主要研究方向」一致。
 * 下面的简介与子方向条目是按方向内涵整理的，如与实验室内部表述不符请直接改写。
 *
 * ── 配图是自绘的矢量网络图 ────────────────────────────────────
 * 不用论文里的 framework 图：那种图是为具体方法服务的，缩到卡片宽度后小字全糊，
 * 而且跟「这个方向在研究什么」对不上。现在改成按方向内涵画的通用网络图，
 * 由 _tools/build-research-diagrams.mjs 生成成 SVG（矢量、品牌配色、带动画）。
 *
 *
 * ── 怎么写一个方向 ──────────────────────────────────────────
 *   {
 *     id: 'multi-source',                   // 唯一 id
 *     title: { zh: '多源数据智能分析', en: 'Intelligent Analysis of Multi-Source Data' },
 *     summary: { zh: '一句话简介', en: 'One-line summary' },
 *     points: [                             // 卡片上的圆点列表（子方向）
 *       { zh: '……', en: '…' },
 *     ],
 *     icon: 'bi-diagram-3',                 // Bootstrap Icons 图标名
 *     image: '/img/research/multi-source.svg',   // 论文框架图；不给则只显示图标
 *     paper: {                              // 可选：图注里标出论文来源
 *       title: '…', venue: '…', url: '…',
 *     },
 *   }
 */

import type { L } from '../i18n/ui';

export interface ResearchTopic {
  /** 唯一 id */
  id: string;
  title: L;
  summary: L;
  /** 子方向列表 */
  points: L[];
  /** Bootstrap Icons 图标名 */
  icon: string;
  /** 配图路径（自绘网络图，见 _tools/build-research-diagrams.mjs）。不给则卡片只显示图标与文字 */
  image?: string;
}

export const topics: ResearchTopic[] = [
  {
    id: 'multi-source',
    title: { zh: '多源数据智能分析', en: 'Intelligent Analysis of Multi-Source Data' },
    summary: {
      zh: '融合可见光、深度、红外、SAR 与文本等异质数据，实现跨模态的协同感知与联合解译。',
      en: 'Fusing heterogeneous data — optical, depth, infrared, SAR and text — for cross-modal perception and joint interpretation.',
    },
    points: [
      { zh: '跨模态特征对齐与融合', en: 'Cross-modal feature alignment and fusion' },
      { zh: '可见光–红外 / 深度多模态学习', en: 'Visible–infrared and RGB-D multimodal learning' },
      { zh: 'SAR–光学跨模态转换', en: 'SAR-to-optical cross-modal translation' },
      { zh: '多源信息协同的目标解译', en: 'Collaborative target interpretation across sources' },
    ],
    icon: 'bi-diagram-3',
    image: '/img/research/multi-source.svg',
  },
  {
    id: '4d-scene',
    title: { zh: '四维场景生成理解', en: '4D Scene Generation and Understanding' },
    summary: {
      zh: '面向三维场景的生成、重建与语义理解，并进一步建模其随时间演化的动态过程。',
      en: 'Generation, reconstruction and semantic understanding of 3D scenes, extended to model how they evolve over time.',
    },
    points: [
      { zh: '三维点云生成与形状合成', en: '3D point cloud generation and shape synthesis' },
      { zh: '神经隐式表示与高斯泼溅重建', en: 'Neural implicit representation and Gaussian splatting' },
      { zh: '三维场景语义理解与实例分割', en: '3D scene understanding and instance segmentation' },
      { zh: '动态场景的时空建模', en: 'Spatio-temporal modelling of dynamic scenes' },
    ],
    icon: 'bi-badge-3d',
    image: '/img/research/4d-scene.svg',
  },
  {
    id: 'embodied',
    title: { zh: '具身智能与智能体', en: 'Embodied Intelligence and Agents' },
    summary: {
      zh: '研究智能体在真实与仿真环境中的感知、决策与行动，让机器能够理解空间、操作物体并与环境协作。',
      en: 'Perception, decision-making and action for agents in real and simulated environments — understanding space, manipulating objects and collaborating.',
    },
    points: [
      { zh: '6D 位姿估计与空间目标感知', en: '6D pose estimation and space target perception' },
      { zh: '视觉–语言–动作模型', en: 'Vision–language–action models' },
      { zh: '具身导航与机器人操作', en: 'Embodied navigation and robotic manipulation' },
      { zh: '人机交互与协作', en: 'Human–robot interaction and collaboration' },
    ],
    icon: 'bi-robot',
    image: '/img/research/embodied.svg',
  },
  {
    id: 'remote-sensing',
    title: { zh: '遥感目标智能感知', en: 'Intelligent Perception of Remote Sensing Targets' },
    summary: {
      zh: '面向高分辨率光学与 SAR 影像的目标检测、识别与跟踪，应对方向任意、尺度剧烈变化与背景复杂等挑战。',
      en: 'Detection, recognition and tracking of targets in high-resolution optical and SAR imagery, under arbitrary orientation, extreme scale variation and cluttered backgrounds.',
    },
    points: [
      { zh: '旋转框与任意方向目标检测', en: 'Rotated and arbitrary-oriented object detection' },
      { zh: '弱小目标与多尺度检测', en: 'Small, weak and multi-scale target detection' },
      { zh: '遥感目标跟踪', en: 'Remote sensing target tracking' },
      { zh: '变化检测与地物要素提取', en: 'Change detection and land-cover extraction' },
    ],
    icon: 'bi-crosshair',
    image: '/img/research/remote-sensing.svg',
  },
];

/** 按 id 取方向 */
export function topicById(id: string): ResearchTopic | undefined {
  return topics.find((t) => t.id === id);
}