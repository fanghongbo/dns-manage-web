import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DnsTaskApi } from '#/api/dns/task';

import { formatDateTime } from '@vben/utils';

import { $t } from '#/locales';

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'taskName',
      label: $t('dns.task.taskName'),
    },
    {
      component: 'Input',
      fieldName: 'domainName',
      label: $t('dns.task.domainName'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: $t('dns.task.taskTypeOptions.dns_record_push'),
            value: 'dns_record_push',
          },
          {
            label: $t('dns.task.taskTypeOptions.dns_record_pull'),
            value: 'dns_record_pull',
          },
          {
            label: $t('dns.task.taskTypeOptions.dns_record_create'),
            value: 'dns_record_create',
          },
          {
            label: $t('dns.task.taskTypeOptions.dns_record_update'),
            value: 'dns_record_update',
          },
          {
            label: $t('dns.task.taskTypeOptions.dns_record_delete'),
            value: 'dns_record_delete',
          },
          {
            label: $t('dns.task.taskTypeOptions.dns_record_enable'),
            value: 'dns_record_enable',
          },
          {
            label: $t('dns.task.taskTypeOptions.dns_record_disable'),
            value: 'dns_record_disable',
          },
          {
            label: $t('dns.task.taskTypeOptions.dns_record_batch_enable'),
            value: 'dns_record_batch_enable',
          },
          {
            label: $t('dns.task.taskTypeOptions.dns_record_batch_disable'),
            value: 'dns_record_batch_disable',
          },
          {
            label: $t('dns.task.taskTypeOptions.dns_record_batch_delete'),
            value: 'dns_record_batch_delete',
          },
        ],
      },
      fieldName: 'taskType',
      label: $t('dns.task.taskType'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('dns.task.statusOptions.0'), value: 'pending' },
          { label: $t('dns.task.statusOptions.1'), value: 'processing' },
          { label: $t('dns.task.statusOptions.2'), value: 'success' },
          { label: $t('dns.task.statusOptions.3'), value: 'failed' },
          { label: $t('dns.task.statusOptions.4'), value: 'canceled' },
        ],
      },
      fieldName: 'status',
      label: $t('dns.task.status'),
    },
    {
      component: 'RangePicker',
      fieldName: 'createdTime',
      label: $t('dns.task.startTime'),
    },
  ];
}

export function useColumns<T = DnsTaskApi.DnsTask>(
  onActionClick: OnActionClickFn<T>,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'taskName',
      title: $t('dns.task.taskName'),
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
      field: 'domainName',
      minWidth: 200,
      title: $t('dns.task.domainName'),
    },
    {
      field: 'status',
      title: $t('dns.task.status'),
      cellRender: {
        name: 'CellTag',
        options: [
          {
            color: 'default',
            label: $t('dns.task.statusOptions.0'),
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
        ],
      },
      width: 100,
    },
    {
      field: 'startTime',
      title: $t('dns.task.startTime'),
      width: 200,
    },
    {
      field: 'finishTime',
      title: $t('dns.task.finishTime'),
      width: 200,
    },
    {
      field: 'durationMs',
      title: $t('dns.task.durationMs'),
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
      field: 'operator',
      title: $t('dns.task.operator'),
      width: 200,
    },
    {
      field: 'createdTime',
      formatter: ({ cellValue }) => {
        return formatDateTime(cellValue);
      },
      title: $t('dns.task.createdTime'),
      width: 200,
      visible: false,
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
