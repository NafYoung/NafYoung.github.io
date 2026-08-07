import type { SiteContent } from '../types/content'

export const siteContent: SiteContent = {
  profile: {
    displayName: '邵扬帆',
    englishName: 'NafYoung',
    role: 'AI-native 的运营 / 产品型实践者',
    headline: '把零散信息、AI 工具和执行流程，串成真正能跑起来的作品与方案。',
    summary:
      '我更关心一件事能不能从“想法”走到“可持续执行”。无论是内容监测、地图式产品还是英语学习工具，我都习惯先拆问题，再把流程、体验和细节补成闭环。',
    status: '上海大学数字经济硕士在读',
    location: '上海 / Shanghai',
    mission: '当前在持续把 AI、运营执行与产品表达，磨成更完整的个人品牌组合。',
    badges: ['AI workflow', '运营执行', '产品化表达'],
    proofPoints: [
      {
        label: '独立项目',
        value: '3+',
        detail: '把想法推进到可展示、可复盘的作品',
      },
      {
        label: '运营实习',
        value: '1 段',
        detail: '真实参与报名、排期、社群与数据整理',
      },
      {
        label: '关键词',
        value: 'AI × 内容 × 产品',
        detail: '用工具链和表达方式连接执行闭环',
      },
    ],
  },
  heroSlides: [
    {
      prompt: '把分散公众号信息，自动收成每日摘要',
      title: '内容监测',
      accent: '#5eead4',
      gradient:
        'radial-gradient(88.89% 182.5% at 69.13% 5.25%, #1375c8 0%, #157acd 28.99%, #0c3560 72.78%, #060c20 100%)',
      video: '/media/hero1.mp4',
      poster: '/media/hero1.jpg',
    },
    {
      prompt: '用地图把红色景点串成可探索路线',
      title: '地图产品',
      accent: '#7dd3fc',
      gradient:
        'radial-gradient(90% 170% at 62% 12%, #1d4ed8 0%, #0f3a6b 30%, #0a1f3d 70%, #050b18 100%)',
      video: '/media/hero2.mp4',
      poster: '/media/hero2.jpg',
    },
    {
      prompt: '把阅读听力口语写作，收成一个学习台',
      title: '学习工具',
      accent: '#67e8f9',
      gradient:
        'radial-gradient(85% 175% at 75% 5%, #0e7490 0%, #155e75 28%, #0c2744 72%, #060c20 100%)',
      video: '/media/hero3.mp4',
      poster: '/media/hero3.jpg',
    },
  ],
  traits: [
    {
      title: '结构化思考',
      englishLabel: 'Think in systems',
      description:
        '面对模糊任务时，我习惯先把目标、限制和关键动作拆出来，再决定怎么推进，而不是直接堆工具。',
      video: '/media/feat1.mp4',
      poster: '/media/feat1.jpg',
      tone: 'linear-gradient(145deg, #38bdf8 0%, #1d4ed8 45%, #0b1224 100%)',
    },
    {
      title: '执行闭环意识',
      englishLabel: 'Close the loop',
      description:
        '我关注的不只是“做出来”，还包括去重、容错、状态记录、后续维护这些让项目能持续跑下去的部分。',
      video: '/media/feat2.mp4',
      poster: '/media/feat2.jpg',
      tone: 'linear-gradient(145deg, #22d3ee 0%, #0e7490 42%, #082f49 100%)',
    },
    {
      title: 'AI 工具迁移能力',
      englishLabel: 'AI-native builder',
      description:
        'ChatGPT、Codex、Claude Code 这类工具对我来说不是展示项，而是帮助我提炼信息、拆工作流和补齐执行效率的基础能力。',
      video: '/media/feat3.mp4',
      poster: '/media/feat3.jpg',
      tone: 'linear-gradient(145deg, #7dd3fc 0%, #0369a1 48%, #020617 100%)',
    },
  ],
  projects: [
    {
      title: '文旅公众号日报自动化系统',
      year: '独立开发',
      tags: ['Node.js', 'Playwright', 'GitHub Actions', 'LLM'],
      summary: '把文旅信息监测从人工盯源改造成可持续运行的内容 workflow。',
      challenge:
        '文旅信息分散在多个公众号与来源里，人工筛选、整理和生成日报非常耗时，也容易漏掉关键更新。',
      build:
        '围绕文章发现、正文抓取、AI 摘要、日报生成和邮件分发搭建自动化链路，并补齐发现源双模式、去重、状态记录、失败兜底和定时执行。',
      outcome:
        '把重复性的内容运营工作改造成可持续执行的 workflow，让信息监测从“人盯人”变成“系统跑系统”。',
      proofPoints: ['发现源双模式', 'AI 摘要与日报生成', '状态记录与失败兜底'],
      href: 'https://github.com/NafYoung/auto-tool',
      tone: 'linear-gradient(145deg, #0ea5e9 0%, #0369a1 45%, #0f172a 100%)',
      poster: '/media/feat1.jpg',
    },
    {
      title: '上海红色景点可视化 App',
      year: '独立开发',
      tags: ['地图产品', '内容展示', '移动端适配'],
      summary: '把分散景点内容组织成可浏览、可筛选、可分享的地图式产品体验。',
      challenge:
        '红色景点内容通常分散且缺乏组织，用户很难在浏览、筛选和路线规划之间获得流畅体验。',
      build:
        '设计地图式内容展示结构，支持景点标注、搜索筛选、路线推荐、时间线浏览与景点卡片联动，并补充海报分享、路线摘要和桌面端/移动端适配。',
      outcome:
        '把静态信息做成更有传播力和探索感的产品体验，同时通过缓存、回退和可访问性优化强化实际可用性。',
      proofPoints: ['地图标注与筛选', '路线推荐与时间线', '移动端与桌面端适配'],
      href: 'https://nafyoung.github.io/shanghai-red-landmarks-app/',
      tone: 'linear-gradient(145deg, #38bdf8 0%, #1d4ed8 42%, #0b1224 100%)',
      poster: '/media/feat2.jpg',
    },
    {
      title: '英语阅读助手桌面应用',
      year: '独立开发',
      tags: ['桌面应用', '学习工具', 'LLM 配置'],
      summary: '把阅读、听力、口语、写作和复习节奏整合成一个个人学习台。',
      challenge:
        '英语学习过程经常被阅读、听力、口语、写作四类需求割裂，学习记录和复习节奏也不够连续。',
      build:
        '围绕阅读、听力、口语、写作四模块搭建桌面应用，支持原文导入、词句拆解、写作练习、D1/D3/D7 复习、本地进度持久化与 LLM 接口配置。',
      outcome:
        '把分散的学习动作整合成一个更完整的个人学习台，也体现了我从需求梳理到封装落地的执行能力。',
      proofPoints: ['四模块学习流', 'D1/D3/D7 复习', '本地进度与 LLM 配置'],
      href: 'https://github.com/NafYoung/english-reading-assistant',
      tone: 'linear-gradient(145deg, #22d3ee 0%, #0e7490 40%, #082f49 100%)',
      poster: '/media/feat3.jpg',
    },
  ],
  workflow: [
    {
      step: '01',
      title: '先拆问题，再搭流程',
      description:
        '我会先确认目标、使用场景和阻塞点，避免在问题还没看清楚时就急着选工具或堆功能。',
    },
    {
      step: '02',
      title: '先做可运行版本，再补细节与容错',
      description:
        '我偏好先把主链路跑通，然后再把去重、失败回退、状态记录、适配体验这些稳定性细节往上加。',
    },
    {
      step: '03',
      title: '工具为目标服务，不为炫技服务',
      description:
        '无论是 AI、脚本自动化还是产品交互，我都更看重它是否真的减少重复劳动、提高信息组织效率和体验质量。',
    },
  ],
  timeline: [
    {
      period: '2025.09 - 2027.06',
      title: '上海大学',
      subtitle: '数字经济｜硕士在读',
      description:
        '持续把数字经济视角、数据方法和 AI 工具实践组合起来，目标不是停留在概念理解，而是沉淀可展示的项目成果。',
      poster: '/media/hero1.jpg',
    },
    {
      period: '2025.06 - 2025.10',
      title: '上海微电子产业学院',
      subtitle: '数字化运营实习生',
      description:
        '参与报名审核、信息整理、课程排期、社群支持和线上会议协助，用结构化表格与 Excel 清洗统计支撑项目执行。',
      poster: '/media/hero2.jpg',
    },
    {
      period: '2021.09 - 2025.06',
      title: '上海海洋大学',
      subtitle: '市场营销｜本科',
      description:
        '建立了对用户、传播与表达的基础理解，也让我更倾向于把内容、运营与产品体验放在一起看待。',
      poster: '/media/hero3.jpg',
    },
  ],
  contact: {
    githubLabel: 'GitHub / NafYoung',
    githubUrl: 'https://github.com/NafYoung',
    email: '2807434405@qq.com',
    note: '欢迎聊 AI 应用运营、内容 workflow、产品表达或任何值得被做成闭环的点子。',
  },
}
