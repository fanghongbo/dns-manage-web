<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemUserGroupApi } from '#/api/system/user_group';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteUserGroup,
  getUserGroupList,
  updateUserGroupStatus,
} from '#/api/system/user_group';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const { hasAccessByCodes } = useAccess();

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
          return hasAccessByCodes(['system.user.group.list'])
            ? await getUserGroupList({
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
  } as VxeTableGridOptions<SystemUserGroupApi.SystemUserGroup>,
});

function onActionClick(
  e: OnActionClickParams<SystemUserGroupApi.SystemUserGroup>,
) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
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
 * 状态开关即将改变
 * @param newStatus 期望改变的状态值
 * @param row 行数据
 * @returns 返回false则中止改变，返回其他值（undefined、true）则允许改变
 */
async function onStatusChange(
  newStatus: number,
  row: SystemUserGroupApi.SystemUserGroup,
) {
  const status: Recordable<string> = {
    0: '禁用',
    1: '启用',
  };
  try {
    await confirm(
      `你要将${row.groupName}的状态切换为 【${status[newStatus.toString()]}】 吗？`,
      `切换状态`,
    );
    await updateUserGroupStatus(row.id, { status: newStatus });
    return true;
  } catch {
    return false;
  }
}

function onEdit(row: SystemUserGroupApi.SystemUserGroup) {
  formDrawerApi.setData(row).open();
}

function onDelete(row: SystemUserGroupApi.SystemUserGroup) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.groupName]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteUserGroup(row.id)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.groupName]),
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
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid :table-title="$t('system.userGroup.list')">
      <template #toolbar-tools>
        <Button
          type="primary"
          @click="onCreate"
          v-if="hasAccessByCodes(['system.user.group.create'])"
        >
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.userGroup.name')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
