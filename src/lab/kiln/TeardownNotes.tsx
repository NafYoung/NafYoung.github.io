const ROWS = [
  {
    layer: '站点骨架',
    origin: 'Webflow 页面 + 自定义脚本',
    here: 'Vite 多页入口，和 /inspired 同一套接法',
  },
  {
    layer: 'Hero 主视觉',
    origin: '定格黏土动画导出成循环视频',
    here: '自制 SVG 装置 + SMIL 滚球',
  },
  {
    layer: '滚动与动效',
    origin: 'GSAP / Rive 绑定滚动',
    here: 'CSS 动画；减动效时轨道球停在静止点',
  },
  {
    layer: 'Tab 与 Prompt',
    origin: '客户端状态，容易被 hydration / 表单 GET 带走',
    here: 'button 提交 + ?play= / ?q=，表在本页展开',
  },
  {
    layer: '球池',
    origin: '按运行时尺寸播种，首屏可能是空的',
    here: '模块里预先生成球体，HTML 直接渲染',
  },
  {
    layer: '内容',
    origin: '客户墙、产品文案、黏土成片',
    here: '全部自制，不引用 Clay 的 LOGO 与评语',
  },
]

export function TeardownNotes() {
  return (
    <section className="kiln-section kiln-notes" id="notes">
      <div className="kiln-section-copy">
        <p className="kiln-kicker">拆解</p>
        <h2>原站怎么做，本页用什么代替</h2>
        <p>
          对照的是技法，不是品牌。clay.com 的成片、客户墙和文案都不进这个仓库。
        </p>
      </div>

      <div className="kiln-table-wrap">
        <table className="kiln-table kiln-table-notes">
          <caption className="kiln-sr">原站与本页技法对照</caption>
          <thead>
            <tr>
              <th>层</th>
              <th>clay.com</th>
              <th>Kiln 本页</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.layer}>
                <td>{row.layer}</td>
                <td>{row.origin}</td>
                <td>{row.here}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
