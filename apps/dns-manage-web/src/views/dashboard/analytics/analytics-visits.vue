<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { getDnsStatTrend } from '#/api/dns/task_stat';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

/**
 * 获取dns记录趋势并渲染图表
 */
const fetchDnsRecordTrend = async () => {
  const res = await getDnsStatTrend().catch((error) => {
    console.error(error);
    return null;
  });

  const times: string[] = res?.times ?? res?.data?.times ?? [];
  const records: number[] = res?.records ?? res?.data?.records ?? [];

  if (times.length === 0 || records.length === 0) {
    // 没有数据时直接返回，保留空图
    return;
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
        name: '记录数',
        barMaxWidth: 80,
        data: records,
        type: 'bar',
      },
    ],
    tooltip: {
      axisPointer: {
        lineStyle: {
          // color: '#4f69fd',
          width: 1,
        },
      },
      trigger: 'axis',
    },
    xAxis: {
      data: times,
      type: 'category',
    },
    yAxis: {
      splitNumber: 4,
      type: 'value',
    },
  });
};

onMounted(() => {
  fetchDnsRecordTrend();
});
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
