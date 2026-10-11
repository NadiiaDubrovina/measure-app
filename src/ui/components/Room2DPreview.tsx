import React from 'react';
import { Room } from '../../domain/types/spatial';

interface Room2DPreviewProps {
  room: Room;
}

export const Room2DPreview: React.FC<Room2DPreviewProps> = ({ room }) => {
  const walls = room.walls || [];

  if (walls.length === 0) {
    return (
      <div className="bg-stone-50 border border-dashed border-stone-300 rounded-2xl p-6 text-center text-stone-400">
        <p className="text-sm font-medium">Brak ścian do wygenerowania rzutu 2D.</p>
        <p className="text-xs text-stone-400 mt-1">Dodaj co najmniej jedną ścianę w sekcji Ściany.</p>
      </div>
    );
  }

  // Generate schematic 2D layout based on walls
  // Standard simple box or polygonal visualization
  const svgWidth = 380;
  const svgHeight = 280;
  const padding = 45;

  // Compute wall layout coordinates
  let currentX = padding;
  let currentY = svgHeight - padding;

  interface Point {
    x: number;
    y: number;
  }

  interface WallSegment {
    wall: typeof walls[0];
    start: Point;
    end: Point;
    angle: number;
  }

  const segments: WallSegment[] = [];

  // Normalize scale
  const maxLength = Math.max(...walls.map(w => w.lengthMm), 3000);
  const scale = (svgWidth - padding * 2) / (maxLength * 1.2);

  // Simplified schematic wall builder:
  // Wall 0: goes East (Left to Right)
  // Wall 1: turns North (Bottom to Top)
  // Wall 2: turns West (Right to Left)
  // Wall 3: turns South (Top to Bottom)
  const defaultHeadings = [0, -90, -180, 90]; // 0=East, -90=North, -180=West, 90=South

  walls.forEach((wall, idx) => {
    const heading = defaultHeadings[idx % 4];
    const rad = (heading * Math.PI) / 180;
    const lenPx = Math.max(60, wall.lengthMm * scale);

    const nextX = currentX + Math.cos(rad) * lenPx;
    const nextY = currentY + Math.sin(rad) * lenPx;

    segments.push({
      wall,
      start: { x: currentX, y: currentY },
      end: { x: nextX, y: nextY },
      angle: wall.cornerAngleDeg || 90
    });

    currentX = nextX;
    currentY = nextY;
  });

  // Calculate bounding box and re-center in SVG
  const allX = segments.flatMap(s => [s.start.x, s.end.x]);
  const allY = segments.flatMap(s => [s.start.y, s.end.y]);
  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);

  const polyWidth = maxX - minX || 1;
  const polyHeight = maxY - minY || 1;

  const offsetX = (svgWidth - polyWidth) / 2 - minX;
  const offsetY = (svgHeight - polyHeight) / 2 - minY;

  const centeredSegments = segments.map(s => ({
    ...s,
    start: { x: s.start.x + offsetX, y: s.start.y + offsetY },
    end: { x: s.end.x + offsetX, y: s.end.y + offsetY }
  }));

  return (
    <div className="bg-stone-900 rounded-2xl p-4 shadow-inner text-stone-100 relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-300">
            Schematyczny Rzut 2D (Widok Wygenerowany)
          </span>
        </div>
        <span className="text-[10px] text-stone-400 font-mono">
          Ściany: {walls.length} | Punkty: {room.utilityPoints.length} | Otwory: {room.openings.length}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto max-h-[260px] select-none"
      >
        {/* Subtle grid background */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#292524" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={svgWidth} height={svgHeight} fill="url(#grid)" />

        {/* Walls */}
        {centeredSegments.map((s) => {
          const isAngleOutOfSquare = s.wall.cornerAngleDeg && (s.wall.cornerAngleDeg < 88.5 || s.wall.cornerAngleDeg > 91.5);
          const midX = (s.start.x + s.end.x) / 2;
          const midY = (s.start.y + s.end.y) / 2;

          return (
            <g key={s.wall.id}>
              {/* Wall line */}
              <line
                x1={s.start.x}
                y1={s.start.y}
                x2={s.end.x}
                y2={s.end.y}
                stroke="#e7e5e4"
                strokeWidth="6"
                strokeLinecap="round"
              />

              {/* Wall inner core */}
              <line
                x1={s.start.x}
                y1={s.start.y}
                x2={s.end.x}
                y2={s.end.y}
                stroke="#78716c"
                strokeWidth="2"
              />

              {/* Wall label & length */}
              <g transform={`translate(${midX}, ${midY})`}>
                <rect
                  x="-36"
                  y="-11"
                  width="72"
                  height="22"
                  rx="4"
                  fill="#1c1917"
                  stroke="#57534e"
                  strokeWidth="0.8"
                />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="#f5f5f4"
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {s.wall.lengthMm} mm
                </text>
              </g>

              {/* Corner angle node */}
              <circle cx={s.start.x} cy={s.start.y} r="4" fill="#a8a29e" />
              {s.wall.cornerAngleDeg !== undefined && (
                <g transform={`translate(${s.start.x + 8}, ${s.start.y - 8})`}>
                  <rect
                    x="-2"
                    y="-8"
                    width="32"
                    height="14"
                    rx="3"
                    fill={isAngleOutOfSquare ? '#78350f' : '#292524'}
                    stroke={isAngleOutOfSquare ? '#f59e0b' : '#57534e'}
                    strokeWidth="0.6"
                  />
                  <text
                    x="14"
                    y="2"
                    textAnchor="middle"
                    fill={isAngleOutOfSquare ? '#fcd34d' : '#d6d3d1'}
                    fontSize="8"
                    fontWeight="bold"
                  >
                    {s.wall.cornerAngleDeg}°
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Openings (Windows, Doors) on walls */}
        {room.openings.map(op => {
          const matchingSegment = centeredSegments.find(
            s => s.wall.id === op.wallId || s.wall.identifier === op.wallIdentifier
          ) || centeredSegments[0];

          if (!matchingSegment) return null;

          const ratio = Math.min(0.9, Math.max(0.1, op.distanceFromCornerMm / (matchingSegment.wall.lengthMm || 1)));
          const posX = matchingSegment.start.x + (matchingSegment.end.x - matchingSegment.start.x) * ratio;
          const posY = matchingSegment.start.y + (matchingSegment.end.y - matchingSegment.start.y) * ratio;

          const isWindow = op.type === 'window';
          const isDoor = op.type === 'door';
          const isRadiator = op.type === 'radiator';

          return (
            <g key={op.id} transform={`translate(${posX}, ${posY})`}>
              <rect
                x="-10"
                y="-6"
                width="20"
                height="12"
                rx="2"
                fill={isWindow ? '#0284c7' : isDoor ? '#10b981' : isRadiator ? '#f97316' : '#64748b'}
                stroke="#ffffff"
                strokeWidth="1"
              />
              <text
                x="0"
                y="15"
                textAnchor="middle"
                fill="#e2e8f0"
                fontSize="7.5"
                fontWeight="bold"
              >
                {isWindow ? 'Okno' : isDoor ? 'Drzwi' : isRadiator ? 'Grzejnik' : op.type}
              </text>
            </g>
          );
        })}

        {/* Utility points (Sockets, Water, Drain, 400V) */}
        {room.utilityPoints.map(util => {
          const matchingSegment = centeredSegments.find(
            s => s.wall.id === util.wallId || s.wall.identifier === util.wallIdentifier
          ) || centeredSegments[0];

          if (!matchingSegment) return null;

          const ratio = Math.min(0.95, Math.max(0.05, util.distanceFromCornerMm / (matchingSegment.wall.lengthMm || 1)));
          const posX = matchingSegment.start.x + (matchingSegment.end.x - matchingSegment.start.x) * ratio;
          const posY = matchingSegment.start.y + (matchingSegment.end.y - matchingSegment.start.y) * ratio;

          const isWater = util.type.includes('water');
          const isDrain = util.type.includes('drain');
          const is400v = util.type === 'socket_400v';
          const isSocket = util.type === 'socket_230v';

          return (
            <g key={util.id} transform={`translate(${posX}, ${posY})`}>
              <circle
                r="5"
                fill={isWater ? '#38bdf8' : isDrain ? '#a855f7' : is400v ? '#ef4444' : isSocket ? '#eab308' : '#94a3b8'}
                stroke="#1c1917"
                strokeWidth="1"
              />
              <text
                x="0"
                y="-7"
                textAnchor="middle"
                fill="#f1f5f9"
                fontSize="7"
                fontFamily="monospace"
              >
                {isWater ? 'WODA' : isDrain ? 'ODPŁYW' : is400v ? '400V' : '230V'}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-2 pt-2 border-t border-stone-800 text-[10px] text-stone-400">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-sky-400"></span> Woda
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-500"></span> Odpływ
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-400"></span> Gniazdo 230V
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500"></span> Siła 400V
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-sky-600"></span> Okno
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-emerald-500"></span> Drzwi
        </div>
      </div>
    </div>
  );
};
