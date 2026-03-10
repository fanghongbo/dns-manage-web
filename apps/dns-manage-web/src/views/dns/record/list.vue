<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { DnsRecordApi } from '#/api/dns/record';

import { computed, nextTick, onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon, Plus } from '@vben/icons';

import { Button, message, Modal, Select, Space, Table } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getDnsDomainInfo } from '#/api/dns/domain';
import { getDnsProviders } from '#/api/dns/provider';
import {
  batchDnsRecords,
  checkDnsRecord,
  deleteDnsRecord,
  getDnsRecordList,
  pullDnsRecords,
  pushDnsRecords,
  updateDnsRecordStatus,
} from '#/api/dns/record';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import CheckStatusModal from './modules/check_status_modal.vue';
import CreateForm from './modules/create_form.vue';
import TaskStatusModal from './modules/task_status_modal.vue';
import UpdateForm from './modules/update_form.vue';

const route = useRoute();
const domainId = computed(() => route.params.domainId as string);

const [CreateFormDrawer, createFormDrawerApi] = useVbenDrawer({
  connectedComponent: CreateForm,
  destroyOnClose: true,
});

const [UpdateFormDrawer, updateFormDrawerApi] = useVbenDrawer({
  connectedComponent: UpdateForm,
  destroyOnClose: true,
});

// 任务状态模态框
const taskStatusModalOpen = ref(false);
const taskStatusTaskId = ref<number | string>();

// DNS 记录状态检查模态框
const checkStatusModalOpen = ref(false);
const checkStatusLoading = ref(false);
const checkStatusData = ref<
  Array<{
    id: string;
    providerName: string;
    status: number;
  }>
>([]);

onBeforeMount(() => {
  nextTick(() => {
    loadRecordInfo();
  });
});

const recordInfo = ref<Recordable<any>>({});
const hasSelectedRows = ref<boolean>(false);

// 批量操作确认模态框
const batchConfirmVisible = ref(false);
const batchConfirmTitle = ref('');
const batchConfirmData = ref<DnsRecordApi.DnsRecord[]>([]);
const batchConfirmAction = ref<'delete' | 'disable' | 'enable' | null>(null);

async function loadRecordInfo() {
  try {
    const res = await getDnsDomainInfo(domainId.value);
    recordInfo.value = res;
  } catch (error) {
    console.error('Failed to load record info:', error);
  }
}

// @ts-expect-error ignore
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
    onCheckboxChange: ({ records }: { records: DnsRecordApi.DnsRecord[] }) => {
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
    columns: useColumns(onActionClick, onStatusChange),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getDnsRecordList({
            domainId: domainId.value,
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
  } as VxeTableGridOptions<DnsRecordApi.DnsRecord>,
});

function onActionClick(e: OnActionClickParams<DnsRecordApi.DnsRecord>) {
  switch (e.code) {
    case 'check': {
      onEffectCheck(e.row);
      break;
    }
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
    case 'test': {
      onTestPing(e.row);
      break;
    }
  }
}

/**
 * 将Antd的Modal.confirm封装为promise，方便在异步函数中调用。
 * @param content 提示内容
 * @param title 提示标题
 */
function confirm(content: string, title: string) {
  return new Promise((reslove, reject) => {
    Modal.confirm({
      content,
      onCancel() {
        reject(new Error('已取消'));
      },
      onOk() {
        reslove(true);
      },
      title,
    });
  });
}

/**
 * 验证记录类型是否支持编辑
 * @param row 行数据
 * @returns 返回true则支持编辑，返回false则不支持编辑
 */
function validateRecordType(row: DnsRecordApi.DnsRecord) {
  return (
    row.recordType === 'A' ||
    row.recordType === 'AAAA' ||
    row.recordType === 'CNAME' ||
    row.recordType === 'TXT' ||
    row.recordType === 'MX' ||
    row.recordType === 'NS'
  );
}

/**
 * 状态开关即将改变
 * @param newStatus 期望改变的状态值
 * @param row 行数据
 * @returns 返回false则中止改变，返回其他值（undefined、true）则允许改变
 */
async function onStatusChange(newStatus: number, row: DnsRecordApi.DnsRecord) {
  // 目前仅支持A、CNAME、TXT记录的状态切换，其他记录类型不支持状态切换
  if (!validateRecordType(row)) {
    message.error('当前记录类型不支持状态切换');
    return false;
  }
  const status: Recordable<string> = {
    0: '禁用',
    1: '启用',
  };
  try {
    await confirm(
      `你要将${row.host}的状态切换为 【${status[newStatus.toString()]}】 吗？`,
      `切换状态`,
    );
    await updateDnsRecordStatus(row.id, { status: newStatus }).then(
      (res: any) => {
        if (res?.taskId) {
          // 打开任务状态模态框
          taskStatusTaskId.value = res.taskId;
          taskStatusModalOpen.value = true;
        }
      },
    );
    return true;
  } catch {
    return false;
  }
}

function onEdit(row: DnsRecordApi.DnsRecord) {
  if (!validateRecordType(row)) {
    message.error('当前记录类型不支持编辑');
    return;
  }
  updateFormDrawerApi.setData(row).open();
}

function onDelete(row: DnsRecordApi.DnsRecord) {
  if (!validateRecordType(row)) {
    message.error('当前记录类型不支持删除');
    return;
  }
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.recordHost]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteDnsRecord(row.id)
    .then((res: any) => {
      gridApi.grid.clearCheckboxRow();
      gridApi.grid.clearCheckboxReserve();
      hasSelectedRows.value = false;
      if (res?.taskId) {
        // 打开任务状态模态框
        taskStatusTaskId.value = res.taskId;
        taskStatusModalOpen.value = true;
      }
      onRefresh();
    })
    .finally(() => {
      hideLoading();
    });
}

function onEffectCheck(row: DnsRecordApi.DnsRecord) {
  // 先打开模态框
  checkStatusModalOpen.value = true;
  checkStatusLoading.value = true;
  checkStatusData.value = [];

  // 然后请求接口
  checkDnsRecord(row.id)
    .then((res: any) => {
      if (res && Array.isArray(res)) {
        checkStatusData.value = res;
      } else {
        message.error('获取DNS记录状态失败');
        checkStatusData.value = [];
      }
    })
    .catch((error) => {
      console.error('检查DNS记录状态失败:', error);
      message.error('检查DNS记录状态失败');
      checkStatusData.value = [];
    })
    .finally(() => {
      checkStatusLoading.value = false;
    });
}

function onTestPing(row: DnsRecordApi.DnsRecord) {
  const host = `${row.host}.${recordInfo.value?.domainName}`;
  const type = row.recordType;
  if (!host || !type) {
    return;
  }
  window.open(
    `https://boce.aliyun.com/detect/dns?target=${host}&type=${type}`,
    '_blank',
  );
}

function onRefresh() {
  gridApi.query();
}

function handleTaskCreated(taskId: number | string) {
  if (!taskId) {
    return;
  }
  // 打开任务状态模态框
  taskStatusTaskId.value = taskId;
  taskStatusModalOpen.value = true;
}

function handleTaskUpdated(taskId: number | string) {
  if (!taskId) {
    return;
  }
  // 打开任务状态模态框
  taskStatusTaskId.value = taskId;
  taskStatusModalOpen.value = true;
}

function onCreate() {
  createFormDrawerApi.setData({}).open();
}

const pullLoading = ref(false);
const pushLoading = ref(false);

// 拉取/推送服务商选择模态框
const providerSelectModalOpen = ref(false);
const providerSelectMode = ref<'pull' | 'push'>('pull');
const selectedProviderId = ref<string>('');
const providerSelectOptions = ref<Array<{ label: string; value: string }>>([]);
const providerSelectLoading = ref(false);

async function openProviderSelectModal(mode: 'pull' | 'push') {
  const rawProviders = recordInfo.value?.providers ?? [];
  const domainProviderIds = rawProviders.map((p: any) =>
    typeof p === 'object' ? (p.id ?? p) : p,
  );
  if (domainProviderIds.length === 0) {
    message.warning('当前域名未绑定服务商');
    return;
  }
  providerSelectMode.value = mode;
  providerSelectLoading.value = true;
  providerSelectModalOpen.value = true;
  try {
    const allProviders = await getDnsProviders();
    const idSet = new Set(domainProviderIds.map(String));
    providerSelectOptions.value = allProviders
      .filter((p) => idSet.has(String(p.id)))
      .map((p) => ({
        label: p.name ?? p.providerName ?? String(p.id),
        value: String(p.id),
      }));
    selectedProviderId.value = providerSelectOptions.value[0]?.value ?? '';
  } catch {
    message.error('获取服务商列表失败');
    closeProviderSelectModal();
  } finally {
    providerSelectLoading.value = false;
  }
}

function closeProviderSelectModal() {
  providerSelectModalOpen.value = false;
  selectedProviderId.value = '';
  providerSelectOptions.value = [];
}

function onPull() {
  openProviderSelectModal('pull');
}

function onPush() {
  openProviderSelectModal('push');
}

function handleProviderSelectConfirm() {
  const providerId = selectedProviderId.value;
  if (!providerId) {
    message.warning('请选择服务商');
    return;
  }
  const isPull = providerSelectMode.value === 'pull';
  if (isPull) {
    pullLoading.value = true;
  } else {
    pushLoading.value = true;
  }
  closeProviderSelectModal();

  const apiCall = isPull
    ? pullDnsRecords(domainId.value, providerId)
    : pushDnsRecords(domainId.value, providerId);

  apiCall
    .then((res: any) => {
      onRefresh();
      if (res?.taskId) {
        taskStatusTaskId.value = res.taskId;
        taskStatusModalOpen.value = true;
      }
    })
    .catch(() => {
      console.error('拉取/推送DNS记录失败');
    })
    .finally(() => {
      pullLoading.value = false;
      pushLoading.value = false;
    });
}

const providerSelectModalTitle = computed(() =>
  providerSelectMode.value === 'pull'
    ? $t('dns.record.selectProviderToPull')
    : $t('dns.record.selectProviderToPush'),
);

function getSelectedRows() {
  const reserveRecords = gridApi.grid.getCheckboxReserveRecords();
  const selectedRecords = gridApi.grid.getCheckboxRecords();

  return [...reserveRecords, ...selectedRecords];
}

function showBatchConfirm(
  rows: DnsRecordApi.DnsRecord[],
  action: 'delete' | 'disable' | 'enable',
) {
  // 过滤出支持操作的记录类型
  const validRows = rows.filter((row) => validateRecordType(row));
  if (validRows.length === 0) {
    message.error('选中的记录中没有支持此操作的记录');
    return;
  }
  if (validRows.length < rows.length) {
    message.warning(
      `选中的 ${rows.length} 条记录中，有 ${rows.length - validRows.length} 条不支持此操作，将只操作 ${validRows.length} 条记录`,
    );
  }
  batchConfirmData.value = validRows;
  batchConfirmAction.value = action;
  switch (action) {
    case 'delete': {
      batchConfirmTitle.value = $t('ui.actionTitle.batchDelete');
      break;
    }
    case 'disable': {
      batchConfirmTitle.value = $t('ui.actionTitle.batchDisable');
      break;
    }
    case 'enable': {
      batchConfirmTitle.value = $t('ui.actionTitle.batchEnable');
      break;
    }
  }
  batchConfirmVisible.value = true;
}

function onBatchDelete() {
  const rows = getSelectedRows();
  if (rows.length === 0) {
    message.warning('请先选择要删除的记录');
    return;
  }
  showBatchConfirm(rows, 'delete');
}

function onBatchEnable() {
  const rows = getSelectedRows();
  if (rows.length === 0) {
    message.warning('请先选择要启用的记录');
    return;
  }
  showBatchConfirm(rows, 'enable');
}

function onBatchDisable() {
  const rows = getSelectedRows();
  if (rows.length === 0) {
    message.warning('请先选择要禁用的记录');
    return;
  }
  showBatchConfirm(rows, 'disable');
}

async function handleBatchConfirm() {
  if (!batchConfirmAction.value || batchConfirmData.value.length === 0) {
    return;
  }

  if (batchConfirmData.value.length > 100) {
    message.error('批量操作记录数量单次不能超过100条');
    return;
  }

  const hideLoading = message.loading({
    content: `正在${batchConfirmTitle.value}...`,
    duration: 0,
    key: 'batch_action_process_msg',
  });
  batchDnsRecords({
    items: batchConfirmData.value.map((row) => row.id),
    action: batchConfirmAction.value,
  })
    .then((res: any) => {
      batchConfirmVisible.value = false;
      onRefresh();
      gridApi.grid.clearCheckboxRow();
      gridApi.grid.clearCheckboxReserve();
      hasSelectedRows.value = false;
      if (res?.taskId) {
        taskStatusTaskId.value = res.taskId;
        taskStatusModalOpen.value = true;
      }
    })
    .finally(() => {
      hideLoading();
    });
}

function handleBatchCancel() {
  batchConfirmVisible.value = false;
  batchConfirmData.value = [];
  batchConfirmAction.value = null;
}

const batchConfirmColumns = [
  {
    title: $t('dns.record.host'),
    dataIndex: 'host',
    key: 'host',
    width: 200,
  },
  {
    title: $t('dns.record.type'),
    dataIndex: 'recordType',
    key: 'recordType',
    width: 150,
  },
  {
    title: $t('dns.record.line'),
    dataIndex: 'line',
    key: 'line',
    width: 150,
    customRender: ({ text }: { text: string }) => {
      return $t(`dns.record.lineOptions.${text}` as any);
    },
  },
  {
    title: $t('dns.record.value'),
    dataIndex: 'value',
    key: 'value',
    width: 200,
  },
];
</script>
<template>
  <Page auto-content-height>
    <CreateFormDrawer @success="onRefresh" @task-created="handleTaskCreated" />
    <UpdateFormDrawer @success="onRefresh" @task-created="handleTaskUpdated" />
    <Modal
      v-model:open="taskStatusModalOpen"
      :title="$t('dns.task.status')"
      :mask-closable="false"
      :keyboard="false"
      :closable="true"
      :footer="null"
      width="600px"
    >
      <TaskStatusModal
        :task-id="taskStatusTaskId"
        :open="taskStatusModalOpen"
        @update:open="taskStatusModalOpen = $event"
      />
    </Modal>
    <!-- DNS 记录状态检查模态框 -->
    <Modal
      v-model:open="checkStatusModalOpen"
      :title="$t('dns.record.checkStatus.title')"
      :mask-closable="true"
      :keyboard="true"
      :closable="true"
      :footer="null"
      width="500px"
    >
      <CheckStatusModal
        :data="checkStatusData"
        :open="checkStatusModalOpen"
        :loading="checkStatusLoading"
        @update:open="checkStatusModalOpen = $event"
      />
    </Modal>
    <!-- 拉取/推送服务商选择模态框 -->
    <Modal
      v-model:open="providerSelectModalOpen"
      :title="providerSelectModalTitle"
      width="400px"
      :mask-closable="true"
      @ok="handleProviderSelectConfirm"
      @cancel="closeProviderSelectModal"
    >
      <div class="py-4">
        <Select
          v-model:value="selectedProviderId"
          :options="providerSelectOptions"
          :loading="providerSelectLoading"
          :placeholder="$t('dns.domain.providers')"
          style="width: 100%"
          allow-clear
          show-search
          :filter-option="
            (input: string, option: any) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          "
        />
      </div>
    </Modal>
    <Grid
      :table-title="`${recordInfo?.domainName || ''} ${$t('dns.record.list')}`"
    >
      <template #toolbar-tools>
        <Space>
          <Button @click="onBatchEnable" v-if="hasSelectedRows === true">
            {{ $t('ui.actionTitle.batchEnable') }}
          </Button>

          <Button @click="onBatchDisable" v-if="hasSelectedRows === true">
            {{ $t('ui.actionTitle.batchDisable') }}
          </Button>

          <Button @click="onBatchDelete" v-if="hasSelectedRows === true">
            {{ $t('ui.actionTitle.batchDelete') }}
          </Button>

          <Button :loading="pullLoading" @click="onPull">
            <IconifyIcon
              class="size-5"
              icon="lucide:cloud-download"
            />
            {{ $t('dns.record.pull') }}
          </Button>

          <Button :loading="pushLoading" @click="onPush">
            <IconifyIcon
              class="size-5"
              icon="lucide:cloud-upload"
            />
            {{ $t('dns.record.push') }}
          </Button>

          <Button type="primary" @click="onCreate">
            <Plus class="size-5" />
            {{ $t('ui.actionTitle.create', [$t('dns.record.name')]) }}
          </Button>
        </Space>
      </template>
    </Grid>
    <!-- 批量操作确认模态框 -->
    <Modal
      v-model:open="batchConfirmVisible"
      :title="batchConfirmTitle"
      width="800px"
      @ok="handleBatchConfirm"
      @cancel="handleBatchCancel"
    >
      <div style="margin-bottom: 16px">
        <span style="font-weight: 500">
          共选中
          <span style="color: #1890ff">{{ batchConfirmData.length }}</span>
          条记录
        </span>
      </div>
      <Table
        :columns="batchConfirmColumns"
        :data-source="batchConfirmData"
        :pagination="false"
        :scroll="{ y: 400 }"
        size="small"
        bordered
      />
    </Modal>
  </Page>
</template>
