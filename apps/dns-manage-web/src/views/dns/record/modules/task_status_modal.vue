<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import { computed, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { Button, Tag } from 'ant-design-vue';

import { getDnsTaskStatus } from '#/api/dns/task';
import { $t } from '#/locales';

interface TaskStatusData {
  id: string;
  name: string;
  status: number;
  durationMs: string;
  results: Array<{
    fail: number;
    id: string;
    providerName: string;
    success: number;
  }>;
}

interface Props {
  taskId?: number | string;
  open?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  taskId: undefined,
  open: false,
});

defineEmits<{
  'update:open': [value: boolean];
}>();

const router = useRouter();

const taskStatus = ref<null | TaskStatusData>(null);
const loading = ref(false);
let statusTimer: null | ReturnType<typeof setInterval> = null;

// 监听 taskId 变化，重新初始化
watch(
  () => props.taskId,
  (newTaskId) => {
    if (newTaskId && props.open) {
      // 重置状态
      taskStatus.value = null;
      // 清除旧的定时器
      if (statusTimer) {
        clearInterval(statusTimer);
        statusTimer = null;
      }
      // 开始新的轮询
      fetchTaskStatus();
      statusTimer = setInterval(() => {
        if (shouldStopPolling.value) {
          // 如果已完成，清除定时器
          if (statusTimer) {
            clearInterval(statusTimer);
            statusTimer = null;
          }
        } else {
          fetchTaskStatus();
        }
      }, 2000);
    } else {
      // taskId 为空或模态框关闭时，清除定时器
      if (statusTimer) {
        clearInterval(statusTimer);
        statusTimer = null;
      }
    }
  },
  { immediate: true },
);

// 监听 open 变化
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      // 模态框关闭时，清除定时器
      if (statusTimer) {
        clearInterval(statusTimer);
        statusTimer = null;
      }
    } else if (props.taskId) {
      // 模态框打开时，开始轮询
      taskStatus.value = null;
      fetchTaskStatus();
      statusTimer = setInterval(() => {
        if (shouldStopPolling.value) {
          if (statusTimer) {
            clearInterval(statusTimer);
            statusTimer = null;
          }
        } else {
          fetchTaskStatus();
        }
      }, 2000);
    }
  },
);

const statusText = computed(() => {
  if (!taskStatus.value) return '';
  return $t(`dns.task.statusOptions.${taskStatus.value.status}` as any);
});

const statusColor = computed(() => {
  if (!taskStatus.value) return 'default';
  const colorMap: Recordable<string> = {
    0: 'default',
    1: 'processing',
    2: 'success',
    3: 'error',
    4: 'default',
  };
  return colorMap[taskStatus.value.status] || 'default';
});

const shouldStopPolling = computed(() => {
  return taskStatus.value?.status === 2 || taskStatus.value?.status === 3;
});

// 格式化执行时长
function formatDuration(durationMs: number | string): string {
  const ms = Number(durationMs);
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
}

async function fetchTaskStatus() {
  if (!props.taskId) return;

  try {
    loading.value = true;
    const response = await getDnsTaskStatus(props.taskId);
    taskStatus.value = response as TaskStatusData;

    // 如果任务已完成（成功或失败），停止轮询
    if (shouldStopPolling.value && statusTimer) {
      clearInterval(statusTimer);
      statusTimer = null;
    }
  } catch (error) {
    console.error('获取任务状态失败:', error);
  } finally {
    loading.value = false;
  }
}

async function handleViewTask(taskId: number | string) {
  router.push(`/dns/task/${taskId}/record/list`);
}

onUnmounted(() => {
  if (statusTimer) {
    clearInterval(statusTimer);
    statusTimer = null;
  }
});
</script>

<template>
  <div class="task-status-modal">
    <div v-if="loading && !taskStatus" class="flex-center min-h-[200px]">
      <span>加载中...</span>
    </div>
    <div v-else-if="taskStatus" class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm text-muted-foreground">
            {{ $t('dns.task.taskName') }}
          </div>
          <div class="text-base font-medium">
            <span>{{ taskStatus.name }}</span>
            <Button
              type="link"
              size="small"
              @click="handleViewTask(taskStatus.id)"
            >
              {{ $t('dns.task.viewDetail') }}
            </Button>
          </div>
        </div>
        <Tag :color="statusColor">{{ statusText }}</Tag>
      </div>

      <div>
        <div class="mb-2 text-sm text-muted-foreground">
          {{ $t('dns.task.detail') }}
        </div>
        <div class="space-y-2">
          <div
            v-for="result in taskStatus.results"
            :key="result.id"
            class="flex items-center justify-between rounded border p-3"
          >
            <div class="font-medium">{{ result.providerName }}</div>
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <span class="text-sm text-muted-foreground">成功:</span>
                <Tag color="success">{{ result.success }}</Tag>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-muted-foreground">失败:</span>
                <Tag color="error">{{ result.fail }}</Tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="taskStatus.durationMs" class="text-sm text-muted-foreground">
        {{ $t('dns.task.durationMs') }}:
        {{ formatDuration(taskStatus.durationMs) }}
      </div>
    </div>
  </div>
</template>

<style scoped></style>
