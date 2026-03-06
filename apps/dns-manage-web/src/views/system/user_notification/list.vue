<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemUserNotificationApi } from '#/api/system/user_notification';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, message, Modal, Space } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  batchUserNotifications,
  deleteUserNotification,
  getUserNotificationList,
  updateUserNotificationStatus,
} from '#/api/system/user_notification';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';

const hasSelectedRows = ref<boolean>(false);

// @ts-expect-error ignore
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['createTime', ['startTime', 'endTime']]],
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
      records: SystemUserNotificationApi.SystemUserNotification[];
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
          return await getUserNotificationList({
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
  } as VxeTableGridOptions<SystemUserNotificationApi.SystemUserNotification>,
});

function onActionClick(
  e: OnActionClickParams<SystemUserNotificationApi.SystemUserNotification>,
) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'read': {
      onSetRead(e.row);
      break;
    }
    case 'unread': {
      onSetUnread(e.row);
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

async function onSetRead(
  row: SystemUserNotificationApi.SystemUserNotification,
) {
  try {
    await confirm(`你要将${row.notificationName}设为已读吗？`, `设为已读`);
    await updateUserNotificationStatus(row.id, { status: 1 });
    onRefresh();
  } catch {
    // ignore error
  }
}

async function onSetUnread(
  row: SystemUserNotificationApi.SystemUserNotification,
) {
  try {
    await confirm(`你要将${row.notificationName}设为未读吗？`, `设为未读`);
    await updateUserNotificationStatus(row.id, { status: 0 });
    onRefresh();
  } catch {
    // ignore error
  }
}

function onDelete(row: SystemUserNotificationApi.SystemUserNotification) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.notificationName]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteUserNotification(row.id)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.notificationName]),
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

function getSelectedRows() {
  const reserveRecords = gridApi.grid.getCheckboxReserveRecords();
  const selectedRecords = gridApi.grid.getCheckboxRecords();

  return [...reserveRecords, ...selectedRecords];
}

async function onBatchSetRead() {
  const rows = getSelectedRows();
  if (rows.length === 0) {
    message.warning('请先选择要设为已读的通知');
    return;
  }

  const hideLoading = message.loading({
    content: $t('system.userNotification.batchSetRead', [rows.length]),
    duration: 0,
    key: 'batch_action_process_msg',
  });
  try {
    await batchUserNotifications({
      items: rows.map((row) => row.id),
      action: 'read',
    });
    message.success({
      content: $t('ui.actionMessage.batchSetReadSuccess', [rows.length]),
      key: 'batch_action_process_msg',
    });
    onRefresh();
    hideLoading();
    // 清空选中行, 清空选择框状态
    // 清空当前页面的选中行
    gridApi.grid.clearCheckboxRow();
    // 清空跨页保留的选中行
    gridApi.grid.clearCheckboxReserve();
    // 更新选中状态
    hasSelectedRows.value = false;
  } catch {
    // ignore error
  }
}

async function onBatchSetUnread() {
  const rows = getSelectedRows();
  if (rows.length === 0) {
    message.warning('请先选择要设为未读的通知');
    return;
  }

  const hideLoading = message.loading({
    content: $t('system.userNotification.batchSetUnread', [rows.length]),
    duration: 0,
    key: 'batch_action_process_msg',
  });
  try {
    await batchUserNotifications({
      items: rows.map((row) => row.id),
      action: 'unread',
    });
    message.success({
      content: $t('ui.actionMessage.batchSetUnreadSuccess', [rows.length]),
      key: 'batch_action_process_msg',
    });
    onRefresh();
    hideLoading();

    // 清空选中行, 清空选择框状态
    // 清空当前页面的选中行
    gridApi.grid.clearCheckboxRow();
    // 清空跨页保留的选中行
    gridApi.grid.clearCheckboxReserve();
    // 更新选中状态
    hasSelectedRows.value = false;
  } catch {
    // ignore error
  }
}

async function onBatchDelete() {
  const rows = getSelectedRows();
  if (rows.length === 0) {
    message.warning('请先选择要删除的通知');
    return;
  }

  try {
    await confirm(`确定要删除选中的 ${rows.length} 条通知吗？`, '批量删除');
    const hideLoading = message.loading({
      content: $t('system.userNotification.batchDelete', [rows.length]),
      duration: 0,
      key: 'batch_action_process_msg',
    });
    try {
      await batchUserNotifications({
        items: rows.map((row) => row.id),
        action: 'delete',
      });
      message.success({
        content: $t('ui.actionMessage.batchDeleteSuccess', [rows.length]),
        key: 'batch_action_process_msg',
      });
      onRefresh();
      hideLoading();

      // 清空选中行, 清空选择框状态
      // 清空当前页面的选中行
      gridApi.grid.clearCheckboxRow();
      // 清空跨页保留的选中行
      gridApi.grid.clearCheckboxReserve();
      // 更新选中状态
      hasSelectedRows.value = false;
    } catch {
      hideLoading();
    }
  } catch {
    // ignore error
  }
}
</script>
<template>
  <Page auto-content-height>
    <Grid :table-title="$t('system.userNotification.list')">
      <template #toolbar-tools>
        <Space>
          <Button @click="onBatchSetRead" v-if="hasSelectedRows === true">
            {{ $t('system.userNotification.batchSetRead') }}
          </Button>

          <Button @click="onBatchSetUnread" v-if="hasSelectedRows === true">
            {{ $t('system.userNotification.batchSetUnread') }}
          </Button>

          <Button @click="onBatchDelete" v-if="hasSelectedRows === true">
            {{ $t('system.userNotification.batchDelete') }}
          </Button>
        </Space>
      </template>
    </Grid>
  </Page>
</template>
