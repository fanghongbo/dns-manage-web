<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { useAccess } from '@vben/access';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { getDnsChangeTrend } from '#/api/dns/task_stat';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const { hasAccessByCodes } = useAccess();

onMounted(async () => {
  let times: string[] = [];
  let add: number[] = [];
  let update: number[] = [];
  let del: number[] = [];
  let total: number[] = [];

  // 检查是否有overview权限
  if (hasAccessByCodes(['dashboard.analytics'])) {
    const trend = await getDnsChangeTrend().catch((error) => {
      console.error(error);
      return null;
    });
    times = trend?.times ?? [];
    add = trend?.add ?? [];
    update = trend?.update ?? [];
    del = trend?.delete ?? [];
    total = times.map((_, idx) => {
      const a = add[idx] ?? 0;
      const u = update[idx] ?? 0;
      const d = del[idx] ?? 0;
      return a + u + d;
    });
  } else {
    // 没有权限的时候，生成空数据（保留 x 轴刻度）
    times = Array.from({ length: 18 }).map((_item, index) => `${index + 6}:00`);
    add = Array.from({ length: times.length }, () => 0);
    update = Array.from({ length: times.length }, () => 0);
    del = Array.from({ length: times.length }, () => 0);
    total = Array.from({ length: times.length }, () => 0);
  }

  renderEcharts({
    grid: {
      bottom: 0,
      containLabel: true,
      left: '1%',
      right: '1%',
      top: '2 %',
    },
    series: [
      {
        name: '新增',
        type: 'line',
        smooth: true,
        data: add,
        itemStyle: {
          color: '#3b82f6',
        },
      },
      {
        name: '更新',
        type: 'line',
        smooth: true,
        data: update,
        itemStyle: {
          color: '#10b981',
        },
      },
      {
        name: '删除',
        type: 'line',
        smooth: true,
        data: del,
        itemStyle: {
          color: '#f97316',
        },
      },
      {
        name: '总变更',
        type: 'line',
        smooth: true,
        data: total,
        itemStyle: {
          color: '#6366f1',
        },
      },
    ],
    tooltip: {
      axisPointer: {
        lineStyle: {
          color: '#019680',
          width: 1,
        },
      },
      trigger: 'axis',
    },
    xAxis: {
      axisTick: {
        show: false,
      },
      boundaryGap: false,
      data: times,
      splitLine: {
        lineStyle: {
          type: 'solid',
          width: 1,
        },
        show: true,
      },
      type: 'category',
    },
    yAxis: [
      {
        axisTick: {
          show: false,
        },
        splitArea: {
          show: true,
        },
        splitNumber: 4,
        type: 'value',
      },
    ],
  });
});
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
