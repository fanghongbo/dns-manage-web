import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { formatDateTime } from '@vben/utils';

import { $t } from '#/locales';

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'providerName',
      label: $t('dns.provider.providerName'),
    },
    {
      component: 'Input',
      fieldName: 'host',
      label: $t('dns.record.host'),
    },
    {
      component: 'Input',
      fieldName: 'value',
      label: $t('dns.record.value'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('dns.record.typeOptions.A'), value: 'A' },
          { label: $t('dns.record.typeOptions.AAAA'), value: 'AAAA' },
          { label: $t('dns.record.typeOptions.CNAME'), value: 'CNAME' },
          { label: $t('dns.record.typeOptions.TXT'), value: 'TXT' },
          { label: $t('dns.record.typeOptions.MX'), value: 'MX' },
          { label: $t('dns.record.typeOptions.NS'), value: 'NS' },
        ],
      },
      fieldName: 'recordType',
      label: $t('dns.record.type'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('dns.task.record.statusOptions.0'), value: 'pending' },
          { label: $t('dns.task.record.statusOptions.1'), value: 'processing' },
          { label: $t('dns.task.record.statusOptions.2'), value: 'success' },
          { label: $t('dns.task.record.statusOptions.3'), value: 'failed' },
          { label: $t('dns.task.record.statusOptions.4'), value: 'canceled' },
          { label: $t('dns.task.record.statusOptions.5'), value: 'retry_wait' },
        ],
      },
      fieldName: 'status',
      label: $t('dns.task.status'),
    },
    {
      component: 'RangePicker',
      fieldName: 'createdTime',
      label: $t('dns.task.record.startTime'),
    },
  ];
}

export function useColumns(): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'host',
      title: $t('dns.record.host'),
      width: 300,
    },
    {
      field: 'recordType',
      title: $t('dns.record.type'),
      width: 120,
    },
    {
      field: 'line',
      title: $t('dns.record.line'),
      width: 150,
      formatter: ({ cellValue }: { cellValue: string }) => {
        return $t(`dns.record.lineOptions.${cellValue}` as any);
      },
    },
    {
      field: 'ttl',
      title: $t('dns.record.ttl'),
      width: 120,
    },
    {
      field: 'priority',
      title: $t('dns.record.priority'),
      width: 120,
    },
    {
      field: 'value',
      title: $t('dns.record.value'),
      width: 300,
    },
    {
      field: 'loadStrategy',
      title: $t('dns.record.loadStrategy'),
      width: 100,
      formatter: ({ cellValue }: { cellValue: string }) => {
        return $t(`dns.record.loadStrategyOptions.${cellValue}` as any);
      },
    },
    {
      field: 'weight',
      title: $t('dns.record.weight'),
      width: 100,
      formatter: ({ cellValue }: { cellValue: number }) => {
        return cellValue ?? '-';
      },
    },
    {
      field: 'status',
      title: $t('dns.record.status'),
      formatter: ({ cellValue }: { cellValue: string }) => {
        return $t(`dns.record.statusOptions.${cellValue}` as any);
      },
      width: 100,
    },
    {
      field: 'createdTime',
      formatter: ({ cellValue }) => {
        return formatDateTime(cellValue);
      },
      title: $t('dns.task.createdTime'),
      width: 200,
    },
  ];
}
