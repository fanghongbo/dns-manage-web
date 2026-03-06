<script lang="ts" setup>
import type { DnsRecordApi } from '#/api/dns/record';

import { computed, nextTick, ref } from 'vue';
import { useRoute } from 'vue-router';

import { useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Input, InputNumber, message, Switch } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createDnsRecord, updateDnsRecord } from '#/api/dns/record';
import { $t } from '#/locales';

import { useCreateFormSchema } from '../data';

const emits = defineEmits<{
  success: [];
  taskCreated: [taskId: number | string];
}>();

const route = useRoute();
const domainId = computed(() => route.params.domainId as string);

const formData = ref<DnsRecordApi.DnsRecord>();

interface RecordItem {
  recordValue: string;
  status: 0 | 1;
  remark: string;
  weight?: number;
  priority?: number;
  error?: string; // 验证错误消息
}

const recordItems = ref<RecordItem[]>([
  {
    recordValue: '',
    status: 1,
    remark: '',
    weight: 1,
    error: '',
  },
]);

// 监听负载策略变化
const loadStrategy = ref('rr');
const recordType = ref('A');

const showWeightColumn = computed(() => loadStrategy.value === 'wrr');
const showPriorityColumn = computed(() => recordType.value === 'MX');

// 动态计算列数
const gridColumns = computed(() => {
  let columns = '2fr 1fr'; // 记录值、状态
  if (showPriorityColumn.value) {
    columns += ' 1fr'; // 优先级
  }
  if (showWeightColumn.value) {
    columns += ' 1fr'; // 权重
  }
  columns += ' 2fr 1fr'; // 备注、操作
  return columns;
});

function addRecordItem() {
  const newItem: RecordItem = {
    recordValue: '',
    status: 1,
    remark: '',
    error: '',
  };
  if (showWeightColumn.value) {
    newItem.weight = 1;
  }
  if (showPriorityColumn.value) {
    newItem.priority = 10;
  }
  recordItems.value.push(newItem);
}

function removeRecordItem(index: number) {
  recordItems.value.splice(index, 1);
}

const [Form, formApi] = useVbenForm({
  schema: useCreateFormSchema(),
  showDefaultActions: false,
  handleValuesChange: async (values, changedFields) => {
    // 当负载策略字段变化时，更新权重列的显示
    if (changedFields.includes('loadStrategy')) {
      loadStrategy.value = values.loadStrategy || 'rr';
      // 如果切换到非 wrr，清除权重值
      if (values.loadStrategy === 'wrr') {
        // 如果切换到 wrr，为所有记录添加默认权重
        recordItems.value.forEach((item) => {
          if (item.weight === undefined || item.weight === null) {
            item.weight = 1;
          }
        });
      } else {
        recordItems.value.forEach((item) => {
          delete item.weight;
        });
      }
    }
    // 当记录类型变化时，更新优先级列的显示并重新验证所有记录值
    if (changedFields.includes('recordType')) {
      recordType.value = values.recordType || 'A';
      if (values.recordType === 'MX') {
        // 如果是 MX 类型，为所有记录添加默认优先级
        recordItems.value.forEach((item) => {
          if (item.priority === undefined || item.priority === null) {
            item.priority = 10;
          }
        });
      } else {
        // 如果不是 MX 类型，清除优先级值
        recordItems.value.forEach((item) => {
          delete item.priority;
        });
      }
      await validateAllRecordItems();
    }
  },
});

// 验证函数
function validateIpAddress(ip: string): boolean {
  // IPv4 地址验证
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})$/;
  return ipv4Regex.test(ip);
}

function validateDomain(domain: string): boolean {
  // 域名验证：字母、数字、连字符、点号，不能以连字符开头或结尾
  // 首先排除 IP 地址格式（纯数字和点号的组合）
  const ipRegex =
    /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})$/;
  if (ipRegex.test(domain)) {
    return false;
  }
  // 域名必须包含至少一个字母（不能全是数字）
  if (!/[a-z]/i.test(domain)) {
    return false;
  }
  const domainRegex =
    /^(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)*[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i;
  return domainRegex.test(domain) && domain.length <= 253;
}

function validateTxtRecord(txt: string): boolean {
  // TXT 记录：只能包含字母、数字、*?-_~=:;.@+^/!"
  const txtRegex = /^[\w*?\-~=:;.@+^/!"]*$/;
  return txtRegex.test(txt) && txt.length <= 512;
}

function validateIpv6Address(ipv6: string): boolean {
  if (!ipv6 || ipv6.trim() === '') {
    return false;
  }

  // 首先排除 IPv4 地址格式（包含点号的格式）
  if (ipv6.includes('.')) {
    return false;
  }

  // 排除包含非十六进制字符的情况（除了冒号）
  if (!/^[0-9a-f:]+$/i.test(ipv6)) {
    return false;
  }

  // 检查 :: 只能出现一次
  const doubleColonCount = (ipv6.match(/::/g) || []).length;
  if (doubleColonCount > 1) {
    return false;
  }

  // 不能以单个冒号开头或结尾（除了 ::）
  if (ipv6.startsWith(':') && !ipv6.startsWith('::')) {
    return false;
  }
  if (ipv6.endsWith(':') && !ipv6.endsWith('::')) {
    return false;
  }

  // 分割地址
  const parts = ipv6.split(':');
  const hasDoubleColon = ipv6.includes('::');

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
}

// 验证单个记录值，返回错误消息或空字符串
function validateRecordValue(recordValue: string, recordType: string): string {
  const trimmedValue = recordValue.trim();

  // 如果为空，不验证（由必填验证处理）
  if (!trimmedValue) {
    return '';
  }

  switch (recordType) {
    case 'A': {
      if (!validateIpAddress(trimmedValue)) {
        return $t('dns.record.valueInvalidIp');
      }
      break;
    }
    case 'AAAA': {
      if (!validateIpv6Address(trimmedValue)) {
        return $t('dns.record.valueInvalidIpv6');
      }
      break;
    }
    case 'CNAME': {
      if (!validateDomain(trimmedValue)) {
        return $t('dns.record.valueInvalidDomain');
      }
      break;
    }
    case 'MX': {
      if (!validateDomain(trimmedValue)) {
        return $t('dns.record.valueInvalidDomainMx');
      }
      break;
    }
    case 'NS': {
      if (!validateDomain(trimmedValue)) {
        return $t('dns.record.valueInvalidDomainNs');
      }
      break;
    }
    case 'TXT': {
      if (!validateTxtRecord(trimmedValue)) {
        return $t('dns.record.valueInvalidTxt');
      }
      break;
    }
  }
  return '';
}

// 验证所有记录项
async function validateAllRecordItems(): Promise<void> {
  const values = await formApi.getValues();
  const recordType = values.recordType;

  for (const item of recordItems.value) {
    if (!item) continue;
    item.error = validateRecordValue(item.recordValue, recordType);
  }
}

const id = ref();
const [Drawer, drawerApi] = useVbenDrawer({
  class: '!w-[45vw] max-w-none',
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();

    // 验证记录项
    const hasEmptyValue = recordItems.value.some(
      (item) => !item.recordValue?.trim(),
    );
    if (hasEmptyValue) {
      message.error($t('dns.record.valueInvalid'));
      return;
    }

    // 根据记录类型验证记录值
    await validateAllRecordItems();
    const hasValidationError = recordItems.value.some((item) => item?.error);
    if (hasValidationError) {
      message.error($t('dns.record.valueInvalid'));
      return;
    }

    drawerApi.lock();

    try {
      let res: any;
      if (id.value) {
        // 编辑模式：更新单条记录
        res = await updateDnsRecord(id.value, values);
      } else {
        // 创建模式：批量创建多条记录
        const baseData = {
          ...values,
          domainId: domainId.value,
        };

        // 构建 recordValues 数组
        const recordValues = recordItems.value.map((item) => {
          const recordValue: Record<string, any> = {
            value: item.recordValue,
            // 确保 status 始终是数字 1 或 0，而不是 boolean
            status: item.status ? 1 : 0,
            remark: item.remark || '',
          };
          // 如果负载策略是 wrr，添加 weight
          if (showWeightColumn.value && item.weight) {
            recordValue.weight = item.weight;
          }
          // 如果记录类型是 MX，添加 priority
          if (showPriorityColumn.value && item.priority) {
            recordValue.priority = item.priority;
          }
          return recordValue;
        });
        // 一次性创建多条记录，传递 recordValues 数组
        res = await createDnsRecord({
          ...baseData,
          values: recordValues,
        });
      }

      emits('success');
      if (res?.taskId) {
        emits('taskCreated', res.taskId);
      }
      drawerApi.close();
    } catch {
      drawerApi.unlock();
    }
  },

  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<DnsRecordApi.DnsRecord>();
      formApi.resetForm();

      if (data) {
        formData.value = data;
        id.value = data.id;
        // 编辑模式：只显示一条记录
        const editItem: RecordItem = {
          recordValue: data.recordValue || '',
          status: data.status ?? 1,
          remark: data.remark || '',
          error: '',
        };
        if (data.weight !== undefined && data.weight !== null) {
          editItem.weight = data.weight;
        }
        if (data.priority !== undefined && data.priority !== null) {
          editItem.priority = data.priority;
        }
        recordItems.value = [editItem];
      } else {
        id.value = undefined;
        // 创建模式：初始化一条空记录
        const newItem: RecordItem = {
          recordValue: '',
          status: 1,
          remark: '',
          error: '',
        };
        recordItems.value = [newItem];
      }
      // Wait for Vue to flush DOM updates (form fields mounted)
      await nextTick();
      if (data) {
        formApi.setValues(data);
        // 初始化负载策略值和记录类型
        const values = await formApi.getValues();
        loadStrategy.value = values.loadStrategy || 'rr';
        recordType.value = values.recordType || 'A';
        // 如果是 MX 类型，确保有优先级
        if (values.recordType === 'MX') {
          recordItems.value.forEach((item) => {
            if (item.priority === undefined || item.priority === null) {
              item.priority = 10;
            }
          });
        }
        // 验证记录值
        await validateAllRecordItems();
      } else {
        // 创建模式：初始化负载策略值和记录类型
        const values = await formApi.getValues();
        loadStrategy.value = values.loadStrategy || 'rr';
        recordType.value = values.recordType || 'A';
        // 如果是 MX 类型，添加默认优先级
        if (values.recordType === 'MX') {
          recordItems.value.forEach((item) => {
            item.priority = 10;
          });
        }
        // 如果是 wrr，添加默认权重
        if (values.loadStrategy === 'wrr') {
          recordItems.value.forEach((item) => {
            item.weight = 1;
          });
        }
        // 清除所有错误
        recordItems.value.forEach((item) => {
          if (item) {
            item.error = '';
          }
        });
      }
    }
  },
});

const getDrawerTitle = computed(() => {
  return formData.value?.id
    ? $t('common.edit', $t('dns.record.host'))
    : $t('common.create', $t('dns.record.host'));
});
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form>
      <template #recordValues>
        <div class="record-items-container">
          <div
            class="record-items-header"
            :style="{ gridTemplateColumns: gridColumns }"
          >
            <div class="header-cell">{{ $t('dns.record.value') }}</div>
            <div class="header-cell">{{ $t('dns.record.status') }}</div>
            <div v-if="showPriorityColumn" class="header-cell">
              {{ $t('dns.record.priority') }}
            </div>
            <div v-if="showWeightColumn" class="header-cell">
              {{ $t('dns.record.weight') }}
            </div>
            <div class="header-cell">{{ $t('dns.record.remark') }}</div>
            <div class="header-cell">{{ $t('dns.record.operation') }}</div>
          </div>

          <div
            v-for="(item, index) in recordItems"
            :key="index"
            class="record-item-row"
            :style="{ gridTemplateColumns: gridColumns }"
          >
            <div class="item-cell">
              <Input
                v-model:value="item.recordValue"
                :placeholder="$t('dns.record.value')"
                :status="item.error ? 'error' : ''"
                @blur="
                  async () => {
                    const values = await formApi.getValues();
                    if (!item.recordValue) {
                      item.error = $t('dns.record.valueRequired');
                    } else {
                      item.error = validateRecordValue(
                        item.recordValue,
                        values.recordType,
                      );
                    }
                  }
                "
                @input="
                  async () => {
                    // 输入时实时验证
                    if (item.recordValue) {
                      const values = await formApi.getValues();
                      item.error = validateRecordValue(
                        item.recordValue,
                        values.recordType,
                      );
                    } else {
                      item.error = '';
                    }
                  }
                "
              />
              <div v-if="item.error" class="error-message">
                {{ item.error }}
              </div>
            </div>
            <div class="item-cell">
              <Switch
                v-model:checked="item.status"
                :checked-value="1"
                :unchecked-value="0"
              />
            </div>
            <div v-if="showPriorityColumn" class="item-cell">
              <InputNumber
                v-model:value="item.priority"
                :min="0"
                :max="50"
                :placeholder="$t('dns.record.priority')"
                style="width: 100%"
              />
            </div>
            <div v-if="showWeightColumn" class="item-cell">
              <InputNumber
                v-model:value="item.weight"
                :min="1"
                :max="100"
                :placeholder="$t('dns.record.weight')"
                style="width: 100%"
              />
            </div>
            <div class="item-cell">
              <Input
                v-model:value="item.remark"
                :maxlength="50"
                :placeholder="$t('dns.record.remark')"
                :show-count="true"
              />
            </div>
            <div class="item-cell">
              <Button
                :disabled="recordItems.length === 1"
                type="text"
                danger
                @click="removeRecordItem(index)"
              >
                {{ $t('common.delete') }}
              </Button>
            </div>
          </div>

          <div class="add-item-container">
            <Button type="link" @click="addRecordItem">
              <Plus class="size-4" />
              {{ $t('common.create') }}
            </Button>
          </div>
        </div>
      </template>
    </Form>
  </Drawer>
</template>
<style lang="css" scoped>
.record-items-container {
  width: 100%;
  border: 1px solid #e5e6eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.record-items-header {
  display: grid;
  grid-template-columns: 2fr 1fr 2fr 1fr;
  gap: 0;
  padding: 12px 10px;
  background-color: #eff3f8;
  border-bottom: 1px solid #e5e6eb;
  font-weight: 500;
}

.header-cell {
  color: var(--ant-color-text);
  padding: 0 8px;
  font-size: 13px;
  border-right: 1px solid var(--ant-color-border);
}

.header-cell:last-child {
  border-right: none;
}

.record-item-row {
  display: grid;
  gap: 0;
  padding: 8px 10px;
  border-bottom: 1px solid #e5e6eb;
  align-items: center;
}

.record-item-row:first-child {
  background-color: #f5f5f5;
}

.record-item-row:last-child {
  border-bottom: none;
}

.item-cell {
  display: flex;
  align-items: flex-start;
  padding: 0 8px;
  border-right: 1px solid var(--ant-color-border-secondary);
  flex-direction: column;
}

.item-cell:last-child {
  border-right: none;
}

.error-message {
  color: #ff3860;
  font-size: 12.8px;
  padding: 0px;
}

.add-item-container {
  margin-top: 0;
  padding: 8px 16px;
  border-top: 1px solid var(--ant-color-border);
  background-color: var(--ant-color-fill-alter);
}

.add-item-container :deep(.ant-btn-link) {
  padding: 0;
  height: auto;
}
</style>
