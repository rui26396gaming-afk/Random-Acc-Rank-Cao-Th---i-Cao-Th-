import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { HabitItem } from '../types';
import { TrendingUp, Flame, Calendar, Award, Sparkles, Info } from 'lucide-react';

interface HabitStreakChartProps {
  habits: HabitItem[];
}

interface DayData {
  dateStr: string;
  dayLabel: string;
  isToday: boolean;
  completionRate: number; // 0 to 100
  habitStatuses: {
    id: string;
    title: string;
    count: number;
    target: number;
    rate: number;
    completed: boolean;
  }[];
}

export const HabitStreakChart: React.FC<HabitStreakChartProps> = ({ habits }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(650);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]?.contentRect?.width) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const [tooltipData, setTooltipData] = useState<{
    visible: boolean;
    x: number;
    y: number;
    day: DayData | null;
    activeHabitTitle?: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    day: null,
  });

  const [chartMode, setChartMode] = useState<'matrix' | 'trend'>('matrix');

  // Generate 7-day data ending today
  const last7DaysData: DayData[] = React.useMemo(() => {
    const days: DayData[] = [];
    const today = new Date();

    // Day names in Vietnamese
    const weekdayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const isToday = i === 0;
      const dayLabel = isToday ? 'Hôm nay' : weekdayNames[d.getDay()];
      const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

      // Calculate past habit rates based on streaks & today's actual counts
      const habitStatuses = habits.map((h, hIdx) => {
        let count = h.currentCount;
        let rate = Math.min(1, count / (h.targetCount || 1));

        if (!isToday) {
          // For past days, simulate consistency based on their current streak
          // If streak >= (i), they completed it
          const completedInPast = h.streak >= i;
          if (completedInPast) {
            count = h.targetCount;
            rate = 1.0;
          } else {
            // Partial completion for variety
            const pseudorandom = ((hIdx * 17 + i * 23) % 10) / 10;
            count = Math.round(h.targetCount * Math.max(0.3, pseudorandom));
            rate = Math.min(1, count / (h.targetCount || 1));
          }
        }

        return {
          id: h.id,
          title: h.title,
          count,
          target: h.targetCount,
          rate,
          completed: rate >= 1,
        };
      });

      const totalCompleted = habitStatuses.filter((s) => s.completed).length;
      const avgRate = habits.length > 0
        ? Math.round((habitStatuses.reduce((acc, curr) => acc + curr.rate, 0) / habits.length) * 100)
        : 0;

      days.push({
        dateStr,
        dayLabel,
        isToday,
        completionRate: avgRate,
        habitStatuses,
      });
    }

    return days;
  }, [habits]);

  // Render D3 Visualization
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = containerWidth || container.clientWidth || 650;
    const height = chartMode === 'matrix' ? Math.max(260, habits.length * 48 + 80) : 260;
    const margin = { top: 30, right: 30, bottom: 45, left: chartMode === 'matrix' ? 140 : 50 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    svg.attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    if (chartMode === 'matrix') {
      // D3 MATRIX / HEATMAP VIEW
      const xScale = d3
        .scaleBand()
        .domain(last7DaysData.map((d) => d.dayLabel))
        .range([0, innerWidth])
        .padding(0.2);

      const yScale = d3
        .scaleBand()
        .domain(habits.map((h) => h.id))
        .range([0, innerHeight])
        .padding(0.25);

      // Color Scale from soft slate to deep vibrant emerald
      const colorScale = d3
        .scaleLinear<string>()
        .domain([0, 0.5, 1])
        .range(['#1e293b', '#065f46', '#10b981']);

      // X Axis (Days)
      const xAxis = d3.axisBottom(xScale).tickSize(0);
      const xAxisG = g
        .append('g')
        .attr('transform', `translate(0, ${innerHeight + 8})`)
        .call(xAxis);

      xAxisG.select('.domain').remove();
      xAxisG
        .selectAll('text')
        .attr('fill', (d, i) => (last7DaysData[i]?.isToday ? '#10b981' : '#94a3b8'))
        .attr('font-size', '11px')
        .attr('font-weight', (d, i) => (last7DaysData[i]?.isToday ? '800' : '600'));

      // Sub-label for date below day name
      xAxisG
        .selectAll('.tick')
        .append('text')
        .text((d, i) => last7DaysData[i]?.dateStr || '')
        .attr('y', 16)
        .attr('fill', '#64748b')
        .attr('font-size', '9px')
        .attr('text-anchor', 'middle');

      // Y Axis (Habit Names on the Left)
      const yAxis = d3
        .axisLeft(yScale)
        .tickFormat((id) => {
          const found = habits.find((h) => h.id === id);
          return found ? (found.title.length > 18 ? found.title.slice(0, 16) + '...' : found.title) : String(id);
        })
        .tickSize(0);

      const yAxisG = g.append('g').attr('transform', `translate(-12, 0)`).call(yAxis);
      yAxisG.select('.domain').remove();
      yAxisG
        .selectAll('text')
        .attr('fill', '#e2e8f0')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .attr('text-anchor', 'end');

      // Draw Grid Matrix Cells with D3 Transition
      habits.forEach((habit) => {
        last7DaysData.forEach((day) => {
          const status = day.habitStatuses.find((s) => s.id === habit.id);
          const cellX = xScale(day.dayLabel) || 0;
          const cellY = yScale(habit.id) || 0;
          const cellWidth = xScale.bandwidth();
          const cellHeight = yScale.bandwidth();

          const rate = status?.rate || 0;

          const cellGroup = g.append('g').attr('class', 'cell-group').style('cursor', 'pointer');

          // Background rect
          const rect = cellGroup
            .append('rect')
            .attr('x', cellX)
            .attr('y', cellY)
            .attr('width', cellWidth)
            .attr('height', cellHeight)
            .attr('rx', 8)
            .attr('fill', '#1e293b')
            .attr('stroke', day.isToday ? '#34d399' : '#334155')
            .attr('stroke-width', day.isToday ? 1.5 : 1)
            .attr('stroke-dasharray', day.isToday && rate < 1 ? '3,3' : 'none');

          // Animate fill color
          rect
            .transition()
            .duration(600)
            .attr('fill', colorScale(rate));

          // Inner checkmark or rate text
          if (rate >= 1) {
            cellGroup
              .append('text')
              .attr('x', cellX + cellWidth / 2)
              .attr('y', cellY + cellHeight / 2 + 4)
              .attr('text-anchor', 'middle')
              .attr('fill', '#ffffff')
              .attr('font-size', '12px')
              .attr('font-weight', '900')
              .text('✓');
          } else if (rate > 0) {
            cellGroup
              .append('text')
              .attr('x', cellX + cellWidth / 2)
              .attr('y', cellY + cellHeight / 2 + 3)
              .attr('text-anchor', 'middle')
              .attr('fill', '#a7f3d0')
              .attr('font-size', '10px')
              .attr('font-weight', '700')
              .text(`${Math.round(rate * 100)}%`);
          }

          // Tooltip Events
          cellGroup
            .on('mouseenter', (event: MouseEvent) => {
              const bounds = container.getBoundingClientRect();
              setTooltipData({
                visible: true,
                x: event.clientX - bounds.left,
                y: event.clientY - bounds.top - 10,
                day,
                activeHabitTitle: habit.title,
              });
              d3.select(event.currentTarget as SVGGElement).select('rect').attr('stroke', '#38bdf8').attr('stroke-width', 2);
            })
            .on('mouseleave', (event: MouseEvent) => {
              setTooltipData((prev) => ({ ...prev, visible: false }));
              d3.select(event.currentTarget as SVGGElement)
                .select('rect')
                .attr('stroke', day.isToday ? '#34d399' : '#334155')
                .attr('stroke-width', day.isToday ? 1.5 : 1);
            });
        });
      });
    } else {
      // D3 TREND AREA & LINE CHART VIEW
      const xScale = d3
        .scalePoint()
        .domain(last7DaysData.map((d) => d.dayLabel))
        .range([0, innerWidth])
        .padding(0.1);

      const yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);

      // Grid lines
      const yAxisGrid = d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(() => '').ticks(4);
      g.append('g').attr('class', 'grid').call(yAxisGrid).selectAll('line').attr('stroke', '#334155').attr('stroke-opacity', 0.4);
      g.select('.grid .domain').remove();

      // Area generator
      const area = d3
        .area<DayData>()
        .x((d) => xScale(d.dayLabel) || 0)
        .y0(innerHeight)
        .y1((d) => yScale(d.completionRate))
        .curve(d3.curveMonotoneX);

      // Line generator
      const line = d3
        .line<DayData>()
        .x((d) => xScale(d.dayLabel) || 0)
        .y((d) => yScale(d.completionRate))
        .curve(d3.curveMonotoneX);

      // Gradient definition for area
      const defs = svg.append('defs');
      const gradient = defs
        .append('linearGradient')
        .attr('id', 'area-gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      gradient.append('stop').attr('offset', '0%').attr('stop-color', '#10b981').attr('stop-opacity', 0.45);
      gradient.append('stop').attr('offset', '100%').attr('stop-color', '#10b981').attr('stop-opacity', 0.0);

      // Draw Area
      g.append('path')
        .datum(last7DaysData)
        .attr('fill', 'url(#area-gradient)')
        .attr('d', area);

      // Draw Line
      const path = g
        .append('path')
        .datum(last7DaysData)
        .attr('fill', 'none')
        .attr('stroke', '#10b981')
        .attr('stroke-width', 3)
        .attr('d', line);

      // Path transition
      const totalLength = (path.node() as SVGPathElement)?.getTotalLength() || 600;
      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1000)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);

      // Draw Data Points / Dots
      last7DaysData.forEach((d) => {
        const cx = xScale(d.dayLabel) || 0;
        const cy = yScale(d.completionRate);

        const dotGroup = g.append('g').style('cursor', 'pointer');

        // Outer glow
        dotGroup
          .append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', d.isToday ? 7 : 5)
          .attr('fill', d.isToday ? '#34d399' : '#10b981')
          .attr('stroke', '#0f172a')
          .attr('stroke-width', 2);

        // Value text above dot
        dotGroup
          .append('text')
          .attr('x', cx)
          .attr('y', cy - 10)
          .attr('text-anchor', 'middle')
          .attr('fill', '#e2e8f0')
          .attr('font-size', '10px')
          .attr('font-weight', '700')
          .text(`${d.completionRate}%`);

        dotGroup
          .on('mouseenter', (event) => {
            const bounds = container.getBoundingClientRect();
            setTooltipData({
              visible: true,
              x: event.clientX - bounds.left,
              y: event.clientY - bounds.top - 10,
              day: d,
            });
          })
          .on('mouseleave', () => {
            setTooltipData((prev) => ({ ...prev, visible: false }));
          });
      });

      // X Axis
      const xAxis = d3.axisBottom(xScale).tickSize(0);
      const xAxisG = g.append('g').attr('transform', `translate(0, ${innerHeight + 10})`).call(xAxis);
      xAxisG.select('.domain').remove();
      xAxisG
        .selectAll('text')
        .attr('fill', (d, i) => (last7DaysData[i]?.isToday ? '#10b981' : '#94a3b8'))
        .attr('font-size', '11px')
        .attr('font-weight', (d, i) => (last7DaysData[i]?.isToday ? '800' : '600'));

      // Y Axis
      const yAxis = d3.axisLeft(yScale).ticks(4).tickFormat((d) => `${d}%`);
      const yAxisG = g.append('g').call(yAxis);
      yAxisG.select('.domain').remove();
      yAxisG.selectAll('text').attr('fill', '#64748b').attr('font-size', '10px');
    }
  }, [habits, last7DaysData, chartMode, containerWidth]);

  // Overall 7-Day Consistency Metrics
  const avgWeeklyRate = Math.round(
    last7DaysData.reduce((acc, curr) => acc + curr.completionRate, 0) / last7DaysData.length
  );
  const bestHabit = [...habits].sort((a, b) => b.streak - a.streak)[0];

  return (
    <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-md space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white">
              Biểu Đồ Chuỗi Thói Quen 7 Ngày (D3 Habit Analytics)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Trực quan hóa tỷ lệ hoàn thành và chuỗi streak bền bỉ của bạn trong 7 ngày qua.
          </p>
        </div>

        {/* View Switcher: Matrix Heatmap vs Line Trend */}
        <div className="flex items-center bg-slate-800 p-1 rounded-2xl border border-slate-700">
          <button
            onClick={() => setChartMode('matrix')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
              chartMode === 'matrix'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Ma Trận Heatmap
          </button>
          <button
            onClick={() => setChartMode('trend')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
              chartMode === 'trend'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Xu Hướng Tỷ Lệ (%)
          </button>
        </div>
      </div>

      {/* KPI Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
          <span className="text-[10px] font-bold uppercase text-slate-400">Tỷ lệ duy trì tuần</span>
          <div className="text-xl font-black text-emerald-400 mt-0.5">{avgWeeklyRate}%</div>
          <span className="text-[10px] text-slate-500">Mục tiêu đạt chuẩn</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
          <span className="text-[10px] font-bold uppercase text-slate-400">Streak kỷ lục</span>
          <div className="text-xl font-black text-orange-400 mt-0.5 flex items-center gap-1">
            <Flame className="w-4 h-4 fill-orange-400" />
            <span>{bestHabit?.streak || 7}d</span>
          </div>
          <span className="text-[10px] text-slate-400 truncate block">{bestHabit?.title || 'Uống nước'}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
          <span className="text-[10px] font-bold uppercase text-slate-400">Hôm nay</span>
          <div className="text-xl font-black text-teal-400 mt-0.5">
            {last7DaysData[6]?.completionRate || 0}%
          </div>
          <span className="text-[10px] text-slate-500">Tiến độ ngày hiện tại</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
          <span className="text-[10px] font-bold uppercase text-slate-400">Tổng thói quen</span>
          <div className="text-xl font-black text-indigo-400 mt-0.5">{habits.length}</div>
          <span className="text-[10px] text-slate-500">Đang theo dõi</span>
        </div>
      </div>

      {/* D3 SVG Container with relative Tooltip */}
      <div ref={containerRef} className="relative w-full overflow-x-auto pt-2">
        <svg ref={svgRef} className="w-full select-none" />

        {/* Interactive Floating Tooltip */}
        {tooltipData.visible && tooltipData.day && (
          <div
            className="absolute z-30 pointer-events-none p-3 rounded-2xl bg-slate-950/95 border border-slate-700 shadow-xl text-xs text-white max-w-xs backdrop-blur-md animate-in fade-in zoom-in-95"
            style={{
              left: Math.min(tooltipData.x + 10, (containerRef.current?.clientWidth || 500) - 180),
              top: Math.max(10, tooltipData.y - 80),
            }}
          >
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800">
              <span className="font-bold text-emerald-400">
                {tooltipData.day.dayLabel} ({tooltipData.day.dateStr})
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                {tooltipData.day.completionRate}%
              </span>
            </div>

            {tooltipData.activeHabitTitle ? (
              <div>
                <span className="text-slate-400 block text-[10px]">Thói quen:</span>
                <span className="font-bold text-white">{tooltipData.activeHabitTitle}</span>
                {(() => {
                  const item = tooltipData.day.habitStatuses.find(
                    (s) => s.title === tooltipData.activeHabitTitle
                  );
                  return (
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-300">
                      <span>Đạt: {item?.count}/{item?.target}</span>
                      <span className={item?.completed ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                        {item?.completed ? '✓ Hoàn thành' : `${Math.round((item?.rate || 0) * 100)}%`}
                      </span>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="space-y-1">
                {tooltipData.day.habitStatuses.map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-3 text-[11px]">
                    <span className="text-slate-300 truncate max-w-[120px]">{s.title}:</span>
                    <span className={s.completed ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                      {s.count}/{s.target} ({Math.round(s.rate * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend & Guide */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-300">Mức độ hoàn thành:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700 inline-block" />
            <span>0%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-900 inline-block" />
            <span>50%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
            <span>100% (Đạt chuẩn)</span>
          </span>
        </div>
        <span className="text-slate-500 italic mt-1 sm:mt-0">
          💡 Rê chuột vào từng ô để xem chi tiết tiến độ từng ngày
        </span>
      </div>
    </div>
  );
};
