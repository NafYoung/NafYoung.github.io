const TRACKS = [
  {
    id: 'main',
    path: 'M 92 168 C 148 168 168 230 214 286 C 268 352 348 392 452 404 C 572 418 676 360 776 328 C 868 300 956 332 1048 392',
    color: '#e07a5f',
    r: 22,
    dur: '9.2s',
    delay: '0s',
    rest: { x: 776, y: 328 },
  },
  {
    id: 'shelf',
    path: 'M 70 96 H 310 C 342 96 356 128 336 154 C 300 198 244 214 196 206',
    color: '#3d5a80',
    r: 18,
    dur: '7.4s',
    delay: '-1.6s',
    rest: { x: 310, y: 96 },
  },
  {
    id: 'loop',
    path: 'M 628 214 C 704 146 812 168 828 254 C 844 344 748 382 684 330 C 636 292 648 230 712 214 C 768 202 804 236 804 236',
    color: '#e9c46a',
    r: 21,
    dur: '8.6s',
    delay: '-3.1s',
    rest: { x: 748, y: 250 },
  },
  {
    id: 'hill',
    path: 'M 40 428 Q 210 318 390 428 T 760 428 T 1088 446',
    color: '#2a9d8f',
    r: 24,
    dur: '11s',
    delay: '-2.4s',
    rest: { x: 390, y: 428 },
  },
  {
    id: 'drop',
    path: 'M 980 86 C 980 148 940 188 880 206 C 820 224 790 268 818 318 C 852 376 930 390 1008 364',
    color: '#f4a261',
    r: 19,
    dur: '6.8s',
    delay: '-0.8s',
    rest: { x: 880, y: 206 },
  },
  {
    id: 'bowl',
    path: 'M 430 86 C 470 126 486 186 470 240 C 452 300 390 332 338 314 C 286 296 274 236 304 196',
    color: '#81b29a',
    r: 17,
    dur: '7.8s',
    delay: '-4.2s',
    rest: { x: 470, y: 240 },
  },
] as const

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function HeroContraption() {
  const reduceMotion = prefersReducedMotion()

  return (
    <section className="kiln-hero" id="stage">
      <div className="kiln-hero-copy">
        <p className="kiln-kicker">Kiln · 技法习作</p>
        <h1>拆开一个会动的首页</h1>
        <p className="kiln-lede">
          黏土风装置、Play Tab、自然语言入口和球池。用自制资产还原交互，并写清
          clay.com 2026 首页真正怎么做。
        </p>
        <div className="kiln-hero-actions">
          <a className="kiln-btn kiln-btn-solid" href="#plays">
            看还原
          </a>
          <a className="kiln-btn kiln-btn-ghost" href="#notes">
            读拆解
          </a>
        </div>
      </div>

      <div className="kiln-stage" aria-hidden="true">
        <svg className="kiln-rig" viewBox="0 0 1100 520" role="img">
          <defs>
            <linearGradient id="kilnSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c9e3f2" />
              <stop offset="55%" stopColor="#efe4cf" />
              <stop offset="100%" stopColor="#f3ead8" />
            </linearGradient>
            <linearGradient id="kilnHillA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8fb89a" />
              <stop offset="100%" stopColor="#5f8f72" />
            </linearGradient>
            <linearGradient id="kilnHillB" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f0c987" />
              <stop offset="100%" stopColor="#d7a45a" />
            </linearGradient>
          </defs>

          <rect width="1100" height="520" rx="36" fill="url(#kilnSky)" />
          <circle cx="930" cy="86" r="38" fill="#f8e7b0" />
          <circle cx="930" cy="86" r="26" fill="#fff6d4" />

          <path
            d="M -20 430 C 140 340 260 360 390 430 C 500 490 620 470 760 430 C 900 386 1020 410 1120 460 V 520 H -20 Z"
            fill="url(#kilnHillA)"
          />
          <path
            d="M -20 470 C 180 410 340 430 500 470 C 660 512 860 490 1120 500 V 520 H -20 Z"
            fill="url(#kilnHillB)"
          />

          <rect x="56" y="248" width="92" height="86" rx="16" fill="#c26d4f" />
          <rect x="78" y="214" width="48" height="42" rx="10" fill="#a3533a" />
          <rect x="94" y="176" width="16" height="42" rx="8" fill="#7a3e2d" />
          <circle cx="102" cy="168" r="10" fill="#e07a5f" />

          <path
            d="M 128 96 C 176 96 188 150 164 188 C 148 214 118 214 104 188 C 82 148 92 96 128 96 Z"
            fill="#d98b63"
          />
          <ellipse cx="128" cy="102" rx="44" ry="16" fill="#f0b27a" />

          <path
            d="M 92 168 C 148 168 168 230 214 286 C 268 352 348 392 452 404 C 572 418 676 360 776 328 C 868 300 956 332 1048 392"
            fill="none"
            stroke="#c4a574"
            strokeWidth="22"
            strokeLinecap="round"
          />
          <path
            d="M 70 96 H 310 C 342 96 356 128 336 154"
            fill="none"
            stroke="#b08968"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d="M 628 214 C 704 146 812 168 828 254 C 844 344 748 382 684 330 C 636 292 648 230 712 214"
            fill="none"
            stroke="#c4a574"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <rect
            x="734"
            y="300"
            width="168"
            height="44"
            rx="22"
            fill="#d7b48a"
          />
          <ellipse cx="1008" cy="400" rx="64" ry="28" fill="#e07a5f" />
          <ellipse cx="1008" cy="392" rx="44" ry="16" fill="#f4a261" />

          {TRACKS.map((track) =>
            reduceMotion ? (
              <circle
                key={track.id}
                cx={track.rest.x}
                cy={track.rest.y}
                r={track.r}
                fill={track.color}
                stroke="#fff6ea"
                strokeWidth="4"
                style={{ filter: 'drop-shadow(0 4px 3px rgba(28, 22, 18, 0.28))' }}
              />
            ) : (
              <circle
                key={track.id}
                r={track.r}
                fill={track.color}
                stroke="#fff6ea"
                strokeWidth="4"
                style={{ filter: 'drop-shadow(0 4px 3px rgba(28, 22, 18, 0.28))' }}
              >
                <animateMotion
                  dur={track.dur}
                  begin={track.delay}
                  repeatCount="indefinite"
                  path={track.path}
                  rotate="0"
                />
              </circle>
            ),
          )}
        </svg>
      </div>
    </section>
  )
}
