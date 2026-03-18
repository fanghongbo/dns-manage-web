<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { getDnsTypeTrend } from '#/api/dns/task_stat';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

/**
 * 获取dns类型趋势并渲染图表
 */
const fetchDnsTypeTrend = async () => {
  const res = await getDnsTypeTrend().catch((error) => {
    console.error(error);
    return null;
  });

  const rawData: Array<{ count: number; name: string }> =
    (Array.isArray(res) ? res : res?.data) ?? [];

  const DEFAULT_TYPES = ['A', 'CNAME', 'MX', 'NS', 'TXT', 'SOA'];

  const apiTypes = rawData.map((item) => item.name);
  const typeSet = new Set<string>([...apiTypes, ...DEFAULT_TYPES]);
  const types = [...typeSet];

  const values = types.map((type) => {
    const found = rawData.find((item) => item.name === type);
    return found ? found.count : 0;
  });

  const maxValue = values.length > 0 ? Math.max(...values) || 1 : 1;

  renderEcharts({
    radar: {
      indicator: types.map((type) => ({
        name: type,
        max: maxValue,
      })),
      radius: '60%',
      splitNumber: 5,
    },
    series: [
      {
        areaStyle: {
          opacity: 0.6,
          shadowBlur: 0,
          shadowColor: 'rgba(0,0,0,.2)',
          shadowOffsetX: 0,
          shadowOffsetY: 10,
        },
        data: [
          {
            itemStyle: {
              color: '#4f46e5',
            },
            name: 'DNS记录类型分布',
            value: values,
          },
        ],
        itemStyle: {
          borderRadius: 10,
          borderWidth: 2,
        },
        symbolSize: 4,
        type: 'radar',
      },
    ],
    tooltip: {},
  });
};

onMounted(async () => {
  await fetchDnsTypeTrend();
});
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
