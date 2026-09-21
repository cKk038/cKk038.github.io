/**
 * 研究方向
 *
 * 四个方向与实验室官方主页（web.xidian.edu.cn/yangx）上「主要研究方向」一致。
 * 下面的简介与子方向条目是按方向内涵整理的，如与实验室内部表述不符请直接改写。
 *
 * ── 配图来自实验室自己论文里的框架图 ──────────────────────────
 * 不是自绘示意图，而是从实验室代表性论文里取的 framework 图，
 * 出处、作者、许可都记录在 public/img/research/research-CREDITS.md。
 * 三篇是 MDPI《Remote Sensing》（CC BY 4.0），一篇是 arXiv 版本（CC BY-NC-SA 4.0）。
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
 *     image: '/img/research/multi-source.png',   // 论文框架图；不给则只显示图标
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
  /** 配图路径（论文框架图）。不给则卡片只显示图标与文字 */
  image?: string;
  /** 配图出处，显示在图注里 */
  paper?: { title: string; venue: string; url: string };
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
    image: '/img/research/multi-source.png',
    paper: {
      title: 'Lightweight RGB-D Salient Object Detection from a Speed-Accuracy Tradeoff Perspective',
      venue: 'IEEE TIP 2025',
      url: 'https://arxiv.org/abs/2505.04758',
    },
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
    image: '/img/research/4d-scene.png',
    paper: {
      title: '3D Point Cloud Shape Generation with Collaborative Learning of GAN and Auto-Encoder',
      venue: 'Remote Sensing 2024, 16(10), 1772',
      url: 'https://www.mdpi.com/2072-4292/16/10/1772',
    },
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
    image: '/img/research/embodied.png',
    paper: {
      title: 'Adaptive Granularity-Fused Keypoint Detection for 6D Pose Estimation of Space Targets',
      venue: 'Remote Sensing 2024, 16(22), 4138',
      url: 'https://www.mdpi.com/2072-4292/16/22/4138',
    },
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
    image: '/img/research/remote-sensing.png',
    paper: {
      title: 'Coastal Ship Tracking with Memory-Guided Perceptual Network',
      venue: 'Remote Sensing 2023, 15(12), 3150',
      url: 'https://www.mdpi.com/2072-4292/15/12/3150',
    },
  },
];

/** 按 id 取方向 */
export function topicById(id: string): ResearchTopic | undefined {
  return topics.find((t) => t.id === id);
}