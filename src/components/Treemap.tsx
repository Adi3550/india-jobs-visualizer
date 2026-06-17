import React, { useEffect, useRef, useState } from 'react';
import * as d3Hierarchy from 'd3-hierarchy';
import { interpolateRdYlBu, interpolateViridis, interpolatePlasma } from 'd3-scale-chromatic';
import { interpolateRgb } from 'd3-interpolate';
import { JobData } from '../App';

interface TreemapProps {
  data: JobData[];
  metric: string;
  searchQuery: string;
  onHover: (job: JobData | null, x: number, y: number) => void;
}

export default function Treemap({ data, metric, searchQuery, onHover }: TreemapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<d3Hierarchy.HierarchyRectangularNode<any>[]>([]);
  
  const [zoomedSector, setZoomedSector] = useState<string | null>(null);
  const [prevMetric, setPrevMetric] = useState(metric);
  const [animProgress, setAnimProgress] = useState(1);

  // Handle animation loop
  useEffect(() => {
    if (metric !== prevMetric) {
      setAnimProgress(0);
      let start = performance.now();
      let frameId: number;
      const animate = (time: number) => {
        let p = (time - start) / 400; // 400ms duration
        if (p >= 1) {
          p = 1;
          setPrevMetric(metric);
        }
        setAnimProgress(p); // Triggers re-render which triggers draw()
        if (p < 1) frameId = requestAnimationFrame(animate);
      };
      frameId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frameId);
    }
  }, [metric, prevMetric]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let resizeObserver: ResizeObserver;

    function draw(width: number, height: number) {
      if (width === 0 || height === 0 || !ctx) return;

      // Group data by sector
      const rootData = { name: "India", children: [] as any[] };
      const sectors: any = {};
      
      data.forEach(d => {
        if (!sectors[d.sector]) {
          sectors[d.sector] = { name: d.sector, children: [] };
          rootData.children.push(sectors[d.sector]);
        }
        sectors[d.sector].children.push(d);
      });

      // Zoom filtering
      if (zoomedSector) {
         rootData.children = rootData.children.filter(s => s.name === zoomedSector);
      }

      const hierarchy = d3Hierarchy.hierarchy(rootData)
        .sum((d: any) => d.employment || 0)
        .sort((a, b) => (b.value || 0) - (a.value || 0));

      const treemapLayout = d3Hierarchy.treemap()
        .size([width, height])
        .paddingTop(zoomedSector ? 0 : 20)
        .paddingRight(2)
        .paddingInner(2)
        .round(true);

      treemapLayout(hierarchy as any);

      ctx.clearRect(0, 0, width, height);

      const getMetricBounds = (m: string) => {
        let min = Infinity;
        let max = -Infinity;
        if (m === 'ai_exposure') return [0, 10];
        data.forEach(d => {
          if (d[m] < min) min = d[m];
          if (d[m] > max) max = d[m];
        });
        return [min, max];
      };

      const [minPrev, maxPrev] = getMetricBounds(prevMetric);
      const [minCur, maxCur] = getMetricBounds(metric);

      const getColorStr = (m: string, val: number, min: number, max: number) => {
        let normalized = (val - min) / (max - min || 1);
        normalized = Math.max(0, Math.min(1, normalized));
        if (m === 'ai_exposure') return interpolatePlasma(normalized);
        if (m === 'wage') return interpolateViridis(normalized);
        if (m === 'growth') return interpolateRdYlBu(1 - normalized);
        return '#6366f1';
      };

      const leaves = hierarchy.leaves();
      nodesRef.current = leaves;

      // Draw Sector Backgrounds & Labels (only if not zoomed)
      if (!zoomedSector) {
        ctx.font = 'bold 12px Inter, sans-serif';
        hierarchy.children?.forEach(sector => {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.fillRect(sector.x0, sector.x1, sector.x1 - sector.x0, sector.y1 - sector.y0);
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fillText(sector.data.name, sector.x0 + 4, sector.y0 + 14);
        });
      }

      const lowerSearch = searchQuery.toLowerCase();

      // Draw Jobs
      leaves.forEach(leaf => {
        const d = leaf.data;
        const x = leaf.x0;
        const y = leaf.y0;
        const w = leaf.x1 - leaf.x0;
        const h = leaf.y1 - leaf.y0;

        // Color interpolation
        const prevColor = getColorStr(prevMetric, d[prevMetric], minPrev, maxPrev);
        const curColor = getColorStr(metric, d[metric], minCur, maxCur);
        const interpolatedColor = interpolateRgb(prevColor, curColor)(animProgress);

        // Search fading
        let alpha = 1.0;
        if (searchQuery) {
           const matches = d.name.toLowerCase().includes(lowerSearch) || d.sector.toLowerCase().includes(lowerSearch);
           if (!matches) alpha = 0.15;
        }

        ctx.globalAlpha = alpha;
        ctx.fillStyle = interpolatedColor;
        ctx.fillRect(x, y, w, h);

        ctx.strokeStyle = '#0a0a0f';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);

        // Text
        if (w > 50 && h > 20) {
          ctx.fillStyle = '#fff';
          ctx.font = '10px Inter, sans-serif';
          let text = d.name;
          if (ctx.measureText(text).width > w - 4) {
             text = text.substring(0, Math.floor(w/6)) + '...';
          }
          ctx.fillText(text, x + 4, y + 14);
        }
        ctx.globalAlpha = 1.0;
      });
    }

    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect && rect.width > 0) {
      // Setup scale for high DPI
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      draw(rect.width, rect.height);
    }

    resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        draw(width, height);
      }
    });
    
    if (canvas.parentElement) {
       resizeObserver.observe(canvas.parentElement);
    }

    return () => resizeObserver.disconnect();
  }, [data, metric, prevMetric, animProgress, zoomedSector, searchQuery]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const leaf = nodesRef.current.find(l => x >= l.x0 && x <= l.x1 && y >= l.y0 && y <= l.y1);
    
    if (leaf) {
      onHover(leaf.data, e.clientX, e.clientY);
    } else {
      onHover(null, 0, 0);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const leaf = nodesRef.current.find(l => x >= l.x0 && x <= l.x1 && y >= l.y0 && y <= l.y1);
    
    if (leaf) {
       // Toggle zoom state
       if (zoomedSector === leaf.data.sector) {
          setZoomedSector(null);
       } else {
          setZoomedSector(leaf.data.sector);
       }
    }
  };

  const handleTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const leaf = nodesRef.current.find(l => x >= l.x0 && x <= l.x1 && y >= l.y0 && y <= l.y1);
    
    if (leaf) {
      onHover(leaf.data, touch.clientX, touch.clientY);
    } else {
      onHover(null, 0, 0);
    }
  };

  return (
    <div className="treemap-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
      {zoomedSector && (
        <button 
           className="btn btn-primary" 
           style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}
           onClick={() => setZoomedSector(null)}
        >
          &larr; Back to All Sectors
        </button>
      )}
      <canvas 
        ref={canvasRef} 
        onMouseMove={handleMouseMove}
        onMouseLeave={() => onHover(null, 0, 0)}
        onTouchStart={handleTouch}
        onClick={handleClick}
        style={{ cursor: 'pointer', touchAction: 'none' }}
      />
    </div>
  );
}
