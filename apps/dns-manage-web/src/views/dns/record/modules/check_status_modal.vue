<script lang="ts" setup>
import { computed } from 'vue';

import { Spin, Tag } from 'ant-design-vue';

import { $t } from '#/locales';

interface ProviderStatus {
  id: string;
  providerName: string;
  status: number;
}

interface Props {
  data?: ProviderStatus[];
  open?: boolean;
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  data: () => [],
  open: false,
  loading: false,
});

defineEmits<{
  'update:open': [value: boolean];
}>();

const statusText = computed(() => {
  return (status: number) => {
    return status === 1
      ? $t('dns.record.checkStatus.consistent')
      : $t('dns.record.checkStatus.inconsistent');
  };
});

const statusColor = computed(() => {
  return (status: number) => {
    return status === 1 ? 'success' : 'error';
  };
});
</script>

<template>
  <div class="check-status-modal">
    <div v-if="loading" class="flex-center min-h-[200px]">
      <Spin size="large" />
      <span class="ml-2">{{ $t('dns.record.checkStatus.loading') }}</span>
    </div>
    <div
      v-else-if="!data || data.length === 0"
      class="flex-center min-h-[200px]"
    >
      <span>{{ $t('dns.record.checkStatus.noData') }}</span>
    </div>
    <div v-else class="space-y-2">
      <div
        v-for="item in data"
        :key="item.id"
        class="flex items-center justify-between rounded border p-3"
      >
        <div class="font-medium">{{ item.providerName }}</div>
        <Tag :color="statusColor(item.status)">
          {{ statusText(item.status) }}
        </Tag>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
