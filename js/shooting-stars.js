// /source/js/shooting-stars.js
// 一个轻量的全屏 Canvas 流星动画，适配暗色星空与粒子背景。
// 不依赖第三方库，可随时启停。对性能做了节流与回退。

(function () {
  const dpr = Math.min(2, window.devicePixelRatio || 1);

  // 创建全屏 Canvas，位于最底层（低于内容，高于 ribbon）
  const canvas = document.createElement('canvas');
  canvas.id = 'shooting-stars';
  Object.assign(canvas.style, {
    position: 'fixed',
    left: 0,
    top: 0,
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: -1
  });
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let W, H, rafId, stars = [], meteors = [], lastTime = 0;

  function resize() {
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  // 星星（微闪烁）
  const STAR_COUNT = 100;
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.2 + 0.2,
      a: Math.random() * Math.PI * 2,
      s: Math.random() * 0.02 + 0.005
    });
  }

  // 生成流星
  function spawnMeteor() {
    const fromTop = Math.random() < 0.5;
    const startX = Math.random() * W * 0.7 + W * 0.15; // 让流星大多从中间偏右出现
    const startY = fromTop ? -20 : (Math.random() * H * 0.3);
    const speed = Math.random() * 6 + 6;     // 像素/帧
    const len = Math.random() * 180 + 120;   // 尾巴长度
    const angle = (Math.random() * -0.35 - 0.55) * Math.PI; // 左下斜飞
    meteors.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      len,
      life: 0,
      maxLife: Math.random() * 60 + 60,
      glow: Math.random() * 0.6 + 0.7
    });
  }

  // 控制出现频率（每 1.5～3.5 秒一颗）
  function scheduleMeteor() {
    spawnMeteor();
    const t = Math.random() * 2000 + 1500;
    setTimeout(scheduleMeteor, t);
  }
  scheduleMeteor();

  // 绘制一个流星
  function drawMeteor(m) {
    const tx = m.x, ty = m.y;
    const tailX = tx - m.vx * m.len / 10;
    const tailY = ty - m.vy * m.len / 10;

    const grad = ctx.createLinearGradient(tx, ty, tailX, tailY);
    grad.addColorStop(0, `rgba(135,166,255,${0.95 * m.glow})`); // 赛博蓝
    grad.addColorStop(1, 'rgba(135,166,255,0)');

    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();

    // 流星头部
    ctx.beginPath();
    ctx.fillStyle = `rgba(200,220,255,${0.8 * m.glow})`;
    ctx.arc(tx, ty, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // 主循环（带轻量拖影）
  function loop(ts) {
    const dt = Math.min(32, ts - lastTime || 16);
    lastTime = ts;

    // 背景轻微透明清屏，制造拖影
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, 0, W, H);

    // 星星闪烁
    for (const s of stars) {
      s.a += s.s;
      const alpha = 0.3 + Math.abs(Math.sin(s.a)) * 0.7;
      ctx.fillStyle = `rgba(200,220,255,${alpha})`;
      ctx.fillRect(s.x, s.y, s.r, s.r);
    }

    // 更新 & 绘制流星
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += m.vx;
      m.y += m.vy;
      m.life++;
      drawMeteor(m);
      if (m.life > m.maxLife || m.x < -50 || m.y > H + 50) {
        meteors.splice(i, 1);
      }
    }

    rafId = requestAnimationFrame(loop);
  }

  // 性能保护：页面不可见时暂停
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      lastTime = performance.now();
      rafId = requestAnimationFrame(loop);
    }
  });

  // 初始清屏 & 开始
  ctx.fillStyle = 'rgba(0,0,0,1)';
  ctx.fillRect(0, 0, W, H);
  rafId = requestAnimationFrame(loop);
})();
