<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { DnsTaskRecordApi } from '#/api/dns/task_record';

import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';

import { Button, message, Space } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getDnsTaskRecordList } from '#/api/dns/task_record';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';

const route = useRoute();
const taskId = computed(() => route.params.taskId as string);
const hasSelectedRows = ref<boolean>(false);

// @ts-expect-error ignore error
const [Grid, gridApi] = useVbenVxeGrid({
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
    checkboxConfig: {
      highlight: true,
      reserve: true,
      showReserveStatus: true,
    },
    onCheckboxChange: ({
      records,
    }: {
      records: DnsTaskRecordApi.DnsTaskRecord[];
    }) => {
      hasSelectedRows.value = records.length > 0;
    },
    onPageChange: () => {
      const rows = getSelectedRows();
      hasSelectedRows.value = rows.length > 0;
    },
    onCheckboxAll: () => {
      const rows = getSelectedRows();
      hasSelectedRows.value = rows.length > 0;
    },
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getDnsTaskRecordList({
            taskId: taskId.value,
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
  } as VxeTableGridOptions<DnsTaskRecordApi.DnsTaskRecord>,
});

function getSelectedRows() {
  const reserveRecords = gridApi.grid.getCheckboxReserveRecords();
  const selectedRecords = gridApi.grid.getCheckboxRecords();

  return [...reserveRecords, ...selectedRecords];
}

function onActionClick(e: OnActionClickParams<DnsTaskRecordApi.DnsTaskRecord>) {
  switch (e.code) {
    case 'retry': {
      break;
    }
  }
}

function onBatchRetry() {
  const rows = getSelectedRows();
  if (rows.length === 0) {
    message.warning('请先选择要重试的记录');
    return;
  }
  console.warn(rows);
}
</script>
<template>
  <Page auto-content-height>
    <Grid :table-title="$t('dns.task.record.list')">
      <template #toolbar-tools>
        <Space>
          <Button
            type="primary"
            @click="onBatchRetry"
            v-if="hasSelectedRows === true"
          >
            {{ $t('ui.actionTitle.batchRetry') }}
          </Button>
        </Space>
      </template>
    </Grid>
  </Page>
</template>
