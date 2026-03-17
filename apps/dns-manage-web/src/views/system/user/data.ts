import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api';

import { formatDateTime } from '@vben/utils';

import { $t } from '#/locales';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: $t('system.user.userName'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'nickname',
      label: $t('system.user.nickname'),
      rules: 'required',
    },
    {
      component: 'Select',
      fieldName: 'roles',
      label: $t('system.user.roles'),
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
      fieldName: 'groups',
      label: $t('system.user.groups'),
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
      label: $t('system.user.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.user.remark'),
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: $t('system.user.userName'),
    },
    {
      component: 'Input',
      fieldName: 'nickname',
      label: $t('system.user.nickname'),
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
      label: $t('system.user.status'),
    },
    {
      component: 'Input',
      fieldName: 'remark',
      label: $t('system.user.remark'),
    },
    {
      component: 'RangePicker',
      fieldName: 'createdTime',
      label: $t('system.user.createdTime'),
    },
  ];
}

export function useColumns<T = SystemRoleApi.SystemRole>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
  hasAccessByCodes?: (codes: string[]) => boolean,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'username',
      title: $t('system.user.userName'),
      width: 300,
    },
    {
      field: 'nickname',
      title: $t('system.user.nickname'),
      width: 500,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        // eslint-disable-next-line prettier/prettier
        name: onStatusChange ? (hasAccessByCodes?.(['system.user.update']) ? 'CellSwitch' : 'CellTag') : 'CellTag',
      },
      field: 'status',
      title: $t('system.user.status'),
      width: 200,
    },
    {
      field: 'remark',
      minWidth: 100,
      title: $t('system.user.remark'),
    },
    {
      field: 'createdTime',
      formatter: ({ cellValue }) => {
        // 格式化时间：将 ISO 8601 格式 (2026-01-08T10:41:10+08:00) 转换为 (2026-01-08 10:41:10)
        return formatDateTime(cellValue);
      },
      title: $t('system.user.createdTime'),
      width: 200,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'username',
          nameTitle: $t('system.user.userName'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'edit',
            text: $t('common.edit'),
            show: hasAccessByCodes
              ? hasAccessByCodes(['system.user.update'])
              : true,
          },
          {
            code: 'delete',
            text: $t('common.delete'),
            show: hasAccessByCodes
              ? hasAccessByCodes(['system.user.delete'])
              : true,
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.user.operation'),
      width: 130,
    },
  ];
}
