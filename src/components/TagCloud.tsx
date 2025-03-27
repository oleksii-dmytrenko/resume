import { useCallback, useEffect, useRef, useState } from 'react';
import WordCloud from '@visx/wordcloud/lib/WordCloud';
import { Text } from '@visx/text';
import { scaleLog } from '@visx/scale';

interface WordData {
  text: string;
  value: number;
}

const words: WordData[] = [
  { text: 'JavaScript', value: 80 },
  { text: 'TypeScript', value: 80 },
  { text: 'Python', value: 75 },
  { text: 'NodeJS', value: 70 },
  { text: 'ReactJS', value: 85 },
  { text: 'Loopback', value: 60 },
  { text: 'ExpressJS', value: 65 },
  { text: 'Flask', value: 60 },
  { text: 'SQL', value: 70 },
  { text: 'MongoDB', value: 65 },
  { text: 'Big Data', value: 60 },
  { text: 'Machine Learning', value: 70 },
  { text: 'AI agents', value: 75 },
  { text: 'LangChain', value: 65 },
  { text: 'AWS', value: 75 },
  { text: 'Docker', value: 70 },
  { text: 'Terraform', value: 65 },
];

const colors = [
  '#3b82f6', // blue-500
  '#2563eb', // blue-600
  '#1d4ed8', // blue-700
  '#60a5fa', // blue-400
];

export const TagCloud = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      setDimensions({
        width: entry.contentRect.width,
        height: Math.min(600, entry.contentRect.width * 0.75),
      });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const fontSize = useCallback((datum: WordData) => {
    const scale = scaleLog({
      domain: [Math.min(...words.map(w => w.value)), Math.max(...words.map(w => w.value))],
      range: [20, 50],
    });
    return scale(datum.value);
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <div style={{ width: dimensions.width, height: dimensions.height }} className="relative">
        <WordCloud
          words={words}
          width={dimensions.width}
          height={dimensions.height}
          fontSize={fontSize}
          font={'Inter var'}
          padding={2}
          rotate={0}
          spiral="rectangular"
        >
          {(cloudWords) =>
            cloudWords.map((w, i) => (
              <Text
                key={w.text}
                fill={colors[i % colors.length]}
                textAnchor="middle"
                transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
                fontSize={w.size}
                fontFamily={w.font}
                className="transition-all duration-200 hover:fill-blue-400 cursor-pointer"
              >
                {w.text}
              </Text>
            ))
          }
        </WordCloud>
      </div>
    </div>
  );
}; 