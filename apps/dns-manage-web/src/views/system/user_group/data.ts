import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemUserGroupApi } from '#/api';

import { formatDateTime } from '@vben/utils';

import { $t } from '#/locales';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'groupName',
      label: $t('system.userGroup.userGroupName'),
      rules: 'required',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'status',
      label: $t('system.userGroup.status'),
    },
    {
      component: 'Select',
      fieldName: 'roles',
      label: $t('system.userGroup.roles'),
      componentProps: {
        allowClear: true,
        mode: 'multiple',
        options: [],
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return (option?.label ?? '')
            .toLowerCase()
            .includes(input.toLowerCase());
        },
        style: { width: '100%' },
      },
    },
    {
      component: 'Select',
      fieldName: 'users',
      label: $t('system.userGroup.users'),
      componentProps: {
        allowClear: true,
        mode: 'multiple',
        options: [],
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return (option?.label ?? '')
            .toLowerCase()
            .includes(input.toLowerCase());
        },
        style: { width: '100%' },
      },
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.userGroup.remark'),
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'groupName',
      label: $t('system.userGroup.userGroupName'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.enabled'), value: 'active' },
          { label: $t('common.disabled'), value: 'inactive' },
        ],
      },
      fieldName: 'status',
      label: $t('system.userGroup.status'),
    },
    {
      component: 'Input',
      fieldName: 'remark',
      label: $t('system.userGroup.remark'),
    },
    {
      component: 'RangePicker',
      fieldName: 'createdTime',
      label: $t('system.userGroup.createdTime'),
    },
  ];
}

export function useColumns<T = SystemUserGroupApi.SystemUserGroup>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'groupName',
      title: $t('system.userGroup.userGroupName'),
      width: 300,
    },
    {
      field: 'userCount',
      title: $t('system.userGroup.userCount'),
      width: 300,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
      },
      field: 'status',
      title: $t('system.userGroup.status'),
      width: 200,
    },
    {
      field: 'remark',
      minWidth: 100,
      title: $t('system.userGroup.remark'),
    },
    {
      field: 'createdTime',
      formatter: ({ cellValue }) => {
        // 格式化时间：将 ISO 8601 格式 (2026-01-08T10:41:10+08:00) 转换为 (2026-01-08 10:41:10)
        return formatDateTime(cellValue);
      },
      title: $t('system.userGroup.createdTime'),
      width: 200,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'groupName',
          nameTitle: $t('system.userGroup.userGroupName'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.userGroup.operation'),
      width: 130,
    },
  ];
}
