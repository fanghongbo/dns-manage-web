import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DnsDomainApi } from '#/api/dns/domain';

import { formatDateTime } from '@vben/utils';

import { z } from '#/adapter/form';
import { $t } from '#/locales';

/** 二级域名正则：字母/数字/连字符 + 点 + 至少两位后缀，如 fanghongbo.com、sz-jlc.com、baidu.cn */
const DOMAIN_SECOND_LEVEL_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?\.[a-z]{2,}$/i;

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'domainName',
      label: $t('dns.domain.domainName'),
      rules: z
        .string()
        .min(1, {
          message: $t('ui.formRules.required', [$t('dns.domain.domainName')]),
        })
        .regex(DOMAIN_SECOND_LEVEL_REGEX, {
          message: $t('dns.domain.domainNameInvalid'),
        }),
    },
    {
      component: 'Select',
      fieldName: 'providers',
      label: $t('dns.domain.providers'),
      rules: 'required',
      componentProps: {
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
      label: $t('dns.domain.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('dns.domain.remark'),
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'domainName',
      label: $t('dns.domain.domainName'),
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
      label: $t('dns.domain.status'),
    },
    {
      component: 'Input',
      fieldName: 'remark',
      label: $t('dns.domain.remark'),
    },
    {
      component: 'RangePicker',
      fieldName: 'createdTime',
      label: $t('dns.domain.createdTime'),
    },
  ];
}

export function useColumns<T = DnsDomainApi.DnsDomain>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
  hasAccessByCodes?: (codes: string[]) => boolean,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'domainName',
      title: $t('dns.domain.domainName'),
      width: 300,
    },
    {
      field: 'providers',
      title: $t('dns.analysis.providers'),
      minWidth: 300,
      cellRender: { name: 'CellTags' },
    },
    {
      field: 'recordCount',
      title: $t('dns.domain.recordCount'),
      width: 100,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        // eslint-disable-next-line prettier/prettier
        name: onStatusChange ? (hasAccessByCodes?.(['dns.domain.update']) ? 'CellSwitch' : 'CellTag') : 'CellTag',
      },
      field: 'status',
      title: $t('dns.domain.status'),
      width: 150,
    },
    {
      field: 'remark',
      minWidth: 100,
      title: $t('dns.domain.remark'),
    },
    {
      field: 'createdTime',
      formatter: ({ cellValue }) => {
        return formatDateTime(cellValue);
      },
      title: $t('dns.domain.createdTime'),
      width: 200,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'domainName',
          nameTitle: $t('dns.domain.domainName'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'record',
            text: $t('dns.domain.record'),
            show: hasAccessByCodes
              ? hasAccessByCodes(['dns.domain.record'])
              : true,
          },
          {
            code: 'analysis',
            text: $t('dns.domain.analysis'),
            show: hasAccessByCodes
              ? hasAccessByCodes(['dns.domain.analysis'])
              : true,
          },
          {
            code: 'edit',
            text: $t('common.edit'),
            show: hasAccessByCodes
              ? hasAccessByCodes(['dns.domain.update'])
              : true,
          },
          {
            code: 'delete',
            text: $t('common.delete'),
            show: hasAccessByCodes
              ? hasAccessByCodes(['dns.domain.delete'])
              : true,
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('dns.domain.operation'),
      width: 250,
    },
  ];
}
