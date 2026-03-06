import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemUserNotificationApi } from '#/api/system/user_notification';

import { $t } from '#/locales';

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.userNotification.name'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: $t('system.userNotification.statusOptions.1'),
            value: 'read',
          },
          {
            label: $t('system.userNotification.statusOptions.0'),
            value: 'unread',
          },
        ],
      },
      fieldName: 'status',
      label: $t('system.userNotification.status'),
    },
    {
      component: 'Input',
      fieldName: 'content',
      label: $t('system.userNotification.content'),
    },
    {
      component: 'RangePicker',
      fieldName: 'createTime',
      label: $t('system.userNotification.createdTime'),
    },
  ];
}

export function useColumns<
  T = SystemUserNotificationApi.SystemUserNotification,
>(onActionClick: OnActionClickFn<T>): VxeTableGridOptions['columns'] {
  return [
    {
      align: 'center',
      type: 'checkbox',
      width: 50,
    },
    {
      field: 'createdTime',
      title: $t('system.userNotification.createdTime'),
      width: 200,
    },
    {
      field: 'notificationName',
      title: $t('system.userNotification.name'),
      width: 400,
    },
    {
      field: 'status',
      title: $t('system.userNotification.status'),
      width: 200,
      cellRender: {
        name: 'CellTag',
        options: [
          {
            color: 'default',
            label: $t('system.userNotification.statusOptions.0'),
            value: 0,
          },
          {
            color: 'success',
            label: $t('system.userNotification.statusOptions.1'),
            value: 1,
          },
        ],
      },
    },
    {
      field: 'content',
      minWidth: 400,
      title: $t('system.userNotification.content'),
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('system.userNotification.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'read',
            text: $t('system.userNotification.setRead'),
            show: (row: SystemUserNotificationApi.SystemUserNotification) =>
              row.status === 0,
          },
          {
            code: 'unread',
            text: $t('system.userNotification.setUnread'),
            show: (row: SystemUserNotificationApi.SystemUserNotification) =>
              row.status === 1,
          },
          {
            code: 'delete',
            text: $t('common.delete'),
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.userNotification.operation'),
      width: 130,
    },
  ];
}
