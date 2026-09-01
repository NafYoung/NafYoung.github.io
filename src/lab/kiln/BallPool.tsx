const PALETTE = [
  '#e07a5f',
  '#f2cc8f',
  '#81b29a',
  '#3d5a80',
  '#f4a261',
  '#e9c46a',
  '#2a9d8f',
  '#e76f51',
  '#7eb8da',
  '#d4a373',
]

type PoolBall = {
  id: number
  x: number
  y: number
  size: number
  color: string
  dur: number
  delay: number
  dx: number
  dy: number
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makePoolBalls(count = 56): PoolBall[] {
  const rand = mulberry32(20260901)
  return Array.from({ length: count }, (_, id) => ({
    id,
    x: rand() * 90 + 3,
    y: rand() * 72 + 10,
    size: 38 + rand() * 48,
    color: PALETTE[id % PALETTE.length],
    dur: 4.2 + rand() * 5.2,
    delay: -rand() * 7,
    dx: (rand() - 0.5) * 32,
    dy: (rand() - 0.5) * 26,
  }))
}

const POOL_BALLS = makePoolBalls()

export function BallPool() {
  return (
    <section className="kiln-section" id="pool">
      <div className="kiln-section-copy">
        <p className="kiln-kicker">Ball pool</p>
        <h2>球要大、要够、第一眼就在</h2>
        <p>
          球在首屏 HTML 里就已经画好，按容器宽度用 CSS 显隐，不靠
          JavaScript 后插入。颜色和尺寸都加大，避免「几乎看不见」。
        </p>
      </div>

      <div className="kiln-pool" aria-hidden="true">
        {POOL_BALLS.map((ball) => (
          <span
            className="kiln-pool-ball"
            key={ball.id}
            style={{
              left: `${ball.x}%`,
              top: `${ball.y}%`,
              width: ball.size,
              height: ball.size,
              background: ball.color,
              animationDuration: `${ball.dur}s`,
              animationDelay: `${ball.delay}s`,
              ['--dx' as string]: `${ball.dx}px`,
              ['--dy' as string]: `${ball.dy}px`,
            }}
          />
        ))}
      </div>
    </section>
  )
}
