<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { getDnsStatRank } from '#/api/dns/task_stat';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

/**
 * 获取dns域名排行并渲染图表
 */
const fetchDnsStatRank = async () => {
  const res = await getDnsStatRank().catch((error) => {
    console.error(error);
    return null;
  });

  const rawData: Array<{ count: number; name: string }> =
    (Array.isArray(res) ? res : res?.data) ?? [];

  if (rawData.length === 0) {
    return;
  }

  const data = rawData.map((item) => ({
    name: item.name,
    value: item.count,
  }));

  renderEcharts({
    // legend: {
    //   bottom: '2%',
    //   left: 'center',
    // },
    series: [
      {
        animationDelay() {
          return Math.random() * 100;
        },
        animationEasing: 'exponentialInOut',
        animationType: 'scale',
        avoidLabelOverlap: false,
        color: ['#5ab1ef', '#b6a2de', '#67e0e3', '#2ec7c9'],
        data,
        emphasis: {
          label: {
            fontSize: '12',
            fontWeight: 'bold',
            show: true,
          },
        },
        itemStyle: {
          borderRadius: 10,
          borderWidth: 2,
        },
        label: {
          position: 'outside',
          show: true,
        },
        labelLine: {
          show: true,
        },
        name: '域名解析记录数',
        radius: ['40%', '65%'],
        type: 'pie',
      },
    ],
    tooltip: {
      trigger: 'item',
    },
  });
};

onMounted(() => {
  fetchDnsStatRank();
});
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
