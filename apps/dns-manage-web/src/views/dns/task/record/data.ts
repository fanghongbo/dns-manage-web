import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DnsTaskApi } from '#/api/dns/task';

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

export function useColumns<T = DnsTaskApi.DnsTask>(
  _onActionClick: OnActionClickFn<T>,
): VxeTableGridOptions['columns'] {
  return [
    {
      align: 'center',
      type: 'checkbox',
      width: 50,
    },
    {
      field: 'providerName',
      title: $t('dns.provider.providerName'),
      width: 200,
    },
    {
      field: 'domainName',
      title: $t('dns.task.domainName'),
      visible: false,
      width: 200,
    },
    {
      field: 'taskType',
      title: $t('dns.task.taskType'),
      cellRender: {
        name: 'CellTag',
        options: [
          {
            color: 'default',
            label: $t('dns.task.taskTypeOptions.dns_record_push'),
            value: 'dns_record_push',
          },
          {
            color: 'default',
            label: $t('dns.task.taskTypeOptions.dns_record_pull'),
            value: 'dns_record_pull',
          },
          {
            color: 'default',
            label: $t('dns.task.taskTypeOptions.dns_record_create'),
            value: 'dns_record_create',
          },
          {
            color: 'default',
            label: $t('dns.task.taskTypeOptions.dns_record_update'),
            value: 'dns_record_update',
          },
          {
            color: 'default',
            label: $t('dns.task.taskTypeOptions.dns_record_delete'),
            value: 'dns_record_delete',
          },
          {
            color: 'default',
            label: $t('dns.task.taskTypeOptions.dns_record_enable'),
            value: 'dns_record_enable',
          },
          {
            color: 'default',
            label: $t('dns.task.taskTypeOptions.dns_record_disable'),
            value: 'dns_record_disable',
          },
          {
            color: 'default',
            label: $t('dns.task.taskTypeOptions.dns_record_batch_enable'),
            value: 'dns_record_batch_enable',
          },
          {
            color: 'default',
            label: $t('dns.task.taskTypeOptions.dns_record_batch_disable'),
            value: 'dns_record_batch_disable',
          },
          {
            color: 'default',
            label: $t('dns.task.taskTypeOptions.dns_record_batch_delete'),
            value: 'dns_record_batch_delete',
          },
        ],
      },
      width: 150,
    },
    {
      field: 'record.host',
      title: $t('dns.record.host'),
      width: 200,
    },
    {
      field: 'record.recordType',
      title: $t('dns.record.type'),
      width: 100,
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
      width: 100,
      formatter: ({ cellValue }: { cellValue: string }) => {
        return $t(`dns.record.lineOptions.${cellValue}` as any);
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
    },
    {
      field: 'record.loadStrategy',
      title: $t('dns.record.loadStrategy'),
      width: 100,
      formatter: ({ cellValue }: { cellValue: string }) => {
        return $t(`dns.record.loadStrategyOptions.${cellValue}` as any);
      },
    },
    {
      field: 'record.weight',
      title: $t('dns.record.weight'),
      width: 100,
      formatter: ({ cellValue }: { cellValue: number }) => {
        return cellValue ?? '-';
      },
    },
    {
      field: 'record.status',
      title: $t('dns.record.status'),
      formatter: ({ cellValue }: { cellValue: string }) => {
        return $t(`dns.record.statusOptions.${cellValue}` as any);
      },
      width: 100,
    },
    {
      field: 'executeTimes',
      title: $t('dns.task.record.executeTimes'),
      width: 100,
      visible: false,
    },
    {
      field: 'maxRetryTimes',
      title: $t('dns.task.record.maxRetryTimes'),
      width: 100,
      visible: false,
    },
    {
      field: 'nextExecuteTime',
      title: $t('dns.task.record.nextExecuteTime'),
      width: 200,
      visible: false,
    },
    {
      field: 'startTime',
      title: $t('dns.task.record.startTime'),
      width: 200,
      visible: false,
    },
    {
      field: 'finishTime',
      title: $t('dns.task.record.finishTime'),
      width: 200,
      visible: false,
    },
    {
      field: 'durationMs',
      title: $t('dns.task.record.durationMs'),
      width: 100,
      formatter: ({ cellValue }: { cellValue: number }) => {
        if (cellValue === null || cellValue === undefined) {
          return '-';
        }

        const ms = Number(cellValue);
        if (Number.isNaN(ms) || ms < 0) {
          return '-';
        }

        const SECOND = 1000;
        const MINUTE = 60 * SECOND;
        const HOUR = 60 * MINUTE;

        // 小于 1 秒，显示毫秒
        if (ms < SECOND) {
          return `${ms}ms`;
        }

        // 小于 1 分钟，显示秒（保留 2 位小数）
        if (ms < MINUTE) {
          const seconds = (ms / SECOND).toFixed(2);
          return `${seconds}s`;
        }

        // 小于 1 小时，显示分钟和秒
        if (ms < HOUR) {
          const minutes = Math.floor(ms / MINUTE);
          const seconds = Math.floor((ms % MINUTE) / SECOND);
          if (seconds === 0) {
            return `${minutes}min`;
          }
          return `${minutes}min ${seconds}s`;
        }

        // 大于等于 1 小时，显示小时、分钟和秒
        const hours = Math.floor(ms / HOUR);
        const minutes = Math.floor((ms % HOUR) / MINUTE);
        const remainingSeconds = Math.floor((ms % MINUTE) / SECOND);

        const parts: string[] = [`${hours}h`];
        if (minutes > 0) {
          parts.push(`${minutes}min`);
        }
        if (remainingSeconds > 0) {
          parts.push(`${remainingSeconds}s`);
        }

        return parts.join(' ');
      },
    },
    {
      field: 'errorMsg',
      title: $t('dns.task.record.errorMsg'),
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
    {
      field: 'createdTime',
      formatter: ({ cellValue }) => {
        return formatDateTime(cellValue);
      },
      title: $t('dns.task.startTime'),
      width: 200,
    },
  ];
}
