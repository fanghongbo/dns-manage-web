import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { formatDateTime } from '@vben/utils';

import { $t } from '#/locales';

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'domainName',
      label: $t('dns.domain.domainName'),
    },
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
          { label: $t('dns.task.record.statusOptions.2'), value: 'success' },
          { label: $t('dns.task.record.statusOptions.3'), value: 'failed' },
        ],
      },
      fieldName: 'status',
      label: $t('dns.task.status'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: $t('dns.log.actionTypeOptions.dns_record_push'),
            value: 'push',
          },
          {
            label: $t('dns.log.actionTypeOptions.dns_record_pull'),
            value: 'pull',
          },
          {
            label: $t('dns.log.actionTypeOptions.dns_record_create'),
            value: 'create',
          },
          {
            label: $t('dns.log.actionTypeOptions.dns_record_update'),
            value: 'update',
          },
          {
            label: $t('dns.log.actionTypeOptions.dns_record_delete'),
            value: 'delete',
          },
          {
            label: $t('dns.log.actionTypeOptions.dns_record_enable'),
            value: 'enable',
          },
          {
            label: $t('dns.log.actionTypeOptions.dns_record_disable'),
            value: 'disable',
          },
        ],
      },
      fieldName: 'actionType',
      label: $t('dns.log.actionType'),
    },
    {
      component: 'Input',
      fieldName: 'operator',
      label: $t('dns.task.operator'),
    },
    {
      component: 'RangePicker',
      fieldName: 'createdTime',
      label: $t('dns.log.operationTime'),
    },
  ];
}

export function useColumns(): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'createdTime',
      formatter: ({ cellValue }) => {
        return formatDateTime(cellValue);
      },
      title: $t('dns.log.operationTime'),
      width: 200,
    },
    {
      field: 'domainName',
      title: $t('dns.task.domainName'),
      width: 150,
    },
    {
      field: 'providerName',
      title: $t('dns.provider.providerName'),
      width: 200,
    },
    {
      field: 'actionType',
      title: $t('dns.log.actionType'),
      cellRender: {
        name: 'CellTag',
        options: [
          {
            color: 'default',
            label: $t('dns.log.actionTypeOptions.dns_record_push'),
            value: 'dns_record_push',
          },
          {
            color: 'default',
            label: $t('dns.log.actionTypeOptions.dns_record_pull'),
            value: 'dns_record_pull',
          },
          {
            color: 'default',
            label: $t('dns.log.actionTypeOptions.dns_record_create'),
            value: 'dns_record_create',
          },
          {
            color: 'default',
            label: $t('dns.log.actionTypeOptions.dns_record_update'),
            value: 'dns_record_update',
          },
          {
            color: 'default',
            label: $t('dns.log.actionTypeOptions.dns_record_delete'),
            value: 'dns_record_delete',
          },
          {
            color: 'default',
            label: $t('dns.log.actionTypeOptions.dns_record_enable'),
            value: 'dns_record_enable',
          },
          {
            color: 'default',
            label: $t('dns.log.actionTypeOptions.dns_record_disable'),
            value: 'dns_record_disable',
          },
          {
            color: 'default',
            label: $t('dns.log.actionTypeOptions.dns_record_batch_enable'),
            value: 'dns_record_batch_enable',
          },
          {
            color: 'default',
            label: $t('dns.log.actionTypeOptions.dns_record_batch_disable'),
            value: 'dns_record_batch_disable',
          },
          {
            color: 'default',
            label: $t('dns.log.actionTypeOptions.dns_record_batch_delete'),
            value: 'dns_record_batch_delete',
          },
        ],
      },
      width: 100,
    },
    {
      field: 'record.host',
      title: $t('dns.record.host'),
      width: 200,
      cellRender: {
        name: 'CellCompare',
      },
    },
    {
      field: 'record.recordType',
      title: $t('dns.record.type'),
      width: 100,
      cellRender: {
        attrs: {
          formatter: ({ cellValue }: { cellValue: string }) => {
            return cellValue ?? '-';
          },
        },
        name: 'CellCompare',
      },
    },
    {
      field: 'record.priority',
      title: $t('dns.record.priority'),
      width: 100,
      visible: false,
    },
    {
      field: 'record.line',
      title: $t('dns.record.line'),
      width: 150,
      visible: false,
      cellRender: {
        attrs: {
          formatter: ({ cellValue }: { cellValue: string }) => {
            return cellValue
              ? $t(`dns.record.lineOptions.${cellValue}` as any)
              : '-';
          },
        },
        name: 'CellCompare',
      },
    },
    {
      field: 'record.ttl',
      title: $t('dns.record.ttl'),
      width: 100,
      visible: false,
    },
    {
      field: 'record.value',
      title: $t('dns.record.value'),
      width: 200,
      cellRender: {
        attrs: {
          formatter: ({ cellValue }: { cellValue: string }) => {
            return cellValue ?? '-';
          },
        },
        name: 'CellCompare',
      },
    },
    {
      field: 'record.loadStrategy',
      title: $t('dns.record.loadStrategy'),
      width: 100,
      visible: false,
      cellRender: {
        attrs: {
          formatter: ({ cellValue }: { cellValue: string }) => {
            return cellValue
              ? $t(`dns.record.loadStrategyOptions.${cellValue}` as any)
              : '-';
          },
        },
        name: 'CellCompare',
      },
    },
    {
      field: 'record.weight',
      title: $t('dns.record.weight'),
      width: 80,
      cellRender: {
        attrs: {
          formatter: ({ cellValue }: { cellValue: number }) => {
            if (cellValue === null || cellValue === undefined) {
              return '-';
            }
            return cellValue;
          },
        },
        name: 'CellCompare',
      },
    },
    {
      field: 'record.status',
      title: $t('dns.record.status'),
      cellRender: {
        attrs: {
          formatter: ({ cellValue }: { cellValue: number | string }) => {
            if (
              cellValue === null ||
              cellValue === undefined ||
              cellValue === ''
            ) {
              return '-';
            }
            return $t(`dns.record.statusOptions.${cellValue}` as any);
          },
        },
        name: 'CellCompare',
      },
      width: 100,
    },
    {
      field: 'status',
      title: $t('dns.task.record.status'),
      cellRender: {
        name: 'CellTag',
        options: [
          {
            color: 'default',
            label: $t('dns.task.record.statusOptions.0'),
            value: 0,
          },
          {
            color: 'processing',
            label: $t('dns.task.statusOptions.1'),
            value: 1,
          },
          {
            color: 'success',
            label: $t('dns.task.statusOptions.2'),
            value: 2,
          },
          {
            color: 'error',
            label: $t('dns.task.statusOptions.3'),
            value: 3,
          },
          {
            color: 'default',
            label: $t('dns.task.statusOptions.4'),
            value: 4,
          },
          {
            color: 'default',
            label: $t('dns.task.record.statusOptions.5'),
            value: 5,
          },
        ],
      },
      width: 100,
    },
    {
      field: 'operator',
      title: $t('dns.task.record.operator'),
      width: 200,
    },
  ];
}
