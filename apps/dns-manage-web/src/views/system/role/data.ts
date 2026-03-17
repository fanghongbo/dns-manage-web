import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api';

import { formatDateTime } from '@vben/utils';

import { $t } from '#/locales';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'roleName',
      label: $t('system.role.roleName'),
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
      label: $t('system.role.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.role.remark'),
    },
    {
      component: 'Input',
      fieldName: 'permissions',
      formItemClass: 'items-start',
      label: $t('system.role.setPermissions'),
      modelPropName: 'modelValue',
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'roleName',
      label: $t('system.role.roleName'),
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
      label: $t('system.role.status'),
    },
    {
      component: 'Input',
      fieldName: 'remark',
      label: $t('system.role.remark'),
    },
    {
      component: 'RangePicker',
      fieldName: 'createdTime',
      label: $t('system.role.createdTime'),
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
      field: 'roleName',
      title: $t('system.role.roleName'),
      width: 300,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        // eslint-disable-next-line prettier/prettier
        name: onStatusChange ? (hasAccessByCodes?.(['system.role.update']) ? 'CellSwitch' : 'CellTag') : 'CellTag',
      },
      field: 'status',
      title: $t('system.role.status'),
      width: 500,
    },
    {
      field: 'remark',
      minWidth: 100,
      title: $t('system.role.remark'),
    },
    {
      field: 'createdTime',
      formatter: ({ cellValue }) => {
        // 格式化时间：将 ISO 8601 格式 (2026-01-08T10:41:10+08:00) 转换为 (2026-01-08 10:41:10)
        return formatDateTime(cellValue);
      },
      title: $t('system.role.createdTime'),
      width: 200,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'roleName',
          nameTitle: $t('system.role.roleName'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'edit',
            text: $t('common.edit'),
            show: hasAccessByCodes
              ? hasAccessByCodes(['system.role.update'])
              : true,
          },
          {
            code: 'delete',
            text: $t('common.delete'),
            show: hasAccessByCodes
              ? hasAccessByCodes(['system.role.delete'])
              : true,
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.role.operation'),
      width: 130,
    },
  ];
}
