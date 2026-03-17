import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DnsRecordApi } from '#/api/dns/record';

import { formatDateTime } from '@vben/utils';

import { z } from '#/adapter/form';
import { $t } from '#/locales';

export function useCreateFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'host',
      label: $t('dns.record.host'),
      rules: z
        .string()
        .min(1, {
          message: $t('ui.formRules.required', [$t('dns.record.host')]),
        })
        .regex(/^[\w.\-*@\u4E00-\u9FA5]+$/, {
          message: $t('dns.record.hostInvalid'),
        }),
    },
    {
      component: 'Select',
      fieldName: 'recordType',
      label: $t('dns.record.type'),
      rules: 'required',
      defaultValue: 'A',
      componentProps: {
        options: [
          {
            label: $t('dns.record.typeOptions.A'),
            value: 'A',
          },
          {
            label: $t('dns.record.typeOptions.AAAA'),
            value: 'AAAA',
          },
          {
            label: $t('dns.record.typeOptions.CNAME'),
            value: 'CNAME',
          },
          {
            label: $t('dns.record.typeOptions.TXT'),
            value: 'TXT',
          },
          {
            label: $t('dns.record.typeOptions.NS'),
            value: 'NS',
          },
          {
            label: $t('dns.record.typeOptions.MX'),
            value: 'MX',
          },
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
      component: 'Select',
      fieldName: 'line',
      label: $t('dns.record.line'),
      rules: 'required',
      defaultValue: 'default',
      componentProps: {
        options: [
          { label: $t('dns.record.lineOptions.default'), value: 'default' },
          { label: $t('dns.record.lineOptions.telecom'), value: 'telecom' },
          { label: $t('dns.record.lineOptions.unicom'), value: 'unicom' },
          { label: $t('dns.record.lineOptions.mobile'), value: 'mobile' },
          { label: $t('dns.record.lineOptions.edu'), value: 'edu' },
          { label: $t('dns.record.lineOptions.internal'), value: 'internal' },
          { label: $t('dns.record.lineOptions.oversea'), value: 'oversea' },
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
      component: 'Select',
      fieldName: 'ttl',
      label: $t('dns.record.ttl'),
      rules: 'required',
      defaultValue: 600,
      componentProps: {
        options: [
          { label: $t('dns.record.ttlOptions.60'), value: 60 },
          { label: $t('dns.record.ttlOptions.300'), value: 300 },
          { label: $t('dns.record.ttlOptions.600'), value: 600 },
          { label: $t('dns.record.ttlOptions.1800'), value: 1800 },
          { label: $t('dns.record.ttlOptions.3600'), value: 3600 },
          { label: $t('dns.record.ttlOptions.7200'), value: 7200 },
          { label: $t('dns.record.ttlOptions.14400'), value: 14_400 },
          { label: $t('dns.record.ttlOptions.28800'), value: 28_800 },
          { label: $t('dns.record.ttlOptions.57600'), value: 57_600 },
          { label: $t('dns.record.ttlOptions.86400'), value: 86_400 },
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
      component: 'Select',
      fieldName: 'loadStrategy',
      label: $t('dns.record.loadStrategy'),
      rules: 'required',
      defaultValue: 'rr',
      dependencies: {
        triggerFields: ['recordType'],
        componentProps: (values, formApi) => {
          const recordType = values.recordType;
          let options: Array<{ label: string; value: string }> = [];

          switch (recordType) {
            case 'A': {
              // A 类型：可以选择 rr 和 wrr
              options = [
                { label: $t('dns.record.loadStrategyOptions.rr'), value: 'rr' },
                {
                  label: $t('dns.record.loadStrategyOptions.wrr'),
                  value: 'wrr',
                },
              ];

              break;
            }
            case 'AAAA': {
              // AAAA 类型：可以选择 rr 和 wrr
              options = [
                { label: $t('dns.record.loadStrategyOptions.rr'), value: 'rr' },
                {
                  label: $t('dns.record.loadStrategyOptions.wrr'),
                  value: 'wrr',
                },
              ];

              break;
            }
            case 'CNAME': {
              // CNAME 类型：只能选择 wrr
              options = [
                {
                  label: $t('dns.record.loadStrategyOptions.wrr'),
                  value: 'wrr',
                },
              ];

              break;
            }
            case 'MX': {
              // MX 类型：只能选择 rr
              options = [
                { label: $t('dns.record.loadStrategyOptions.rr'), value: 'rr' },
              ];

              break;
            }
            case 'NS': {
              // NS 类型：只能选择 rr
              options = [
                { label: $t('dns.record.loadStrategyOptions.rr'), value: 'rr' },
              ];

              break;
            }
            case 'TXT': {
              // TXT 类型：只能选择 rr
              options = [
                { label: $t('dns.record.loadStrategyOptions.rr'), value: 'rr' },
              ];

              break;
            }
            default: {
              // 默认：rr 和 wrr
              options = [
                { label: $t('dns.record.loadStrategyOptions.rr'), value: 'rr' },
                {
                  label: $t('dns.record.loadStrategyOptions.wrr'),
                  value: 'wrr',
                },
              ];
            }
          }

          // 如果当前值不在新选项中，重置为第一个选项
          const currentValue = values.loadStrategy;
          if (
            currentValue &&
            !options.some((opt) => opt.value === currentValue)
          ) {
            formApi?.setFieldValue('loadStrategy', options[0]?.value || 'rr');
          }

          return {
            options,
            showSearch: true,
            filterOption: (input: string, option: any) => {
              return (option?.label ?? '')
                .toLowerCase()
                .includes(input.toLowerCase());
            },
            style: { width: '100%' },
          };
        },
      },
      componentProps: {
        options: [
          { label: $t('dns.record.loadStrategyOptions.rr'), value: 'rr' },
          { label: $t('dns.record.loadStrategyOptions.wrr'), value: 'wrr' },
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
      fieldName: 'recordValues',
      formItemClass: 'items-start',
      label: $t('dns.record.value'),
      modelPropName: 'modelValue',
    },
  ];
}

export function useUpdateFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'host',
      label: $t('dns.record.host'),
      rules: 'required',
    },
    {
      component: 'Select',
      fieldName: 'recordType',
      label: $t('dns.record.type'),
      rules: 'required',
      componentProps: {
        options: [
          { label: $t('dns.record.typeOptions.A'), value: 'A' },
          { label: $t('dns.record.typeOptions.AAAA'), value: 'AAAA' },
          { label: $t('dns.record.typeOptions.CNAME'), value: 'CNAME' },
          { label: $t('dns.record.typeOptions.TXT'), value: 'TXT' },
          { label: $t('dns.record.typeOptions.MX'), value: 'MX' },
          { label: $t('dns.record.typeOptions.NS'), value: 'NS' },
        ],
        defaultValue: 'A',
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
      fieldName: 'line',
      label: $t('dns.record.line'),
      rules: 'required',
      componentProps: {
        options: [
          { label: $t('dns.record.lineOptions.default'), value: 'default' },
          { label: $t('dns.record.lineOptions.telecom'), value: 'telecom' },
          { label: $t('dns.record.lineOptions.unicom'), value: 'unicom' },
          { label: $t('dns.record.lineOptions.mobile'), value: 'mobile' },
          { label: $t('dns.record.lineOptions.edu'), value: 'edu' },
          { label: $t('dns.record.lineOptions.internal'), value: 'internal' },
          { label: $t('dns.record.lineOptions.oversea'), value: 'oversea' },
        ],
        defaultValue: 'default',
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
      fieldName: 'ttl',
      label: $t('dns.record.ttl'),
      rules: 'required',
      componentProps: {
        options: [
          { label: $t('dns.record.ttlOptions.60'), value: 60 },
          { label: $t('dns.record.ttlOptions.300'), value: 300 },
          { label: $t('dns.record.ttlOptions.600'), value: 600 },
          { label: $t('dns.record.ttlOptions.1800'), value: 1800 },
          { label: $t('dns.record.ttlOptions.3600'), value: 3600 },
          { label: $t('dns.record.ttlOptions.7200'), value: 7200 },
          { label: $t('dns.record.ttlOptions.14400'), value: 14_400 },
          { label: $t('dns.record.ttlOptions.28800'), value: 28_800 },
          { label: $t('dns.record.ttlOptions.57600'), value: 57_600 },
          { label: $t('dns.record.ttlOptions.86400'), value: 86_400 },
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
      component: 'Select',
      fieldName: 'loadStrategy',
      label: $t('dns.record.loadStrategy'),
      rules: 'required',
      defaultValue: 'rr',
      dependencies: {
        triggerFields: ['recordType'],
        componentProps: (values, formApi) => {
          const recordType = values.recordType;
          let options: Array<{ label: string; value: string }> = [];

          switch (recordType) {
            case 'A': {
              // A 类型：可以选择 rr 和 wrr
              options = [
                { label: $t('dns.record.loadStrategyOptions.rr'), value: 'rr' },
                {
                  label: $t('dns.record.loadStrategyOptions.wrr'),
                  value: 'wrr',
                },
              ];

              break;
            }
            case 'AAAA': {
              // AAAA 类型：可以选择 rr 和 wrr
              options = [
                { label: $t('dns.record.loadStrategyOptions.rr'), value: 'rr' },
                {
                  label: $t('dns.record.loadStrategyOptions.wrr'),
                  value: 'wrr',
                },
              ];

              break;
            }
            case 'CNAME': {
              // CNAME 类型：只能选择 wrr
              options = [
                {
                  label: $t('dns.record.loadStrategyOptions.wrr'),
                  value: 'wrr',
                },
              ];

              break;
            }
            case 'MX': {
              // MX 类型：只能选择 rr
              options = [
                { label: $t('dns.record.loadStrategyOptions.rr'), value: 'rr' },
              ];

              break;
            }
            case 'NS': {
              // NS 类型：只能选择 rr
              options = [
                { label: $t('dns.record.loadStrategyOptions.rr'), value: 'rr' },
              ];

              break;
            }
            case 'TXT': {
              // TXT 类型：只能选择 rr
              options = [
                { label: $t('dns.record.loadStrategyOptions.rr'), value: 'rr' },
              ];

              break;
            }
            default: {
              // 默认：rr 和 wrr
              options = [
                { label: $t('dns.record.loadStrategyOptions.rr'), value: 'rr' },
                {
                  label: $t('dns.record.loadStrategyOptions.wrr'),
                  value: 'wrr',
                },
              ];
            }
          }

          // 如果当前值不在新选项中，重置为第一个选项
          const currentValue = values.loadStrategy;
          if (
            currentValue &&
            !options.some((opt) => opt.value === currentValue)
          ) {
            formApi?.setFieldValue('loadStrategy', options[0]?.value || 'rr');
          }

          return {
            options,
            showSearch: true,
            filterOption: (input: string, option: any) => {
              return (option?.label ?? '')
                .toLowerCase()
                .includes(input.toLowerCase());
            },
            style: { width: '100%' },
          };
        },
      },
      componentProps: {
        // disabled: true,
        options: [
          { label: $t('dns.record.loadStrategyOptions.rr'), value: 'rr' },
          { label: $t('dns.record.loadStrategyOptions.wrr'), value: 'wrr' },
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
      component: 'InputNumber',
      fieldName: 'weight',
      label: $t('dns.record.weight'),
      rules: 'required',
      componentProps: {
        min: 1,
        max: 100,
        style: { width: '100%' },
      },
      dependencies: {
        triggerFields: ['loadStrategy'],
        if: (values) => {
          return values.loadStrategy === 'wrr';
        },
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'priority',
      label: $t('dns.record.priority'),
      rules: 'required',
      componentProps: {
        min: 0,
        max: 50,
        style: { width: '100%' },
      },
      dependencies: {
        triggerFields: ['recordType'],
        if: (values) => {
          return values.recordType === 'MX';
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'value',
      label: $t('dns.record.value'),
      dependencies: {
        triggerFields: ['recordType', 'value'],
        rules: (values) => {
          const recordType = values.recordType;
          // 基础必填验证
          const baseSchema = z.string().min(1, {
            message: $t('ui.formRules.required', [$t('dns.record.value')]),
          });

          // 根据记录类型动态添加正则验证
          switch (recordType) {
            case 'A': {
              // A 记录：必须是 IPv4 地址
              return baseSchema.regex(
                /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})$/,
                {
                  message: $t('dns.record.valueInvalidIp'),
                },
              );
            }
            case 'AAAA': {
              // AAAA 记录：必须是 IPv6 地址
              // 首先用正则排除无效字符（只允许十六进制字符和冒号）
              return baseSchema
                .regex(/^[0-9a-f:]+$/i, {
                  message: $t('dns.record.valueInvalidIpv6'),
                })
                .refine(
                  (val: string) => {
                    if (!val || val.trim() === '') {
                      return false;
                    }

                    // 排除 IPv4 地址格式（包含点号的格式）
                    if (val.includes('.')) {
                      return false;
                    }

                    // 检查 :: 只能出现一次
                    const doubleColonCount = (val.match(/::/g) || []).length;
                    if (doubleColonCount > 1) {
                      return false;
                    }

                    // 不能以单个冒号开头或结尾（除了 ::）
                    if (val.startsWith(':') && !val.startsWith('::')) {
                      return false;
                    }
                    if (val.endsWith(':') && !val.endsWith('::')) {
                      return false;
                    }

                    // 分割地址
                    const parts = val.split(':');
                    const hasDoubleColon = val.includes('::');

                    // 验证每组都是有效的十六进制数（1-4 位）或空（在 :: 处）
                    const isValidGroup = (group: string) => {
                      if (!group) return true; // 空组在 :: 压缩中是允许的
                      return /^[0-9a-f]{1,4}$/i.test(group);
                    };

                    if (!parts.every((group) => isValidGroup(group))) {
                      return false;
                    }

                    // 计算实际的组数（非空组）
                    const nonEmptyParts = parts.filter((p) => p.length > 0);
                    const totalGroups = nonEmptyParts.length;

                    if (hasDoubleColon) {
                      // 有压缩格式 ::，非空组数应该在 0-7 之间
                      // :: 会补齐到总共 8 组
                      if (totalGroups < 0 || totalGroups > 7) {
                        return false;
                      }
                      // 确保分割后的部分数不超过 9（因为有 :: 会产生空字符串）
                      if (parts.length > 9) {
                        return false;
                      }
                    } else {
                      // 没有压缩格式，必须正好 8 组
                      if (totalGroups !== 8 || parts.length !== 8) {
                        return false;
                      }
                    }

                    return true;
                  },
                  {
                    message: $t('dns.record.valueInvalidIpv6'),
                  },
                );
            }
            case 'CNAME': {
              // CNAME 记录：必须是域名（不能是 IP 地址）
              return baseSchema
                .regex(
                  /^(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)*[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i,
                  {
                    message: $t('dns.record.valueInvalidDomain'),
                  },
                )
                .refine(
                  (val: string) => {
                    // 首先排除 IP 地址格式（纯数字和点号的组合）
                    const ipRegex =
                      /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})$/;
                    if (ipRegex.test(val)) {
                      return false;
                    }
                    // 域名必须包含至少一个字母（不能全是数字）
                    if (!/[a-z]/i.test(val)) {
                      return false;
                    }
                    return val.length <= 253;
                  },
                  {
                    message: $t('dns.record.valueInvalidDomain'),
                  },
                );
            }
            case 'MX': {
              // MX 记录：必须是域名（不能是 IP 地址）
              return baseSchema
                .regex(
                  /^(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)*[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i,
                  {
                    message: $t('dns.record.valueInvalidDomainMx'),
                  },
                )
                .refine(
                  (val: string) => {
                    // 首先排除 IP 地址格式（纯数字和点号的组合）
                    const ipRegex =
                      /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})$/;
                    if (ipRegex.test(val)) {
                      return false;
                    }
                    // 域名必须包含至少一个字母（不能全是数字）
                    if (!/[a-z]/i.test(val)) {
                      return false;
                    }
                    return val.length <= 253;
                  },
                  {
                    message: $t('dns.record.valueInvalidDomainMx'),
                  },
                );
            }
            case 'NS': {
              // NS 记录：必须是域名（不能是 IP 地址）
              return baseSchema
                .regex(
                  /^(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)*[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i,
                  {
                    message: $t('dns.record.valueInvalidDomainNs'),
                  },
                )
                .refine(
                  (val: string) => {
                    // 首先排除 IP 地址格式（纯数字和点号的组合）
                    const ipRegex =
                      /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})$/;
                    if (ipRegex.test(val)) {
                      return false;
                    }
                    // 域名必须包含至少一个字母（不能全是数字）
                    if (!/[a-z]/i.test(val)) {
                      return false;
                    }
                    return val.length <= 253;
                  },
                  {
                    message: $t('dns.record.valueInvalidDomainNs'),
                  },
                );
            }
            case 'TXT': {
              // TXT 记录：只能包含字母、数字、*?-_~=:;.@+^/!"
              return baseSchema
                .regex(/^[\w*?\-~=:;.@+^/!"]*$/, {
                  message: $t('dns.record.valueInvalidTxt'),
                })
                .max(512, {
                  message: $t('dns.record.valueInvalidTxt'),
                });
            }
            default: {
              return baseSchema;
            }
          }
        },
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
      label: $t('dns.record.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('dns.record.remark'),
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
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
          { label: $t('common.enabled'), value: 'active' },
          { label: $t('common.disabled'), value: 'inactive' },
        ],
      },
      fieldName: 'status',
      label: $t('dns.record.status'),
    },
    {
      component: 'Input',
      fieldName: 'remark',
      label: $t('dns.record.remark'),
    },
    {
      component: 'RangePicker',
      fieldName: 'createdTime',
      label: $t('dns.record.createdTime'),
    },
  ];
}

export function useColumns<T = DnsRecordApi.DnsRecord>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
  hasAccessByCodes?: (codes: string[]) => boolean,
): VxeTableGridOptions['columns'] {
  return [
    {
      align: 'center',
      type: 'checkbox',
      width: 50,
    },
    {
      field: 'host',
      title: $t('dns.record.host'),
      width: 200,
    },
    {
      field: 'recordType',
      title: $t('dns.record.type'),
      width: 100,
    },
    {
      field: 'line',
      title: $t('dns.record.line'),
      width: 100,
      formatter: ({ cellValue }: { cellValue: string }) => {
        return $t(`dns.record.lineOptions.${cellValue}` as any);
      },
    },
    {
      field: 'value',
      title: $t('dns.record.value'),
      width: 200,
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
      formatter: ({ cellValue, row }: { cellValue: number; row: any }) => {
        // 当负载策略为 rr 时，显示中横线
        if (row?.loadStrategy === 'rr') {
          return '-';
        }

        return cellValue;
      },
    },
    {
      field: 'priority',
      title: $t('dns.record.priority'),
      width: 100,
      visible: false,
    },
    {
      field: 'ttl',
      title: $t('dns.record.ttl'),
      width: 100,
      formatter: ({ cellValue }) => {
        return $t(`dns.record.ttlOptions.${cellValue}` as any);
      },
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        // eslint-disable-next-line prettier/prettier
        name: onStatusChange ? (hasAccessByCodes?.(['dns.record.update']) ? 'CellSwitch' : 'CellTag') : 'CellTag',
      },
      field: 'status',
      title: $t('dns.record.status'),
      width: 150,
    },
    {
      field: 'remark',
      minWidth: 100,
      title: $t('dns.record.remark'),
    },
    {
      field: 'createdTime',
      formatter: ({ cellValue }) => {
        return formatDateTime(cellValue);
      },
      title: $t('dns.record.createdTime'),
      width: 200,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'host',
          nameTitle: $t('dns.record.host'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'check',
            text: $t('dns.record.check'),
            show: hasAccessByCodes
              ? hasAccessByCodes(['dns.record.check'])
              : true,
          },
          // {
          //   code: 'test',
          //   text: $t('dns.record.test'),
          // },
          {
            code: 'edit',
            text: $t('common.edit'),
            show: hasAccessByCodes
              ? hasAccessByCodes(['dns.record.update'])
              : true,
          },
          {
            code: 'delete',
            text: $t('common.delete'),
            show: hasAccessByCodes
              ? hasAccessByCodes(['dns.record.delete'])
              : true,
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('dns.domain.operation'),
      width: 200,
    },
  ];
}
