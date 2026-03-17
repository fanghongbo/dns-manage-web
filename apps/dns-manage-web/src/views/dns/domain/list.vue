<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { DnsDomainApi } from '#/api/dns/domain';
import type { DnsProviderApi } from '#/api/dns/provider';

import { nextTick, onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getDnsProviders } from '#/api';
import { executeDnsAnalysis } from '#/api/dns/analysis';
import {
  deleteDnsDomain,
  getDnsDomainList,
  updateDnsDomainStatus,
} from '#/api/dns/domain';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const router = useRouter();

const { hasAccessByCodes } = useAccess();

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

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
    columns: useColumns(onActionClick, onStatusChange, hasAccessByCodes),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return hasAccessByCodes(['dns.domain.list'])
            ? await getDnsDomainList({
                page: page.currentPage,
                pageSize: page.pageSize,
                ...formValues,
              })
            : {
                data: [],
                page: {
                  currentPage: 1,
                  pageSize: 10,
                },
              };
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
  } as VxeTableGridOptions<DnsDomainApi.DnsDomain>,
});

onBeforeMount(() => {
  nextTick(() => {
    loadProviders();
  });
});

const providerOptions = ref<Array<{ label: string; value: string }>>([]);

async function loadProviders() {
  try {
    const providers = await getDnsProviders();
    providerOptions.value = providers.map(
      (provider: DnsProviderApi.DnsProvider) => ({
        label: provider.name,
        value: provider.id as string,
      }),
    );
  } catch (error) {
    console.error('Failed to load providers:', error);
  }
}

function onActionClick(e: OnActionClickParams<DnsDomainApi.DnsDomain>) {
  switch (e.code) {
    case 'analysis': {
      onAnalysis(e.row);
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
    case 'record': {
      onRecord(e.row);
      break;
    }
  }
}

function onAnalysis(row: DnsDomainApi.DnsDomain) {
  Modal.confirm({
    cancelText: '取消',
    content: `确定要对域名「${row.domainName}」执行分析吗？`,
    okText: '确定',
    title: '执行域名分析',
    onOk() {
      const hideLoading = message.loading({
        content: '正在创建分析任务...',
        duration: 0,
        key: 'dns_analysis_loading',
      });

      return executeDnsAnalysis({ domainId: row.id })
        .then((res: { analysisId?: string }) => {
          hideLoading();

          if (res?.analysisId) {
            message.success('分析任务已创建');
            router.push(`/dns/analysis/${res?.analysisId}/record/list`);
          } else {
            message.error('未获取到分析任务 ID');
          }
        })
        .catch(() => {
          hideLoading();
          message.error('分析任务创建失败');
        });
    },
  });
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
 * 状态开关即将改变
 * @param newStatus 期望改变的状态值
 * @param row 行数据
 * @returns 返回false则中止改变，返回其他值（undefined、true）则允许改变
 */
async function onStatusChange(newStatus: number, row: DnsDomainApi.DnsDomain) {
  const status: Recordable<string> = {
    0: '禁用',
    1: '启用',
  };
  try {
    await confirm(
      `你要将${row.domainName}的状态切换为 【${status[newStatus.toString()]}】 吗？`,
      `切换状态`,
    );
    await updateDnsDomainStatus(row.id, { status: newStatus });
    return true;
  } catch {
    return false;
  }
}

function onEdit(row: DnsDomainApi.DnsDomain) {
  // 不要直接修改表格行数据，否则 providers 从对象数组变成 id 数组后，
  // CellTags 渲染将拿不到服务商名称，导致显示为 '-'
  const formRow = {
    ...row,
    providers: row.providers.map(
      (provider: DnsProviderApi.DnsProvider) => provider.id,
    ),
  };
  formDrawerApi.setData(formRow).open();
}

function onDelete(row: DnsDomainApi.DnsDomain) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.domainName]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteDnsDomain(row.id)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.domainName]),
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => {
      hideLoading();
    });
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}

function onRecord(row: DnsDomainApi.DnsDomain) {
  router.push(`/dns/domain/${row.id}/record/list`);
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid :table-title="$t('dns.domain.list')">
      <template #toolbar-tools>
        <Button
          type="primary"
          @click="onCreate"
          v-if="hasAccessByCodes(['dns.domain.create'])"
        >
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('dns.domain.name')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
