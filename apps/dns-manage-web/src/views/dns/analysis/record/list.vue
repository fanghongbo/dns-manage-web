<!-- eslint-disable prettier/prettier -->
<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DnsAnalysisApi } from '#/api/dns/analysis';
import type { DnsAnalysisRecordApi } from '#/api/dns/analysis_record';

import { computed, nextTick, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';

import { Tabs } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getDnsAnalysisCompareOptions } from '#/api/dns/analysis';
import { getDnsAnalysisRecordList } from '#/api/dns/analysis_record';
import { $t } from '#/locales';

import { useColumns } from './data';

const route = useRoute();
const analysisId = computed(() => route.params.analysisId as string);

/** 对比选项（从后端获取），tab 文案为 sourceName + '-' + targetName */
const compareOptions = ref<DnsAnalysisApi.CompareItem[]>([]);
const activeCompareKey = ref<string>('');
const compareOptionsLoading = ref(false);

function getCompareItemKey(item: DnsAnalysisApi.CompareItem) {
  return `${item.sourceId}_${item.targetId}`;
}

function getCompareTabLabel(item: DnsAnalysisApi.CompareItem) {
  if (item.sourceName === 'local') {
    return `${$t('dns.analysis.local')} / ${item.targetName}`;
  }

  return `${item.sourceName} / ${item.targetName}`;
}

function getActiveCompareItem() {
  // 如果 activeCompareKey 为空且有选项，返回第一项（默认选中第一项）
  if (!activeCompareKey.value && compareOptions.value.length > 0) {
    return compareOptions.value[0];
  }
  // 查找匹配的项，如果找不到且有选项，返回第一项作为默认值
  const found = compareOptions.value.find(
    (o) => getCompareItemKey(o) === activeCompareKey.value,
  );
  return (
    found ??
    (compareOptions.value.length > 0 ? compareOptions.value[0] : undefined)
  );
}

async function fetchCompareOptions() {
  if (!analysisId.value) return;
  compareOptionsLoading.value = true;
  try {
    const list = await getDnsAnalysisCompareOptions(analysisId.value);
    compareOptions.value = Array.isArray(list) ? list : [];
    // 页面初始化时，默认选中第一项
    if (compareOptions.value.length > 0) {
      const first = compareOptions.value[0];
      // 如果 activeCompareKey 为空或不在选项中，设置为第一项
      if (
        first &&
        (!activeCompareKey.value ||
          !compareOptions.value.some(
            (o) => getCompareItemKey(o) === activeCompareKey.value,
          ))
      ) {
        activeCompareKey.value = getCompareItemKey(first);
      }
    }
  } catch {
    compareOptions.value = [];
  } finally {
    compareOptionsLoading.value = false;
    if (compareOptions.value.length > 0) {
      nextTick(() => {
        gridApiDiff0.reload();
        gridApiDiff1.reload();
        gridApiDiff2.reload();
      });
    }
  }
}

// @ts-expect-error ignore error
const [GridDiff0, gridApiDiff0] = useVbenVxeGrid({
  // formOptions: {
  //   fieldMappingTime: [
  //     [
  //       'createdTime',
  //       ['startTime', 'endTime'],
  //       (value: any) => {
  //         // 将 dayjs 对象转换为时间戳（毫秒）
  //         return dayjs.isDayjs(value) ? value.valueOf() : value;
  //       },
  //     ],
  //   ],
  //   schema: useGridFormSchema(),
  //   submitOnChange: true,
  // },
  gridOptions: {
    columns: useColumns(),
    // height: 'auto',
    keepSource: true,
    emptyText: $t('dns.analysis.record.emptyText'),
    proxyConfig: {
      autoLoad: false, // 禁用自动加载，等待对比选项加载完成后再手动触发
      ajax: {
        query: async ({ page }, formValues) => {
          const active = getActiveCompareItem();
          return await getDnsAnalysisRecordList({
            analysisId: analysisId.value,
            sourceId: active?.sourceId,
            targetId: active?.targetId,
            diffStatus: 0,
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },

    toolbarConfig: {
      custom: false,
      export: false,
      refresh: true,
      search: false,
      zoom: true,
    },
  } as VxeTableGridOptions<DnsAnalysisRecordApi.DnsAnalysisRecord>,
});

// @ts-expect-error ignore error
const [GridDiff1, gridApiDiff1] = useVbenVxeGrid({
  // formOptions: {
  //   fieldMappingTime: [
  //     [
  //       'createdTime',
  //       ['startTime', 'endTime'],
  //       (value: any) => {
  //         // 将 dayjs 对象转换为时间戳（毫秒）
  //         return dayjs.isDayjs(value) ? value.valueOf() : value;
  //       },
  //     ],
  //   ],
  //   schema: useGridFormSchema(),
  //   submitOnChange: true,
  // },
  gridOptions: {
    columns: useColumns(),
    // height: 'auto',
    keepSource: true,
    emptyText: $t('dns.analysis.record.emptyText'),
    proxyConfig: {
      autoLoad: false, // 禁用自动加载，等待对比选项加载完成后再手动触发
      ajax: {
        query: async ({ page }, formValues) => {
          const active = getActiveCompareItem();
          return await getDnsAnalysisRecordList({
            analysisId: analysisId.value,
            sourceId: active?.sourceId,
            targetId: active?.targetId,
            diffStatus: 1,
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },

    toolbarConfig: {
      custom: false,
      export: false,
      refresh: true,
      search: false,
      zoom: true,
    },
  } as VxeTableGridOptions<DnsAnalysisRecordApi.DnsAnalysisRecord>,
});

// @ts-expect-error ignore error
const [GridDiff2, gridApiDiff2] = useVbenVxeGrid({
  // formOptions: {
  //   fieldMappingTime: [
  //     [
  //       'createdTime',
  //       ['startTime', 'endTime'],
  //       (value: any) => {
  //         // 将 dayjs 对象转换为时间戳（毫秒）
  //         return dayjs.isDayjs(value) ? value.valueOf() : value;
  //       },
  //     ],
  //   ],
  //   schema: useGridFormSchema(),
  //   submitOnChange: true,
  // },
  gridOptions: {
    columns: useColumns(),
    // height: 'auto',
    keepSource: true,
    emptyText: $t('dns.analysis.record.emptyText'),
    proxyConfig: {
      autoLoad: false, // 禁用自动加载，等待对比选项加载完成后再手动触发
      ajax: {
        query: async ({ page }, formValues) => {
          const active = getActiveCompareItem();
          return await getDnsAnalysisRecordList({
            analysisId: analysisId.value,
            sourceId: active?.sourceId,
            targetId: active?.targetId,
            diffStatus: 2,
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },

    toolbarConfig: {
      custom: false,
      export: false,
      refresh: true,
      search: false,
      zoom: true,
    },
  } as VxeTableGridOptions<DnsAnalysisRecordApi.DnsAnalysisRecord>,
});

onMounted(() => fetchCompareOptions());

function onCompareTabChange(key: number | string) {
  activeCompareKey.value = String(key);
  gridApiDiff0.reload();
  gridApiDiff1.reload();
  gridApiDiff2.reload();
}

function renderTableTitle(diffStatus: number) {
  const active = getActiveCompareItem();
  if (!active) return '';
  let sourceName = active.sourceName;
  if (active.sourceName === 'local') {
    sourceName = $t('dns.analysis.local');
  }

  if (diffStatus === 0) {
    return $t('dns.analysis.diff0', { sourceName, targetName: active.targetName });
  }
  if (diffStatus === 1) {
    return $t('dns.analysis.diff1', { sourceName, targetName: active.targetName });
  }
  if (diffStatus === 2) {
    return $t('dns.analysis.diff2', { sourceName, targetName: active.targetName });
  }
  return '';
}
</script>
<template>
  <Page>
    <div class="flex min-h-0 flex-col">
      <Tabs
        v-if="compareOptions.length > 0 && !compareOptionsLoading"
        v-model:active-key="activeCompareKey"
        class="border-border bg-card px-4"
        type="line"
        @change="onCompareTabChange"
      >
        <Tabs.TabPane
          v-for="opt in compareOptions"
          :key="getCompareItemKey(opt)"
          :tab="getCompareTabLabel(opt)"
        />
      </Tabs>
      <!-- 对比表格 class="mb-4" -->
      <GridDiff0 :table-title="renderTableTitle(0)" />
      <GridDiff1 :table-title="renderTableTitle(1)" />
      <GridDiff2 :table-title="renderTableTitle(2)" />
    </div>
  </Page>
</template>
