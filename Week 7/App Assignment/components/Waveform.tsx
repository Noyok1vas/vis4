import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;
const waveformWidth = screenWidth * 3.0; // 3 times the screen width, same as track.png
const waveformHeight = 80;
const barWidth = 5; 
const barGap = 4; 
const totalBars = Math.floor(waveformWidth / (barWidth + barGap));

interface WaveformProps {
  waveformData?: number[] | null; // 预生成的波形数据
  progress?: number; // 0-1 播放进度
  position?: number; // horizontal offset position (for dragging)
  isPlaying?: boolean; // 是否正在播放
}

export default function Waveform({ 
  waveformData, 
  progress = 0, 
  position = 0,
  isPlaying = false 
}: WaveformProps) {
  // 如果提供了波形数据，使用它；否则生成默认数据
  const peaks = useMemo(() => {
    if (waveformData && waveformData.length > 0) {
      // 如果长度不匹配，进行插值
      if (waveformData.length === totalBars) {
        return waveformData;
      }
      // 插值处理
      const resampled: number[] = [];
      for (let i = 0; i < totalBars; i++) {
        const sourceIndex = (i / totalBars) * waveformData.length;
        const index1 = Math.floor(sourceIndex);
        const index2 = Math.min(index1 + 1, waveformData.length - 1);
        const fraction = sourceIndex - index1;
        const value = waveformData[index1] * (1 - fraction) + waveformData[index2] * fraction;
        resampled.push(value);
      }
      return resampled;
    }
    // 默认波形数据
    return new Array(totalBars).fill(0.5);
  }, [waveformData]);

  const centerY = waveformHeight / 2;

  return (
    <View style={styles.container}>
      <Svg 
        width={waveformWidth} 
        height={waveformHeight} 
        style={styles.svg}
      >
        {peaks.map((amplitude, index) => {
          const x = index * (barWidth + barGap) + barWidth / 2;
          const barHeight = amplitude * (waveformHeight * 0.85);
          const y1 = centerY - barHeight / 2;
          const y2 = centerY + barHeight / 2;
          
          // 播放位置始终在屏幕中心（screenWidth / 2）
          // bar 在屏幕坐标系中的位置：由于外层容器通过 translateX 移动，bar 的屏幕位置是其在 SVG 中的 x 坐标
          // 外层容器的移动由 player.tsx 中的 animatedPosition 控制，使得播放位置在屏幕中心
          // 因此这里我们直接使用 bar 在波形中的相对位置来判断
          // 播放位置在波形中的位置 = progress * waveformWidth
          const playheadX = progress * waveformWidth;
          const isPlayed = x < playheadX;
          
          // 播放位置附近的 bar 更亮
          const distanceFromPlayhead = Math.abs(x - playheadX);
          const isNearPlayhead = distanceFromPlayhead < barWidth * 3;
          
          return (
            <Line
              key={index}
              x1={x}
              y1={y1}
              x2={x}
              y2={y2}
              stroke={isPlayed ? (isNearPlayhead ? '#FFFFFF' : '#EDEDED') : '#5A5A5A'}
              strokeWidth={barWidth}
              strokeLinecap="round"
            />
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: waveformWidth,
    height: waveformHeight,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
});
