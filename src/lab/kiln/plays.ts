export type PlayId =
  | 'roster'
  | 'inbound'
  | 'score'
  | 'outreach'
  | 'complete'
  | 'ads'
  | 'boost'

export type DemoRow = {
  name: string
  role: string
  company: string
  signal: string
  owner: string
}

export type Play = {
  id: PlayId
  label: string
  kicker: string
  headline: string
  body: string
  rows: DemoRow[]
}

export type Chip = {
  id: string
  label: string
  play: PlayId
  resultKind: 'people' | 'craft'
}

export const PLAYS: Play[] = [
  {
    id: 'roster',
    label: '找名单',
    kicker: 'Play 01',
    headline: '把散落的目标人，收成一张能筛的表。',
    body: '用条件拼出一份名单，而不是在十个工具之间来回复制。',
    rows: [
      { name: '林知夏', role: '财务总监', company: '北港仪器', signal: '100–500 人', owner: '待分配' },
      { name: '陈屿', role: '会计主管', company: '潮声零售', signal: '英 / 中', owner: '待分配' },
      { name: '韩澄', role: '结算经理', company: '石梁物流', signal: '新开岗位', owner: '待分配' },
    ],
  },
  {
    id: 'inbound',
    label: '自动分发',
    kicker: 'Play 02',
    headline: '线索进来后，按规则立刻落到负责人。',
    body: '表单、预约、回访同一张表，几分钟内改负责人，而不是丢进群里等人认领。',
    rows: [
      { name: '江牧野', role: '增长负责人', company: '青石实验室', signal: '官网表单 · 4 分钟', owner: '何清越' },
      { name: '苏晚晴', role: '运营总监', company: '南岛货运', signal: '演示预约 · 2 分钟', owner: '赵川' },
      { name: '顾南星', role: '产品经理', company: '麦序软件', signal: '文档下载 · 6 分钟', owner: '何清越' },
    ],
  },
  {
    id: 'score',
    label: '打分',
    kicker: 'Play 03',
    headline: '先给线索排个序，再决定谁值得立刻跟。',
    body: '意向、岗位、公司规模叠成一个分数，高分往前排。',
    rows: [
      { name: '裴秋白', role: '市场副总裁', company: '镜湾咨询', signal: '92 分', owner: '赵川' },
      { name: '任疏影', role: '销售总监', company: '木野医疗', signal: '88 分', owner: '何清越' },
      { name: '方既见', role: '增长经理', company: '灯塔出行', signal: '81 分', owner: '沈予' },
    ],
  },
  {
    id: 'outreach',
    label: '触达',
    kicker: 'Play 04',
    headline: '在对的时间点，把对的人推到触达队列。',
    body: '岗位变动、招聘信号和回访记录共用一条触达节奏。',
    rows: [
      { name: '叶迟', role: '客户成功', company: '霜叶数据', signal: '本周入职', owner: '沈予' },
      { name: '唐小满', role: '采购经理', company: '赤岗制造', signal: '连续打开邮件', owner: '赵川' },
      { name: '梁河', role: '渠道负责', company: '东风学堂', signal: '招聘增长岗', owner: '何清越' },
    ],
  },
  {
    id: 'complete',
    label: '补全',
    kicker: 'Play 05',
    headline: '缺邮箱、缺职位的行，先补齐再往下走。',
    body: '同一行可以连续补字段，不把半成品档案丢给下一个人。',
    rows: [
      { name: '吴青桐', role: '品牌经理', company: '拾光传媒', signal: '邮箱已补', owner: '沈予' },
      { name: '蔡北冥', role: '研发主管', company: '泊湾芯片', signal: '直拨已补', owner: '何清越' },
      { name: '尹初雪', role: 'HRBP', company: '山南集团', signal: '城市已补', owner: '赵川' },
    ],
  },
  {
    id: 'ads',
    label: '投放',
    kicker: 'Play 06',
    headline: '把高分名单同步成可投放的受众包。',
    body: '名单、排除规则和平台受众在同一处改，避免各端各做一份。',
    rows: [
      { name: '高分财务包', role: '受众', company: 'LinkedIn', signal: '1,240 人', owner: '沈予' },
      { name: '演示未成单', role: '排除', company: 'Meta', signal: '86 人', owner: '赵川' },
      { name: '招聘增长信号', role: '受众', company: 'Google', signal: '540 人', owner: '何清越' },
    ],
  },
  {
    id: 'boost',
    label: '提效',
    kicker: 'Play 07',
    headline: '把重复调研从跟进人手里拿出来。',
    body: '会前摘要、竞品备注和上次沟通纪要先垫在行上。',
    rows: [
      { name: '何清越', role: '跟进人', company: '本页演示', signal: '会前摘要 12 份', owner: '系统' },
      { name: '赵川', role: '跟进人', company: '本页演示', signal: '竞品备注 7 份', owner: '系统' },
      { name: '沈予', role: '跟进人', company: '本页演示', signal: '纪要回填 9 份', owner: '系统' },
    ],
  },
]

export const CHIPS: Chip[] = [
  {
    id: 'owners',
    label: '列出自动分发里的负责人',
    play: 'inbound',
    resultKind: 'people',
  },
  {
    id: 'scores',
    label: '找出打分最高的三条线索',
    play: 'score',
    resultKind: 'people',
  },
  {
    id: 'craft',
    label: '这个页面用了哪些滚动技法',
    play: 'inbound',
    resultKind: 'craft',
  },
]

export const CRAFT_ROWS: DemoRow[] = [
  {
    name: 'Hero 滚球',
    role: 'SMIL 轨道',
    company: 'SVG 装置',
    signal: '循环路径',
    owner: '首屏就画',
  },
  {
    name: 'Play Tab',
    role: 'URL 状态',
    company: '?play=',
    signal: '深底选中',
    owner: 'replaceState',
  },
  {
    name: 'Prompt 出表',
    role: 'button 提交',
    company: '禁止 GET 跳走',
    signal: '芯片即提交',
    owner: '本地表',
  },
  {
    name: '球池',
    role: 'CSS 漂移',
    company: 'HTML 播种',
    signal: '容器裁切',
    owner: '无后插入',
  },
]

export function isPlayId(value: string | null): value is PlayId {
  return PLAYS.some((play) => play.id === value)
}

export function findPlay(id: PlayId): Play {
  return PLAYS.find((play) => play.id === id) ?? PLAYS[0]
}

export function matchChip(query: string): Chip | undefined {
  const normalized = query.trim()
  return CHIPS.find((chip) => chip.label === normalized)
}

export function readKilnState(): {
  playId: PlayId
  query: string
  tableOpen: boolean
} {
  if (typeof window === 'undefined') {
    return { playId: 'roster', query: '', tableOpen: false }
  }

  const params = new URLSearchParams(window.location.search)
  const rawPlay = params.get('play')
  const playId = isPlayId(rawPlay) ? rawPlay : 'roster'
  const query = params.get('q')?.trim() ?? ''
  return { playId, query, tableOpen: query.length > 0 }
}

export function writeKilnState(playId: PlayId, query: string) {
  const url = new URL(window.location.href)
  url.searchParams.set('play', playId)
  if (query) url.searchParams.set('q', query)
  else url.searchParams.delete('q')
  history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
}
