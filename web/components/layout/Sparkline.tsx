"use client";

interface SparklineProps {
  data?: number[];
  stroke?: string;
  fill?: string;
  height?: number;
  width?: number;
  className?: string;
}

const DEFAULT_DATA = [4, 6, 5, 7, 6, 8, 7, 9, 8, 10, 9, 11, 10, 12, 11, 13, 12, 14];

export function Sparkline({
  data = DEFAULT_DATA,
  stroke = "rgb(16 185 129)",
  fill = "rgb(16 185 129 / 0.14)",
  height = 48,
  width = 180,
  className = "",
}: SparklineProps) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 8) - 4;
    return [x, y] as const;
  });

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      preserveAspectRatio="none"
    >
      <path d={areaPath} fill={fill} />
      <path
        d={linePath}
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}