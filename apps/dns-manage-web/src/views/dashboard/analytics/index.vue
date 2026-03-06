<script lang="ts" setup>
import type { AnalysisOverviewItem } from '@vben/common-ui';
import type { TabOption } from '@vben/types';

import { onMounted, ref } from 'vue';

import {
  AnalysisChartCard,
  AnalysisChartsTabs,
  AnalysisOverview,
} from '@vben/common-ui';
import {
  SvgBellIcon,
  SvgCakeIcon,
  SvgCardIcon,
  SvgDownloadIcon,
} from '@vben/icons';

import { getDnsStatOverview } from '#/api/dns/task_stat';

import AnalyticsTrends from './analytics-trends.vue';
import AnalyticsVisitsData from './analytics-visits-data.vue';
import AnalyticsVisitsSales from './analytics-visits-sales.vue';
import AnalyticsVisitsSource from './analytics-visits-source.vue';
import AnalyticsVisits from './analytics-visits.vue';

const overviewItems = ref<AnalysisOverviewItem[]>([
  {
    icon: SvgCardIcon,
    title: '域名变更',
    totalTitle: '总域名数',
    totalValue: 0,
    value: 0,
  },
  {
    icon: SvgCakeIcon,
    title: 'DNS记录变更',
    totalTitle: '总DNS记录数',
    totalValue: 0,
    value: 0,
  },
  {
    icon: SvgBellIcon,
    title: '本周任务',
    totalTitle: '总任务数',
    totalValue: 0,
    value: 0,
  },
  {
    icon: SvgDownloadIcon,
    title: '执行成功率',
    totalTitle: '总成功率数',
    totalValue: 0,
    value: 0,
  },
]);

onMounted(async () => {
  try {
    const res = await getDnsStatOverview();
    console.warn(res);
    const [item0, item1, item2, item3] = overviewItems.value;
    overviewItems.value = [
      {
        icon: item0!.icon,
        title: item0!.title,
        totalTitle: item0!.totalTitle,
        totalValue: res.domainStat?.total || 0,
        value: res.domainStat?.value || 0,
      },
      {
        icon: item1!.icon,
        title: item1!.title,
        totalTitle: item1!.totalTitle,
        totalValue: res.domainRecordStat?.total || 0,
        value: res.domainRecordStat?.value || 0,
      },
      {
        icon: item2!.icon,
        title: item2!.title,
        totalTitle: item2!.totalTitle,
        totalValue: res.taskStat?.total || 0,
        value: res.taskStat?.value || 0,
      },
      {
        icon: item3!.icon,
        title: item3!.title,
        totalTitle: item3!.totalTitle,
        totalValue: res.taskRate?.total || 0,
        value: res.taskRate?.value || 0,
      },
    ];
  } catch {
    // 接口失败时保持初始 0 值
  }
});

const chartTabs: TabOption[] = [
  {
    label: '变更趋势',
    value: 'trends',
  },
  {
    label: '统计分析',
    value: 'visits',
  },
];
</script>

<template>
  <div class="p-5">
    <AnalysisOverview :items="overviewItems" />
    <AnalysisChartsTabs :tabs="chartTabs" class="mt-5">
      <template #trends>
        <AnalyticsTrends />
      </template>
      <template #visits>
        <AnalyticsVisits />
      </template>
    </AnalysisChartsTabs>

    <div class="mt-5 w-full md:flex">
      <AnalysisChartCard class="mt-5 md:mr-4 md:mt-0 md:w-1/3" title="DNS分布">
        <AnalyticsVisitsData />
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mr-4 md:mt-0 md:w-1/3" title="域名排行">
        <AnalyticsVisitsSource />
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mt-0 md:w-1/3" title="用户排行">
        <AnalyticsVisitsSales />
      </AnalysisChartCard>
    </div>
  </div>
</template>
