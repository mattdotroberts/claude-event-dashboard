import { useState, useEffect, useCallback } from 'react';
import { ClaudeCharacter } from './ClaudeCharacter';
import './CrawlingClaude.css';

type Edge = 'bottom' | 'top' | 'left' | 'right';

interface CrawlConfig {
  edge: Edge;
  duration: number; // seconds
  reverse: boolean; // crawl in opposite direction
}

function randomConfig(): CrawlConfig {
  const edges: Edge[] = ['bottom', 'top', 'left', 'right'];
  const edge = edges[Math.floor(Math.random() * edges.length)];
  const duration = 14 + Math.random() * 16; // 14–30s
  const reverse = Math.random() > 0.5;
  return { edge, duration, reverse };
}

function randomDelay(): number {
  return 3000 + Math.random() * 8000; // 3–11s between appearances
}

export function CrawlingClaude() {
  const [config, setConfig] = useState<CrawlConfig | null>(null);
  const [visible, setVisible] = useState(false);

  const startCrawl = useCallback(() => {
    const cfg = randomConfig();
    setConfig(cfg);
    setVisible(true);

    // Hide after animation completes
    const timer = setTimeout(() => {
      setVisible(false);
    }, cfg.duration * 1000);

    return () => clearTimeout(timer);
  }, []);

  // When hidden, schedule next appearance
  useEffect(() => {
    if (visible) return;

    const delay = randomDelay();
    const timer = setTimeout(() => {
      startCrawl();
    }, delay);

    return () => clearTimeout(timer);
  }, [visible, startCrawl]);

  if (!visible || !config) return null;

  const { edge, duration, reverse } = config;

  // Build class names
  const wrapperClass = [
    'crawling-claude',
    `crawling-claude--${edge}`,
    reverse ? 'crawling-claude--reverse' : '',
  ].filter(Boolean).join(' ');

  const style: React.CSSProperties = {
    animationDuration: `${duration}s`,
  };

  return (
    <div className={wrapperClass} style={style} key={`${edge}-${Date.now()}`}>
      <ClaudeCharacter size="small" walking />
    </div>
  );
}
