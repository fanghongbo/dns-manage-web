<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { getDnsUserRank } from '#/api/dns/task_stat';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

/**
 * 获取dns用户排行并渲染图表
 */
const fetchDnsUserRank = async () => {
  const res = await getDnsUserRank().catch((error) => {
    console.error(error);
    return null;
  });

  const rawData: Array<{ count: number; name: string }> =
    (Array.isArray(res) ? res : res?.data) ?? [];

  if (rawData.length === 0) {
    return;
  }

  const data = rawData
    .map((item) => ({ name: item.name, value: item.count }))
    .toSorted((a, b) => a.value - b.value);

  renderEcharts({
    series: [
      {
        animationDelay() {
          return Math.random() * 400;
        },
        animationEasing: 'exponentialInOut',
        animationType: 'scale',
        center: ['50%', '50%'],
        color: ['#5ab1ef', '#b6a2de', '#67e0e3', '#2ec7c9'],
        data,
        name: '操作占比',
        radius: '80%',
        roseType: 'radius',
        type: 'pie',
      },
    ],
    tooltip: {
      trigger: 'item',
    },
  });
};

onMounted(() => {
  fetchDnsUserRank();
});
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
