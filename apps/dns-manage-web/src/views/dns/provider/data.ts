import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DnsProviderApi } from '#/api/dns/provider';

import { formatDateTime } from '@vben/utils';

import { $t } from '#/locales';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'providerName',
      label: $t('dns.provider.providerName'),
      rules: 'required',
    },
    {
      component: 'Select',
      fieldName: 'providerType',
      label: $t('dns.provider.providerType'),
      rules: 'required',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: $t('dns.provider.providerTypeOptions.aliyun'),
            value: 'aliyun',
          },
          {
            label: $t('dns.provider.providerTypeOptions.dnspod'),
            value: 'dnspod',
          },
          // {
          //   label: $t('dns.provider.providerTypeOptions.aws'),
          //   value: 'aws',
          // },
        ],
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
      component: 'Input',
      fieldName: 'apiKey',
      label: $t('dns.provider.apiKey'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'apiSecret',
      label: $t('dns.provider.apiSecret'),
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
      label: $t('dns.provider.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('dns.provider.remark'),
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'providerName',
      label: $t('dns.provider.providerName'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: $t('dns.provider.providerTypeOptions.aliyun'),
            value: 'aliyun',
          },
          {
            label: $t('dns.provider.providerTypeOptions.dnspod'),
            value: 'dnspod',
          },
          // { label: $t('dns.provider.providerTypeOptions.aws'), value: 'aws' },
        ],
      },
      fieldName: 'providerType',
      label: $t('dns.provider.providerType'),
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
      label: $t('dns.provider.status'),
    },
    {
      component: 'Input',
      fieldName: 'remark',
      label: $t('dns.provider.remark'),
    },
    {
      component: 'RangePicker',
      fieldName: 'createdTime',
      label: $t('dns.provider.createdTime'),
    },
  ];
}

export function useColumns<T = DnsProviderApi.DnsProvider>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
  hasAccessByCodes?: (codes: string[]) => boolean,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'providerName',
      title: $t('dns.provider.providerName'),
      width: 300,
    },
    {
      field: 'providerType',
      title: $t('dns.provider.providerType'),
      cellRender: {
        name: 'CellTag',
        options: [
          {
            color: 'default',
            label: $t('dns.provider.providerTypeOptions.aliyun'),
            value: 'aliyun',
          },
          {
            color: 'default',
            label: $t('dns.provider.providerTypeOptions.dnspod'),
            value: 'dnspod',
          },
        ],
      },
      width: 500,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        // eslint-disable-next-line prettier/prettier
        name: onStatusChange ? (hasAccessByCodes?.(['dns.provider.update']) ? 'CellSwitch' : 'CellTag') : 'CellTag',
      },
      field: 'status',
      title: $t('dns.provider.status'),
      width: 200,
    },
    {
      field: 'remark',
      minWidth: 100,
      title: $t('dns.provider.remark'),
    },
    {
      field: 'createdTime',
      formatter: ({ cellValue }) => {
        return formatDateTime(cellValue);
      },
      title: $t('dns.provider.createdTime'),
      width: 200,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'providerName',
          nameTitle: $t('dns.provider.providerName'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'edit',
            text: $t('common.edit'),
            show: hasAccessByCodes
              ? hasAccessByCodes(['dns.provider.update'])
              : true,
          },
          {
            code: 'delete',
            text: $t('common.delete'),
            show: hasAccessByCodes
              ? hasAccessByCodes(['dns.provider.delete'])
              : true,
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('dns.provider.operation'),
      width: 130,
    },
  ];
}
