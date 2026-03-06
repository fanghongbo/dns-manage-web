<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { DnsAnalysisApi } from '#/api/dns/analysis';

import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getDnsAnalysisList } from '#/api/dns/analysis';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';

const router = useRouter();

// @ts-expect-error ignore error
const [Grid] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [
      [
        'createdTime',
        ['startTime', 'endTime'],
        (value: any) => {
          // 将 dayjs 对象转换为时间戳（毫秒）
          return dayjs.isDayjs(value) ? value.valueOf() : value;
        },
      ],
    ],
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getDnsAnalysisList({
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
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<DnsAnalysisApi.DnsAnalysis>,
});

function onActionClick(e: OnActionClickParams<DnsAnalysisApi.DnsAnalysis>) {
  switch (e.code) {
    case 'record': {
      onRecord(e.row);
      break;
    }
  }
}

function onRecord(row: DnsAnalysisApi.DnsAnalysis) {
  router.push(`/dns/analysis/${row.id}/record/list`);
}
</script>
<template>
  <Page auto-content-height>
    <Grid :table-title="$t('dns.analysis.list')" />
  </Page>
</template>
