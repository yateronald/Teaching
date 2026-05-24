import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button, Tooltip, Slider } from 'antd';
import {
  UndoOutlined, RedoOutlined, DeleteOutlined, DownloadOutlined,
  EditOutlined, HighlightOutlined, BorderOutlined, MinusOutlined,
} from '@ant-design/icons';

interface Point { x: number; y: number; }
interface DrawAction {
  type: 'path' | 'line' | 'rect' | 'circle' | 'eraser';
  points: Point[];
  color: string;
  width: number;
}

const COLORS = [
  '#1e293b', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6',
  '#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316',
  '#ffffff',
];

const TOOLS = [
  { key: 'pen', icon: <EditOutlined />, label: 'Pen' },
  { key: 'highlighter', icon: <HighlightOutlined />, label: 'Highlighter' },
  { key: 'line', icon: <MinusOutlined />, label: 'Line' },
  { key: 'rect', icon: <BorderOutlined />, label: 'Rectangle' },
  { key: 'eraser', icon: <DeleteOutlined />, label: 'Eraser' },
];

const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#1e293b');
  const [brushSize, setBrushSize] = useState(3);
  const [actions, setActions] = useState<DrawAction[]>([]);
  const [redoStack, setRedoStack] = useState<DrawAction[]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [startPoint, setStartPoint] = useState<Point | null>(null);

  // Resize canvas to fill container
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
    redrawAll();
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => { redrawAll(); }, [actions]);

  const getPos = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const redrawAll = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    for (const action of actions) {
      drawAction(ctx, action);
    }
  };

  const drawAction = (ctx: CanvasRenderingContext2D, action: DrawAction) => {
    ctx.save();
    if (action.type === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = action.color;
    }
    ctx.lineWidth = action.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (action.type === 'path' || action.type === 'eraser') {
      if (action.points.length < 2) { ctx.restore(); return; }
      ctx.beginPath();
      ctx.moveTo(action.points[0].x, action.points[0].y);
      for (let i = 1; i < action.points.length; i++) {
        ctx.lineTo(action.points[i].x, action.points[i].y);
      }
      ctx.stroke();
    } else if (action.type === 'line') {
      if (action.points.length < 2) { ctx.restore(); return; }
      ctx.beginPath();
      ctx.moveTo(action.points[0].x, action.points[0].y);
      ctx.lineTo(action.points[action.points.length - 1].x, action.points[action.points.length - 1].y);
      ctx.stroke();
    } else if (action.type === 'rect') {
      if (action.points.length < 2) { ctx.restore(); return; }
      const p0 = action.points[0];
      const p1 = action.points[action.points.length - 1];
      ctx.strokeRect(p0.x, p0.y, p1.x - p0.x, p1.y - p0.y);
    } else if (action.type === 'circle') {
      if (action.points.length < 2) { ctx.restore(); return; }
      const p0 = action.points[0];
      const p1 = action.points[action.points.length - 1];
      const rx = Math.abs(p1.x - p0.x) / 2;
      const ry = Math.abs(p1.y - p0.y) / 2;
      const cx = (p0.x + p1.x) / 2;
      const cy = (p0.y + p1.y) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getPos(e);
    setIsDrawing(true);
    setCurrentPath([pos]);
    setStartPoint(pos);
    setRedoStack([]);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'pen' || tool === 'highlighter' || tool === 'eraser') {
      setCurrentPath(prev => [...prev, pos]);
      // Draw incrementally for smooth feel
      const prev = currentPath;
      if (prev.length > 0) {
        ctx.save();
        if (tool === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.strokeStyle = 'rgba(0,0,0,1)';
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = tool === 'highlighter' ? color + '60' : color;
        }
        ctx.lineWidth = tool === 'highlighter' ? brushSize * 4 : brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(prev[prev.length - 1].x, prev[prev.length - 1].y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.restore();
      }
    } else {
      // For shapes, redraw everything + preview
      redrawAll();
      if (startPoint) {
        const previewAction: DrawAction = {
          type: tool as DrawAction['type'],
          points: [startPoint, pos],
          color, width: brushSize,
        };
        drawAction(ctx, previewAction);
      }
    }
  };

  const handleEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const actionType = (tool === 'pen' || tool === 'highlighter') ? 'path' : tool === 'eraser' ? 'eraser' : tool as DrawAction['type'];
    const actionColor = tool === 'highlighter' ? color + '60' : color;
    const actionWidth = tool === 'highlighter' ? brushSize * 4 : tool === 'eraser' ? brushSize * 3 : brushSize;

    if (currentPath.length > 1) {
      setActions(prev => [...prev, { type: actionType, points: currentPath, color: actionColor, width: actionWidth }]);
    }
    setCurrentPath([]);
    setStartPoint(null);
  };

  const undo = () => {
    if (actions.length === 0) return;
    const last = actions[actions.length - 1];
    setActions(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, last]);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const last = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setActions(prev => [...prev, last]);
  };

  const clearAll = () => {
    setActions([]);
    setRedoStack([]);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8fafc' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderBottom: '1px solid #e2e8f0', background: '#fff', flexWrap: 'wrap', flexShrink: 0 }}>
        {/* Tools */}
        {TOOLS.map(t => (
          <Tooltip key={t.key} title={t.label}>
            <button
              onClick={() => setTool(t.key)}
              style={{
                width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                background: tool === t.key ? '#6366f1' : '#f1f5f9',
                color: tool === t.key ? '#fff' : '#475569',
                transition: 'all 0.15s',
              }}
            >
              {t.icon}
            </button>
          </Tooltip>
        ))}

        <div style={{ width: 1, height: 24, background: '#e2e8f0', margin: '0 4px' }} />

        {/* Colors */}
        {COLORS.map(c => (
          <button
            key={c}
            onClick={() => setColor(c)}
            style={{
              width: 22, height: 22, borderRadius: 6, border: color === c ? '2px solid #6366f1' : '1px solid #d1d5db',
              background: c, cursor: 'pointer', flexShrink: 0,
              boxShadow: color === c ? '0 0 0 2px rgba(99,102,241,0.3)' : 'none',
            }}
          />
        ))}

        <div style={{ width: 1, height: 24, background: '#e2e8f0', margin: '0 4px' }} />

        {/* Brush size */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 80 }}>
          <span style={{ fontSize: 10, color: '#94a3b8' }}>{brushSize}px</span>
          <Slider min={1} max={20} value={brushSize} onChange={setBrushSize}
            style={{ width: 60, margin: 0 }} />
        </div>

        <div style={{ width: 1, height: 24, background: '#e2e8f0', margin: '0 4px' }} />

        {/* Actions */}
        <Tooltip title="Undo"><Button type="text" size="small" icon={<UndoOutlined />} onClick={undo} disabled={actions.length === 0} style={{ borderRadius: 6 }} /></Tooltip>
        <Tooltip title="Redo"><Button type="text" size="small" icon={<RedoOutlined />} onClick={redo} disabled={redoStack.length === 0} style={{ borderRadius: 6 }} /></Tooltip>
        <Tooltip title="Clear All"><Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={clearAll} style={{ borderRadius: 6 }} /></Tooltip>
        <Tooltip title="Download"><Button type="text" size="small" icon={<DownloadOutlined />} onClick={download} style={{ borderRadius: 6 }} /></Tooltip>
      </div>

      {/* Canvas */}
      <div ref={containerRef} style={{ flex: 1, position: 'relative', cursor: tool === 'eraser' ? 'crosshair' : 'crosshair', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          style={{ position: 'absolute', top: 0, left: 0, touchAction: 'none' }}
        />
      </div>
    </div>
  );
};

export default Whiteboard;
