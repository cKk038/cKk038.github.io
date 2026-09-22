/**
 * 论文列表
 *
 * 数据来源：杨曦老师的 Google Scholar 主页
 * （https://scholar.google.com/citations?user=W5c-LSYAAAAJ），
 * 当前收录 **2022 年及以后的 102 篇**，由 _tools/import-scholar.mjs 导入。
 *
 * ── 更新流程 ────────────────────────────────────────────────
 *   1. 浏览器打开上面的 Scholar 主页，点「显示更多」把列表展开完整
 *      （Scholar 会拦截自动抓取，用真实浏览器打开即可）
 *   2. 把每行数据读出来存成 _tools/scholar-raw.json
 *   3. 运行：node _tools/import-scholar.mjs
 *
 * importer 只做两类**规范化**：清洗 venue 里的卷号页码、去掉中英文重复记录。
 * **作者顺序、标题、年份一律保持 Scholar 原文**，不做任何改写，符合引用规范。
 *
 * ⚠️ 注意：importer 会重置 `selected` 标记（按被引次数猜）。运行它之后，
 *    代表性论文会被覆盖成它猜的那 8 篇 —— 需要按下面的方式改回来。
 *
 * ── 代表性论文（selected）────────────────────────────────────
 * 由实验室提供的《Selected Publications》清单人工确定（2026-09 更新），共 10 篇，
 * 不是按被引次数自动挑的。清单是 .docx，用这个脚本读：
 *
 *     python _tools/extract-docx.py "Selected Publications.docx"
 *
 * 这 10 篇的作者用了完整姓名（其余条目是 Scholar 的缩写形式），
 * 因为清单里就是这么写的；其余字段与全表保持一致。
 *
 * ── 手动添加一条的格式 ──────────────────────────────────────
 *   {
 *     authors: 'Xi Yang, Yifan Zhang, Qi Tian',
 *     title: 'Exact title as published',
 *     venue: 'IEEE TPAMI',                 // 期刊/会议名，会加粗显示
 *     year: 2024,
 *     selected: true,                      // 标为「代表性论文」，研究页会展示
 *     links: [{ kind: 'pdf', url: 'https://…' }],
 *   }
 *
 * · 想高亮作者里的实验室成员，用双方括号：'[[Xi Yang]], Yifan Zhang'。
 * · links 的 kind 取值：pdf | doi | code | project | arxiv | scholar。
 * · 展示范围由下面的 MIN_YEAR 控制。
 *
 * 注：论文页**只按年份分组展示**，不做方向分类（曾有过按方向筛选的按钮，已按要求移除）。
 */

export type LinkKind = 'pdf' | 'doi' | 'code' | 'project' | 'arxiv' | 'scholar';

export interface PublicationLink {
  kind: LinkKind;
  url: string;
}

export interface Publication {
  /** 作者，按原文顺序，逗号分隔；实验室成员用 [[名字]] 包裹会高亮 */
  authors: string;
  title: string;
  /** 期刊 / 会议名称 */
  venue: string;
  year: number;
  /** 是否为代表性论文 */
  selected?: boolean;
  links?: PublicationLink[];
}

/** 当前展示范围：2022 年及以后（与实验室要求一致） */
export const MIN_YEAR = 2022;

export const publications: Publication[] = [
  // 由 _tools/import-scholar.mjs 从 Google Scholar 导出（抓取日：2026-09-21）
  // 共 102 条，2022 年及以后；作者/标题/年份保持 Google Scholar 原文
  // selected = 代表性论文，由实验室提供的 Selected Publications 清单确定（2026-09 更新），
  // 不是脚本按被引次数猜的；引用格式已按规范校对过
  {
    authors: 'Pengyu Chen, Xi Yang, Nannan Wang',
    title: 'SGP2: coarse-to-fine controllable multimodal remote sensing image generation',
    venue: 'European Conference on Computer Vision (ECCV)',
    year: 2026,
    selected: true,
    links: [{ kind: 'code', url: 'https://github.com/cpy0029/MMEarth-1.5M' }],
  },
  {
    authors: 'Hanyu Xing, Fei Gao, Xi Yang, Ziyun Li, Pengyu Chen, Nannan Wang',
    title: 'Imagine a reference: MLLM-augmented versatile image stylization',
    venue: 'ACM International Conference on Multimedia (ACM MM)',
    year: 2026,
    selected: true,
    links: [{ kind: 'code', url: 'https://github.com/Vincotto/MAIST' }],
  },
  {
    authors: 'Xingyilang Yin, Jiale Wang, Xi Yang, Mutian Xu, Xu Gu, Nannan Wang',
    title: 'Unleashing the multi-view fusion potential: noise correction in VLM for open-vocabulary 3D scene understanding',
    venue: 'IEEE Transactions on Multimedia',
    year: 2026,
    selected: true,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:AXPGKjj_ei8C' }],
  },
  {
    authors: 'J Wang, M Liu, X Yang, X Wei, L Wang, N Wang',
    title: 'Satellite-GS: Enhanced 2D Gaussian Splatting for Robust Satellite Reconstruction',
    venue: 'IEEE Transactions on Geoscience and Remote Sensing',
    year: 2026,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:q3oQSFYPqjQC' }],
  },
  {
    authors: 'Xi Yang, Quantao Xie',
    title: 'StyleProto: style-augmented prototype learning for cross-domain few-shot object detection',
    venue: 'Proceedings of the AAAI Conference on Artificial Intelligence',
    year: 2026,
    selected: true,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:5ugPr518TE4C' }, { kind: 'code', url: 'https://github.com/Wildfire-det/StyleProto' }],
  },
  {
    authors: 'X Yang, H Shi, F Gao, N Wang',
    title: 'AdaNoise: Cycle-Consistent Image Translation with Domain-Adaptive Noise Perturbation',
    venue: 'IEEE Transactions on Circuits and Systems for Video Technology',
    year: 2026,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:1qzjygNMrQYC' }],
  },
  {
    authors: 'Xi Yang, Quantao Xie, Yirong Yang, Nannan Wang',
    title: 'Active style-content dual-branch domain adaptation for semi-supervised SAR object detection',
    venue: 'IEEE Transactions on Image Processing',
    year: 2026,
    selected: true,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:wbdj-CoPYUoC' }],
  },
  {
    authors: 'X Yang, H Zhou, H Zhu, N Wang',
    title: 'Multimodal-Guided Self-Distillation for Unified Person Search',
    venue: 'Neural Networks',
    year: 2026,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:eMMeJKvmdy0C' }],
  },
  {
    authors: 'X Yang, P Li, N Wang',
    title: 'From Generation to Optimization: Improving Pseudo Labels for Semi-Supervised Object Detection',
    venue: 'IEEE Transactions on Image Processing',
    year: 2026,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:Y5dfb0dijaUC' }],
  },
  {
    authors: 'X Yang, H Zhou, H Zhu, N Wang',
    title: 'A Task-Aware Feature Decoupling Framework for End-to-End Person Search',
    venue: 'IEEE Transactions on Multimedia',
    year: 2026,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:Mojj43d5GZwC' }],
  },
  {
    authors: 'J Chen, X Yang, D Cheng, N Wang',
    title: 'Adversarial Specific Noise Generation with Dynamic Feature Dispersion for Visible-Infrared Person Re-Identification',
    venue: 'IEEE Transactions on Multimedia',
    year: 2026,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:WA5NYHcadZ8C' }],
  },
  {
    authors: 'X Yang, H Zhou, D Cheng, M Tian, N Wang',
    title: 'Multi-level Explicit Feature Alignment Network for Unsupervised Domain Adaptive Person Search',
    venue: 'IEEE Transactions on Circuits and Systems for Video Technology',
    year: 2026,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:HE397vMXCloC' }],
  },
  {
    authors: 'X Yang, K Chen, N Wang',
    title: 'ALIGNER: Learning Fine-grained Cross-modal Alignment for Text-Based Person Retrieval',
    venue: 'IEEE Transactions on Information Forensics and Security',
    year: 2026,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:XiVPGOgt02cC' }],
  },
  {
    authors: 'C Feng, X Gu, B Wang, X Yang',
    title: 'Zero-Shot Multi-Modal Part Segmentation for Space Target via 3D-2D Semantic Priors Transfer',
    venue: 'IEEE Transactions on Geoscience and Remote Sensing',
    year: 2026,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:bnK-pcrLprsC' }],
  },
  {
    authors: 'K Chen, X Yang, N Wang',
    title: 'Towards Semantically Enhanced Representation Learning for Text-Based Person Retrieval',
    venue: 'IEEE Transactions on Image Processing',
    year: 2026,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:V3AGJWp-ZtQC' }],
  },
  {
    authors: 'X Yang, X Zhong, N Wang',
    title: 'Distribution-Aware Prompt Learning for Vision-Language Models With Dynamic Boundary Prototype',
    venue: 'IEEE Transactions on Image Processing',
    year: 2026,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:J-pR_7NvFogC' }],
  },
  {
    authors: 'X Yang, H Zhou, D Cheng, N Wang',
    title: 'Overcoming Dual Incremental Challenges in Continual Person Search via Adapter and Prototype',
    venue: 'IEEE Transactions on Image Processing',
    year: 2026,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:kRWSkSYxWN8C' }],
  },
  {
    authors: 'X Yang, H Zhang, S Zhang, N Wang',
    title: 'Prompt Driven Knowledge Distillation for Remote Sensing Object Detection',
    venue: 'IEEE Transactions on Image Processing',
    year: 2026,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:mvPsJ3kp5DgC' }],
  },
  {
    authors: 'X Yang, K Chen, C Qi, N Wang',
    title: 'Probabilistic Distribution Alignment for Text-Based Person Retrieval',
    venue: 'IEEE Transactions on Circuits and Systems for Video Technology',
    year: 2026,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:fQNAKQ3IYiAC' }],
  },
  {
    authors: 'W Dong, X Yang, N Wang',
    title: 'Sparse VMamba: Robust Spatio-Temporal Information Modeling for Event Camera Person Re-Identification',
    venue: 'IEEE Transactions on Information Forensics and Security',
    year: 2026,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:LPZeul_q3PIC' }],
  },
  {
    authors: 'X Yang, H Liu, N Wang, X Gao',
    title: 'Bidirectional modality information interaction for Visible–Infrared Person Re-identification',
    venue: 'Pattern Recognition',
    year: 2025,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:EUQCXRtRnyEC' }],
  },
  {
    authors: 'S Duan, X Yang, N Wang, X Gao',
    title: 'Lightweight RGB-D salient object detection from a speed-accuracy tradeoff perspective',
    venue: 'IEEE Transactions on Image Processing',
    year: 2025,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:SP6oXDckpogC' }],
  },
  {
    authors: 'Songsong Duan, Xi Yang, Nannan Wang',
    title: 'Multi-label prototype visual spatial search for weakly supervised semantic segmentation',
    venue: 'IEEE/CVF Conference on Computer Vision and Pattern Recognition',
    year: 2025,
    selected: true,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:D_sINldO8mEC' }],
  },
  {
    authors: 'X Yang, D Kong, N Wang, X Gao',
    title: 'Hyperbolic insights with knowledge distillation for cross-domain few-shot learning',
    venue: 'IEEE Transactions on Image Processing',
    year: 2025,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:nb7KW1ujOQ8C' }],
  },
  {
    authors: 'X Yang, W Dong, D Cheng, N Wang, X Gao',
    title: 'Tienet: A tri-interaction enhancement network for multimodal person reidentification',
    venue: 'IEEE Transactions on Neural Networks and Learning Systems',
    year: 2025,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:1sJd4Hv_s6UC' }],
  },
  {
    authors: 'X Yang, X Yin, N Wang, X Gao',
    title: 'Associative graph convolution network for point cloud analysis',
    venue: 'Pattern Recognition',
    year: 2025,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:pyW8ca7W8N0C' }],
  },
  {
    authors: 'C Qi, X Yang, N Wang, X Gao',
    title: 'Granularity-aware hyperbolic representation for text-based person search',
    venue: 'IEEE Transactions on Information Forensics and Security',
    year: 2025,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:OU6Ihb5iCvQC' }],
  },
  {
    authors: 'X Yang, W Dong, G Zheng, N Wang, X Gao',
    title: 'IDENet: an inter-domain equilibrium network for unsupervised cross-domain person re-identification',
    venue: 'IEEE Transactions on Image Processing',
    year: 2025,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:UxriW0iASnsC' }],
  },
  {
    authors: 'X Yang, P Li, Q Zhou, N Wang, X Gao',
    title: 'Dense information learning based semi-supervised object detection',
    venue: 'IEEE Transactions on Image Processing',
    year: 2025,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:b0M2c_1WBrUC' }],
  },
  {
    authors: 'W Dong, X Yang, D Cheng, N Wang, X Gao',
    title: 'Escaping modal interactions: An efficient DESANet for multi-modal object re-identification',
    venue: 'IEEE Transactions on Image Processing',
    year: 2025,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:XiSMed-E-HIC' }],
  },
  {
    authors: 'Songsong Duan, Xi Yang, Nannan Wang',
    title: 'DIH-CLIP: unleashing the diversity of multi-head self-attention for training-free open-vocabulary semantic segmentation',
    venue: 'IEEE/CVF International Conference on Computer Vision (ICCV)',
    year: 2025,
    selected: true,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:eJXPG6dFmWUC' }, { kind: 'code', url: 'https://github.com/duan-song/DiH-CLIP' }],
  },
  {
    authors: 'L Liu, N Wang, C Chen, D Liu, X Yang, X Gao, T Liu',
    title: 'Frequency-based comprehensive prompt learning for vision-language models',
    venue: 'IEEE Transactions on Pattern Analysis and Machine Intelligence',
    year: 2025,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:p2g8aNsByqUC' }],
  },
  {
    authors: 'Y Yang, X Yang, D Yang',
    title: 'Unsupervised domain adaptation for SAR ship detection based on multitask decoupling',
    venue: 'IEEE Journal of Selected Topics in Applied Earth Observations and Remote Sensing',
    year: 2025,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:uWQEDVKXjbEC' }],
  },
  {
    authors: 'D Zhou, H Qu, N Wang, C Peng, Z Ma, X Yang, X Gao',
    title: 'Fooling human detectors via robust and visually natural adversarial patches',
    venue: 'Neurocomputing',
    year: 2025,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:bFI3QPDXJZMC' }],
  },
  {
    authors: 'X Yang, J Sun, S Duan, D Cheng',
    title: 'Dual information purification for lightweight SAR object detection',
    venue: 'Proceedings of the AAAI Conference on Artificial Intelligence',
    year: 2025,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:eflP2zaiRacC' }],
  },
  {
    authors: 'X Yang, J Wang, S Duan',
    title: 'Scale-consistent learnable PnP network for space target pose estimation',
    venue: 'IEEE Transactions on Geoscience and Remote Sensing',
    year: 2025,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:abG-DnoFyZgC' }],
  },
  {
    authors: 'X Yang, H Shi, Z Wang, N Wang, X Gao',
    title: 'CSHNet: A novel information asymmetric image translation method',
    venue: 'IEEE Transactions on Circuits and Systems for Video Technology',
    year: 2025,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:KxtntwgDAa4C' }],
  },
  {
    authors: 'H Li, N Wang, X Yang, X Wang, X Gao',
    title: 'An enhanced adaptive confidence margin for semi-supervised facial expression recognition',
    venue: 'IEEE Transactions on Pattern Analysis and Machine Intelligence',
    year: 2025,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:K3LRdlH-MEoC' }],
  },
  {
    authors: 'M Dai, X Yang, W Dong, N Wang',
    title: 'GAE-Net: A gait-assisted enhancement network for video-based person re-identification',
    venue: 'Neural Networks',
    year: 2025,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:u9iWguZQMMsC' }],
  },
  {
    authors: 'H Zhu, X Yang, N Wang',
    title: 'Optimizing label assignment for weakly supervised person search',
    venue: 'Proceedings of the AAAI Conference on Artificial Intelligence',
    year: 2025,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:BrmTIyaxlBUC' }],
  },
  {
    authors: 'Xi Yang, Wenjiao Dong, Xian Wang, De Cheng, Nannan Wang',
    title: 'FA-Net: a feature alignment network for video-based visible-infrared person re-identification',
    venue: 'IEEE Transactions on Image Processing',
    year: 2025,
    selected: true,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:8AbLer7MMksC' }],
  },
  {
    authors: 'X Yang, Z Zhou, D Yang',
    title: 'SFDN: a novel semantic feature decouple network for fine-grained remote sensing object detection',
    venue: 'IEEE Transactions on Geoscience and Remote Sensing',
    year: 2025,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:geHnlv5EZngC' }],
  },
  {
    authors: 'X Yang, H Shi, Z Li, M Qiao, F Gao, N Wang',
    title: 'S3OIL: Semi-Supervised SAR-to-Optical Image Translation via Multi-Scale and Cross-Set Matching',
    venue: 'IEEE Transactions on Image Processing',
    year: 2025,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:WbkHhVStYXYC' }],
  },
  {
    authors: 'X Yang, Z Zhou, D Yang',
    title: 'Elaborate Feature Decoupling for Weakly Supervised Fine-Grained Object Detection in Remote Sensing Images',
    venue: 'IEEE Transactions on Geoscience and Remote Sensing',
    year: 2025,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:5Ul4iDaHHb8C' }],
  },
  {
    authors: 'X Yang, W Dong, G Zheng, N Wang',
    title: 'Nearest Neighbor Sample Constraint and ODE Guided Feature Reconstruction for Unsupervised Person Re-Identification',
    venue: 'IEEE Transactions on Circuits and Systems for Video Technology',
    year: 2025,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:4fKUyHm3Qg0C' }],
  },
  {
    authors: 'X Yang, P Li, Q Zhou, N Wang, X Gao',
    title: 'Uncertainty quantification for semi-supervised object detection in remote sensing images',
    venue: 'IEEE Transactions on Image Processing',
    year: 2025,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:08ZZubdj9fEC' }],
  },
  {
    authors: 'Jiachen Sun, De Cheng, Xi Yang, Nannan Wang',
    title: 'Dual domain control via active learning for remote sensing domain incremental object detection',
    venue: 'IEEE/CVF International Conference on Computer Vision (ICCV)',
    year: 2025,
    selected: true,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:VOx2b1Wkg3QC' }],
  },
  {
    authors: 'X Yang, X Zhong, D Kong, N Wang',
    title: 'Toward Generalizable Prompt Learning via Multi-Regularization Guided Knowledge Distillation',
    venue: 'IEEE Transactions on Image Processing',
    year: 2025,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:tS2w5q8j5-wC' }],
  },
  {
    authors: 'J Sun, X Yang, D Yang',
    title: 'Elaborate Information Refinement Network for Fine-Grained Object Detection in Remote Sensing Images',
    venue: 'IEEE Transactions on Geoscience and Remote Sensing',
    year: 2025,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:738O_yMBCRsC' }],
  },
  {
    authors: 'X Yang, W Dong, Y Tang, G Zheng, N Wang, X Gao',
    title: 'Condense loss: Exploiting vector magnitude during person Re-identification training process',
    venue: 'Pattern Recognition',
    year: 2025,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:Tiz5es2fbqcC' }],
  },
  {
    authors: 'X Yang, Z Zhou, S Duan, D Yang',
    title: 'SCIR: A Weakly Supervised Contextual Instance Refinement Method for Remote Sensing Object Detection',
    venue: 'IEEE Transactions on Geoscience and Remote Sensing',
    year: 2025,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:sSrBHYA8nusC' }],
  },
  {
    authors: 'X Yang, H Zhou, D Cheng, M Tian, N Wang',
    title: 'Semantic-Interactive Clustering Optimization with SAM for Weakly-Supervised Person Search',
    venue: 'IEEE Transactions on Circuits and Systems for Video Technology',
    year: 2025,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:B3FOqHPlNUQC' }],
  },
  {
    authors: 'J Wang, X Yang',
    title: 'BIH: A novel satellite 3D point cloud generation method',
    venue: 'Journal of Information and Intelligence',
    year: 2025,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:P5F9QuxV20EC' }],
  },
  {
    authors: 'X Yang, W Dong, M Li, Z Wei, N Wang, X Gao',
    title: 'Cooperative separation of modality shared-specific features for visible-infrared person re-identification',
    venue: 'IEEE Transactions on Multimedia',
    year: 2024,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&citation_for_view=W5c-LSYAAAAJ:pqnbT2bcN3wC' }],
  },
  {
    authors: 'X Yang, Z Zeng, D Yang',
    title: 'Adaptive mid-level feature attention learning for fine-grained ship classification in optical remote sensing images',
    venue: 'IEEE Transactions on Geoscience and Remote Sensing',
    year: 2024,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:ldfaerwXgEUC' }],
  },
  {
    authors: 'X Yang, S Zhang, W Yang',
    title: 'Two-way assistant: A knowledge distillation object detection method for remote sensing images',
    venue: 'IEEE Transactions on Geoscience and Remote Sensing',
    year: 2024,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:g5m5HwL7SMYC' }],
  },
  {
    authors: 'X Yang, X Wang, L Liu, N Wang, X Gao',
    title: 'STFE: A comprehensive video-based person re-identification network based on spatio-temporal feature enhancement',
    venue: 'IEEE Transactions on Multimedia',
    year: 2024,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:M05iB0D1s5AC' }],
  },
  {
    authors: 'X Yin, X Yang, L Liu, N Wang, X Gao',
    title: 'Point deformable network with enhanced normal embedding for point cloud analysis',
    venue: 'Proceedings of the AAAI Conference on Artificial Intelligence',
    year: 2024,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:2P1L_qKh6hAC' }],
  },
  {
    authors: 'L Liu, N Wang, D Zhou, D Liu, X Yang, X Gao, T Liu',
    title: 'Generalizable prompt learning via gradient constrained sharpness-aware minimization',
    venue: 'IEEE Transactions on Multimedia',
    year: 2024,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:xtRiw3GOFMkC' }],
  },
  {
    authors: 'Z Wei, X Yang, N Wang, X Gao',
    title: 'Semi-supervised learning with heterogeneous distribution consistency for visible infrared person re-identification',
    venue: 'IEEE Transactions on Image Processing',
    year: 2024,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:ZHo1McVdvXMC' }],
  },
  {
    authors: 'X Yang, M Tian, N Wang, X Gao',
    title: 'Unleashing the feature hierarchy potential: an efficient tri-hybrid person search model',
    venue: 'IEEE Transactions on Circuits and Systems for Video Technology',
    year: 2024,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:rO6llkc54NcC' }],
  },
  {
    authors: 'Z Sheng, X Yang',
    title: 'Information Fusion with Knowledge Distillation for Fine-grained Remote Sensing Object Detection',
    venue: 'ACM Multimedia',
    year: 2024,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:fPk4N6BV_jEC' }],
  },
  {
    authors: 'X Yang, S Duan, N Wang, X Gao',
    title: 'Pro2SAM: Mask Prompt to SAM with Grid Points for Weakly Supervised Object Localization',
    venue: 'ECCV',
    year: 2024,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:cFHS6HbyZ2cC' }],
  },
  {
    authors: 'X Yang, H Liu, D Cheng, N Wang, X Gao',
    title: 'Feature-Level Adversarial Attacks and Ranking Disruption for Visible-Infrared Person Re-identification',
    venue: 'The Thirty-eighth Annual Conference on Neural Information Processing Systems',
    year: 2024,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:_xSYboBqXhAC' }],
  },
  {
    authors: 'D Cheng, Y Lu, L He, S Zhang, X Yang, N Wang, X Gao',
    title: 'Mamba-CL: Optimizing selective state space model in null space for continual learning',
    venue: 'arXiv preprint arXiv:2411.15469',
    year: 2024,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:dshw04ExmUIC' }],
  },
  {
    authors: 'D Kong, X Yang, N Wang, X Gao',
    title: 'Perspectives of calibrated adaptation for few-shot cross-domain classification',
    venue: 'IEEE Transactions on Circuits and Systems for Video Technology',
    year: 2024,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:f2IySw72cVMC' }],
  },
  {
    authors: 'X Yang, D Kong, D Yang, M Wang',
    title: 'Domain-aware generalized meta-learning for space target recognition',
    venue: 'IEEE Transactions on Geoscience and Remote Sensing',
    year: 2024,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:3s1wT3WcHBgC' }],
  },
  {
    authors: 'L Liu, N Wang, D Liu, X Yang, X Gao, T Liu',
    title: 'Towards specific domain prompt learning via improved text label optimization',
    venue: 'IEEE Transactions on Multimedia',
    year: 2024,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:u_35RYKgDlwC' }],
  },
  {
    authors: 'Xi Yang, Xu Gu, Xingyilang Yin, Xinbo Gao',
    title: 'SA3DIP: segment any 3D instance with potential 3D priors',
    venue: 'Conference on Neural Information Processing Systems (NeurIPS)',
    year: 2024,
    selected: true,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:NhqRSupF_l8C' }, { kind: 'code', url: 'https://github.com/ryang41/sa3dip' }],
  },
  {
    authors: 'X Yang, Q Zhou, Z Wei, H Liu, N Wang, X Gao',
    title: 'Elaborate teacher: Improved semi-supervised object detection with rich image exploiting',
    venue: 'IEEE Transactions on Multimedia',
    year: 2024,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:zA6iFVUQeVQC' }],
  },
  {
    authors: 'X Yang, D Kong, R Lin, N Wang, X Gao',
    title: 'Adapting few-shot classification via in-process defense',
    venue: 'IEEE Transactions on Image Processing',
    year: 2024,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:dfsIfKJdRG4C' }],
  },
  {
    authors: 'D Yang, J Wang, X Yang',
    title: '3D point cloud shape generation with collaborative learning of generative adversarial network and auto-encoder',
    venue: 'Remote Sensing',
    year: 2024,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:SeFeTyx0c_EC' }],
  },
  {
    authors: 'X Gu, X Yang, H Liu, D Yang',
    title: 'Adaptive granularity-fused keypoint detection for 6D pose estimation of space targets',
    venue: 'Remote Sensing',
    year: 2024,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:a0OBvERweLwC' }],
  },
  {
    authors: 'X Yang, H Liu, N Wang, X Gao',
    title: 'Image-Level adaptive adversarial ranking for person re-Identification',
    venue: 'IEEE Transactions on Image Processing',
    year: 2024,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:4OULZ7Gr8RgC' }],
  },
  {
    authors: 'Z Wei, X Yang, N Wang, X Gao',
    title: 'Dual-adversarial representation disentanglement for visible infrared person re-identification',
    venue: 'IEEE Transactions on Information Forensics and Security',
    year: 2023,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&citation_for_view=W5c-LSYAAAAJ:35N4QoGY0k4C' }],
  },
  {
    authors: 'H Li, N Wang, X Yang, X Wang, X Gao',
    title: 'Unconstrained facial expression recognition with no-reference de-elements learning',
    venue: 'IEEE Transactions on Affective Computing',
    year: 2023,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:ns9cj8rnVeAC' }],
  },
  {
    authors: 'X Yang, S Zhang, S Duan, W Yang',
    title: 'An effective and lightweight hybrid network for object detection in remote sensing images',
    venue: 'IEEE Transactions on Geoscience and Remote Sensing',
    year: 2023,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:vV6vV6tmYwMC' }],
  },
  {
    authors: 'X Yang, M Tian, M Li, Z Wei, L Yuan, N Wang, X Gao',
    title: 'SSRR: Structural semantic representation reconstruction for visible-infrared person re-identification',
    venue: 'IEEE Transactions on Multimedia',
    year: 2023,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:70eg2SAEIzsC' }],
  },
  {
    authors: 'X Jiang, N Wang, J Xin, K Li, X Yang, J Li, X Wang, X Gao',
    title: 'Fabnet: Frequency-aware binarized network for single image super-resolution',
    venue: 'IEEE Transactions on Image Processing',
    year: 2023,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:HoB7MX3m0LUC' }],
  },
  {
    authors: 'L Liu, X Yang, N Wang, X Gao',
    title: 'Frequency information disentanglement network for video-based person re-identification',
    venue: 'IEEE Transactions on Image Processing',
    year: 2023,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:YFjsv_pBGBYC' }],
  },
  {
    authors: 'X Yang, X Wang, D Yang',
    title: 'Improving cross-modal constraints: Text attribute person search with graph attention networks',
    venue: 'IEEE Transactions on Multimedia',
    year: 2023,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:GnPB-g6toBAC' }],
  },
  {
    authors: 'X Yang, Z Wang, Z Wei, D Yang',
    title: 'Scsp: An unsupervised image-to-image translation network based on semantic cooperative shape perception',
    venue: 'IEEE Transactions on Multimedia',
    year: 2023,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:RYcK_YlVTxYC' }],
  },
  {
    authors: 'Y Yu, X Yang, J Li, X Gao',
    title: 'Task-specific heterogeneous network for object detection in aerial images',
    venue: 'IEEE Transactions on Geoscience and Remote Sensing',
    year: 2023,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:J_g5lzvAfSwC' }],
  },
  {
    authors: 'X Yang, M Cao, C Li, H Zhao, D Yang',
    title: 'Learning implicit neural representation for satellite object mesh reconstruction',
    venue: 'Remote Sensing',
    year: 2023,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:O3NaXMp0MMsC' }],
  },
  {
    authors: 'X Yang, X Wang, N Wang, X Gao',
    title: 'Address the unseen relationships: Attribute correlations in text attribute person search',
    venue: 'IEEE Transactions on Neural Networks and Learning Systems',
    year: 2023,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:BqipwSGYUEgC' }],
  },
  {
    authors: 'Y Yu, X Yang, J Li, X Gao',
    title: 'A refined hybrid network for object detection in aerial images',
    venue: 'IEEE Transactions on Geoscience and Remote Sensing',
    year: 2023,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:NaGl4SEjCO4C' }],
  },
  {
    authors: 'X Yang, D Kong, R Lin, D Yang',
    title: 'Generalizing spacecraft recognition via diversifying few-shot datasets in a joint trained likelihood',
    venue: 'Remote Sensing',
    year: 2023,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:RGFaLdJalmkC' }],
  },
  {
    authors: 'X Yang, H Zhu, H Zhao, D Yang',
    title: 'Coastal ship tracking with memory-guided perceptual network',
    venue: 'Remote Sensing',
    year: 2023,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:NMxIlDl6LWMC' }],
  },
  {
    authors: 'L Liu, N Wang, D Zhou, X Gao, D Liu, X Yang, T Liu',
    title: 'Gradient constrained sharpness-aware prompt learning for vision-language models',
    venue: 'arXiv preprint arXiv:2309.07866',
    year: 2023,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:yD5IFk8b50cC' }],
  },
  {
    authors: '魏梓钰， 杨曦， 王楠楠， 杨东， 高新波',
    title: '互惠双向生成对抗网络用于跨模态行人重识别',
    venue: '西安电子科技大学学报',
    year: 2023,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:r0BpntZqJG4C' }],
  },
  {
    authors: 'H Li, N Wang, X Yang, X Wang, X Gao',
    title: 'Towards semi-supervised deep facial expression recognition with an adaptive confidence margin',
    venue: 'IEEE/CVF Conference on Computer Vision and Pattern Recognition',
    year: 2022,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&citation_for_view=W5c-LSYAAAAJ:bEWYMUwI8FkC' }],
  },
  {
    authors: 'X Yang, J Zhao, Z Wei, N Wang, X Gao',
    title: 'SAR-to-optical image translation based on improved CGAN',
    venue: 'Pattern Recognition',
    year: 2022,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&citation_for_view=W5c-LSYAAAAJ:-f6ydRqryjwC' }],
  },
  {
    authors: 'X Yang, Z Wang, J Zhao, D Yang',
    title: 'FG-GAN: A fine-grained generative adversarial network for unsupervised SAR-to-optical image translation',
    venue: 'IEEE Transactions on Geoscience and Remote Sensing',
    year: 2022,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&citation_for_view=W5c-LSYAAAAJ:_Qo2XoVZTnwC' }],
  },
  {
    authors: 'H Li, N Wang, X Yang, X Gao',
    title: 'Crs-cont: a well-trained general encoder for facial expression analysis',
    venue: 'IEEE Transactions on Image Processing',
    year: 2022,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:maZDTaKrznsC' }],
  },
  {
    authors: 'Y Yu, X Yang, J Li, X Gao',
    title: 'Object detection for aerial images with feature enhancement and soft label assignment',
    venue: 'IEEE Transactions on Geoscience and Remote Sensing',
    year: 2022,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:RHpTSmoSYBkC' }],
  },
  {
    authors: 'X Yang, J Zhang, C Chen, D Yang',
    title: 'An efficient and lightweight CNN model with soft quantification for ship detection in SAR images',
    venue: 'IEEE Transactions on Geoscience and Remote Sensing',
    year: 2022,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:k_IJM867U9cC' }],
  },
  {
    authors: 'Z Wei, X Yang, N Wang, X Gao',
    title: 'RBDF: Reciprocal bidirectional framework for visible infrared person reidentification',
    venue: 'IEEE Transactions on Cybernetics',
    year: 2022,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:M3NEmzRMIkIC' }],
  },
  {
    authors: 'Z Gong, N Wang, D Cheng, X Jiang, J Xin, X Yang, X Gao',
    title: 'Learning deep resonant prior for hyperspectral image super-resolution',
    venue: 'IEEE Transactions on Geoscience and Remote Sensing',
    year: 2022,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:JV2RwH3_ST0C' }],
  },
  {
    authors: 'X Jiang, N Wang, J Xin, K Li, X Yang, J Li, X Gao',
    title: 'Toward pixel-level precision for binary super-resolution with mixed binary representation',
    venue: 'IEEE Transactions on Neural Networks and Learning Systems',
    year: 2022,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:blknAaTinKkC' }],
  },
  {
    authors: 'X Zhang, X Yang, D Yang, F Wang, X Gao',
    title: 'A universal ship detection method with domain-invariant representations',
    venue: 'IEEE Transactions on Geoscience and Remote Sensing',
    year: 2022,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=20&pagesize=80&citation_for_view=W5c-LSYAAAAJ:hMod-77fHWUC' }],
  },
  {
    authors: '杨曦， 张鑫， 郭浩远， 王楠楠， 高新波',
    title: '基于不变特征的多源遥感图像舰船目标检测算法',
    venue: '电子学报',
    year: 2022,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:4JMBOYKVnBMC' }],
  },
  {
    authors: '梁昌城， 王楠楠， 朱明瑞， 杨曦， 李洁， 高新波',
    title: '基于多尺度特征融合的人脸照片-素描合成',
    venue: '中国科学: 信息科学',
    year: 2022,
    links: [{ kind: 'scholar', url: 'https://scholar.google.com/citations?view_op=view_citation&hl=zh-CN&user=W5c-LSYAAAAJ&cstart=100&pagesize=100&citation_for_view=W5c-LSYAAAAJ:iH-uZ7U-co4C' }],
  },
];

/* ─────────────────────────── 工具函数 ─────────────────────────── */

/** 按年份倒序分组，年份内保持原顺序 */
export function groupByYear(items: Publication[] = publications): Array<{ year: number; items: Publication[] }> {
  const byYear = new Map<number, Publication[]>();
  for (const p of items) {
    if (!byYear.has(p.year)) byYear.set(p.year, []);
    byYear.get(p.year)!.push(p);
  }
  return [...byYear.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, list]) => ({ year, items: list }));
}

/** 代表性论文，按年份倒序 */
export function selectedPublications(limit?: number): Publication[] {
  const list = publications.filter((p) => p.selected).sort((a, b) => b.year - a.year);
  return typeof limit === 'number' ? list.slice(0, limit) : list;
}

/** 全部论文按年份倒序（扁平） */
export function allSorted(): Publication[] {
  return [...publications].sort((a, b) => b.year - a.year);
}