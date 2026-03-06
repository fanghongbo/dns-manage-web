import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DnsTaskApi } from '#/api/dns/task';

import { formatDateTime } from '@vben/utils';

import { $t } from '#/locales';

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'domainName',
      label: $t('dns.task.domainName'),
    },
    {
      component: 'RangePicker',
      fieldName: 'createdTime',
      label: $t('dns.analysis.analysisTime'),
    },
  ];
}

export function useColumns<T = DnsTaskApi.DnsTask>(
  onActionClick: OnActionClickFn<T>,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'createdTime',
      title: $t('dns.analysis.analysisTime'),
      width: 250,
      formatter: ({ cellValue }) => {
        return formatDateTime(cellValue);
      },
    },
    {
      field: 'domainName',
      width: 300,
      title: $t('dns.task.domainName'),
    },
    {
      field: 'providers',
      title: $t('dns.analysis.providers'),
      minWidth: 300,
      cellRender: { name: 'CellTags' },
    },
    {
      field: 'diffCount',
      title: $t('dns.analysis.diffCount'),
      width: 200,
    },
    {
      field: 'operator',
      title: $t('dns.task.operator'),
      width: 200,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'taskName',
          nameTitle: $t('dns.task.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'record',
            text: $t('dns.task.detail'),
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('dns.task.operation'),
      width: 180,
    },
  ];
}
