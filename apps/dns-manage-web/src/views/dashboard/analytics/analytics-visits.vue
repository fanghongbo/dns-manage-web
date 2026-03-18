<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { useAccess } from '@vben/access';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { getDnsStatTrend } from '#/api/dns/task_stat';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const { hasAccessByCodes } = useAccess();

/**
 * 获取dns记录趋势并渲染图表
 */
const fetchDnsRecordTrend = async () => {
  let times: string[] = [];
  let records: number[] = [];

  // 无权限时返回默认空数据
  if (hasAccessByCodes(['dashboard.analytics'])) {
    const res = await getDnsStatTrend().catch((error) => {
      console.error(error);
      return null;
    });

    times = res?.times ?? res?.data?.times ?? [];
    records = res?.records ?? res?.data?.records ?? [];

    // 接口无数据时也渲染默认空数据
    if (times.length === 0 || records.length === 0) {
      times = Array.from({ length: 12 }).map(
        (_item, index) => `${index + 1}月`,
      );
      records = Array.from({ length: times.length }, () => 0);
    }
  } else {
    times = Array.from({ length: 12 }).map((_item, index) => `${index + 1}月`);
    records = Array.from({ length: times.length }, () => 0);
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
