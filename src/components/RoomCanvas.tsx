import { useEffect, useRef } from 'react';
import './RoomCanvas.css';

export interface Person {
  _id: string;
  name: string;
  photoUrl?: string | null;
}

interface Props {
  people: Person[];
}

type Sprite = {
  _id: string;
  name: string;
  photoUrl?: string | null;
  img?: HTMLImageElement; // preloaded once photoUrl is set
  // physics
  x: number;
  y: number;
  vx: number;
  vy: number;
  // legs phase for walk animation
  phase: number;
  // current bubble: { text, until }
  bubble?: { text: string; until: number };
  pause?: number; // ms remaining where we're paused after a meeting
};

const HEAD_R = 22; // head radius (matches photo crop)
const BODY_W = 36; // body rect width
const BODY_H = 36; // body rect height
const COLLISION_R = HEAD_R + 14;
const SPEED = 0.55;
const HELLOS = ['hi!', 'hello', 'nice to meet you', '👋', 'hey', '🤝', '✨', 'building?', 'demo?'];

export function RoomCanvas({ people }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spritesRef = useRef<Map<string, Sprite>>(new Map());
  const sizeRef = useRef({ w: 800, h: 600 });
  const rafRef = useRef<number>(0);

  // Sync sprites with people array
  useEffect(() => {
    const map = spritesRef.current;
    const { w, h } = sizeRef.current;
    const seen = new Set<string>();
    for (const p of people) {
      seen.add(p._id);
      const existing = map.get(p._id);
      if (!existing) {
        // Spawn at random position with random heading
        const angle = Math.random() * Math.PI * 2;
        map.set(p._id, {
          _id: p._id,
          name: p.name,
          photoUrl: p.photoUrl ?? null,
          x: 80 + Math.random() * (w - 160),
          y: 100 + Math.random() * (h - 200),
          vx: Math.cos(angle) * SPEED,
          vy: Math.sin(angle) * SPEED,
          phase: Math.random() * Math.PI * 2,
        });
      } else if (existing.photoUrl !== (p.photoUrl ?? null)) {
        // photoUrl changed — drop the cached img so the loader picks the new one
        existing.photoUrl = p.photoUrl ?? null;
        existing.img = undefined;
      }
    }
    for (const id of [...map.keys()]) if (!seen.has(id)) map.delete(id);
  }, [people]);

  // Preload photos
  useEffect(() => {
    for (const sprite of spritesRef.current.values()) {
      if (sprite.photoUrl && !sprite.img) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = sprite.photoUrl;
        img.onload = () => { sprite.img = img; };
      }
    }
  }, [people]);

  // Resize observer
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const observer = new ResizeObserver(() => {
      const rect = wrap.getBoundingClientRect();
      sizeRef.current = { w: rect.width, h: rect.height };
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    });
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(50, now - last); // clamp big gaps
      last = now;
      step(ctx, dt, now);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  function step(ctx: CanvasRenderingContext2D, dt: number, now: number) {
    const { w, h } = sizeRef.current;
    const sprites = [...spritesRef.current.values()];

    // Physics
    for (const s of sprites) {
      s.phase += dt * 0.012;
      if (s.pause && s.pause > 0) {
        s.pause -= dt;
      } else {
        s.x += s.vx * dt * 0.06;
        s.y += s.vy * dt * 0.06;
        // Bounce off walls (keep avatar inside the floor area)
        if (s.x < HEAD_R + 4) { s.x = HEAD_R + 4; s.vx = Math.abs(s.vx); }
        if (s.x > w - HEAD_R - 4) { s.x = w - HEAD_R - 4; s.vx = -Math.abs(s.vx); }
        if (s.y < HEAD_R + 80) { s.y = HEAD_R + 80; s.vy = Math.abs(s.vy); }
        if (s.y > h - 28) { s.y = h - 28; s.vy = -Math.abs(s.vy); }
        // Tiny random jitter so paths don't look linear
        if (Math.random() < 0.005) {
          const a = Math.atan2(s.vy, s.vx) + (Math.random() - 0.5) * 0.6;
          s.vx = Math.cos(a) * SPEED;
          s.vy = Math.sin(a) * SPEED;
        }
      }
    }
    // Collisions → pause + emit bubble
    for (let i = 0; i < sprites.length; i++) {
      for (let j = i + 1; j < sprites.length; j++) {
        const a = sprites[i];
        const b = sprites[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < COLLISION_R * COLLISION_R) {
          // Reflect velocities
          if (!a.pause || a.pause <= 0) {
            const ang = Math.atan2(dy, dx);
            a.vx = Math.cos(ang) * SPEED;
            a.vy = Math.sin(ang) * SPEED;
            b.vx = -Math.cos(ang) * SPEED;
            b.vy = -Math.sin(ang) * SPEED;
            a.pause = 600;
            b.pause = 600;
            if (Math.random() < 0.7) {
              const txt = HELLOS[Math.floor(Math.random() * HELLOS.length)];
              a.bubble = { text: txt, until: now + 1800 };
              b.bubble = { text: txt, until: now + 1800 };
            }
            // separate so they don't stick
            const overlap = (COLLISION_R - Math.sqrt(d2)) / 2;
            a.x += Math.cos(ang) * overlap;
            a.y += Math.sin(ang) * overlap;
            b.x -= Math.cos(ang) * overlap;
            b.y -= Math.sin(ang) * overlap;
          }
        }
      }
    }

    // Draw
    ctx.clearRect(0, 0, w, h);
    drawFloor(ctx, w, h);
    drawStage(ctx, w);

    // sort by y so closer (lower y) draw on top
    sprites.sort((a, b) => a.y - b.y);
    for (const s of sprites) drawSprite(ctx, s, now);
  }

  return (
    <div ref={wrapRef} className="room-canvas">
      <canvas ref={canvasRef} />
      {people.length === 0 && (
        <div className="room-canvas__empty">Nobody in the room yet. Scan the QR to join.</div>
      )}
    </div>
  );
}

function drawFloor(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Gradient floor
  const grad = ctx.createLinearGradient(0, 80, 0, h);
  grad.addColorStop(0, '#2a2422');
  grad.addColorStop(1, '#1a1a1a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 80, w, h - 80);

  // Floor grid
  ctx.strokeStyle = 'rgba(217, 119, 87, 0.06)';
  ctx.lineWidth = 1;
  const cell = 48;
  for (let x = 0; x < w; x += cell) {
    ctx.beginPath();
    ctx.moveTo(x, 80);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 80; y < h; y += cell) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function drawStage(ctx: CanvasRenderingContext2D, w: number) {
  // Stage bar at top
  ctx.fillStyle = '#0e0e0e';
  ctx.fillRect(0, 0, w, 72);
  // Big screen on stage
  const sx = w / 2 - 200;
  const sy = 10;
  ctx.fillStyle = '#1a1a1a';
  ctx.strokeStyle = '#D97757';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(sx, sy, 400, 52, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#D97757';
  ctx.font = '600 14px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CLAUDE FOR BUILDERS · ROOM CAM', w / 2, sy + 26);
}

function drawSprite(ctx: CanvasRenderingContext2D, s: Sprite, now: number) {
  const { x, y } = s;
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(x, y + BODY_H / 2 + 6, BODY_W / 2, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body (Claude orange rounded square)
  const bx = x - BODY_W / 2;
  const by = y - BODY_H / 2 + 8;
  ctx.fillStyle = '#D97757';
  ctx.beginPath();
  ctx.roundRect(bx, by, BODY_W, BODY_H, 8);
  ctx.fill();

  // Legs (two short rectangles with walk phase)
  const walk = Math.sin(s.phase) * 3;
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(x - 9, by + BODY_H, 5, 8 + walk);
  ctx.fillRect(x + 4, by + BODY_H, 5, 8 - walk);

  // Head — photo (circular) or fallback initial circle
  const hy = y - BODY_H / 2 - HEAD_R + 6;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, hy, HEAD_R, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  if (s.img) {
    // cover-fit
    const iw = s.img.width;
    const ih = s.img.height;
    const scale = Math.max((HEAD_R * 2) / iw, (HEAD_R * 2) / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.drawImage(s.img, x - dw / 2, hy - dh / 2, dw, dh);
  } else {
    // fallback: orange circle with initial
    ctx.fillStyle = '#E8B89C';
    ctx.fillRect(x - HEAD_R, hy - HEAD_R, HEAD_R * 2, HEAD_R * 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.font = '700 18px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.name.slice(0, 1).toUpperCase(), x, hy + 1);
  }
  ctx.restore();
  // ring around head
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, hy, HEAD_R, 0, Math.PI * 2);
  ctx.stroke();

  // Name tag
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  const labelW = Math.min(80, s.name.length * 6 + 14);
  ctx.beginPath();
  ctx.roundRect(x - labelW / 2, by + BODY_H + 14, labelW, 14, 5);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = '600 10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(truncate(s.name, 10), x, by + BODY_H + 21);

  // Speech bubble
  if (s.bubble && s.bubble.until > now) {
    const text = s.bubble.text;
    ctx.font = '600 13px "DM Sans", sans-serif';
    const w = ctx.measureText(text).width + 16;
    const bx = x - w / 2;
    const by2 = hy - HEAD_R - 28;
    ctx.fillStyle = '#F0EFEA';
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(bx, by2, w, 22, 6);
    ctx.fill();
    ctx.stroke();
    // tail
    ctx.beginPath();
    ctx.moveTo(x - 4, by2 + 22);
    ctx.lineTo(x, by2 + 28);
    ctx.lineTo(x + 4, by2 + 22);
    ctx.closePath();
    ctx.fillStyle = '#F0EFEA';
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#1a1a1a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, by2 + 11);
  }
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}
