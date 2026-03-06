<script lang="ts" setup>
import type { NotificationItem } from '@vben/layouts';

import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { AuthenticationLoginExpiredModal } from '@vben/common-ui';
import { useWatermark } from '@vben/hooks';
import {
  BasicLayout,
  LockScreen,
  Notification,
  UserDropdown,
} from '@vben/layouts';
import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import {
  getUserNotifications,
  updateUserAllNotificationStatus,
  updateUserNotificationStatus,
} from '#/api/system/user';
// import { openWindow } from '@vben/utils';
import { $t } from '#/locales';
import { useAuthStore } from '#/store';
import LoginForm from '#/views/_core/authentication/login.vue';

import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// 创建定时任务从getUserNotifications接口获取消息内容
const notifications = ref<NotificationItem[]>([]);
let notificationTimer: null | ReturnType<typeof setInterval> = null;

const router = useRouter();

// 格式化相对时间
function formatRelativeTime(time: Date | number | string): string {
  try {
    const date = dayjs(time);
    if (!date.isValid()) {
      return String(time);
    }
    return date.fromNow();
  } catch {
    return String(time);
  }
}

function transformNotification(item: any): NotificationItem {
  return {
    id: item.id,
    avatar: item.avatar || preferences.app.defaultAvatar,
    date: formatRelativeTime(item.date),
    isRead: item.status === 1,
    message: item.message || '',
    title: item.title || '',
  };
}

// 获取通知列表
async function fetchNotifications() {
  try {
    const response = await getUserNotifications();
    notifications.value = response.map((item) => transformNotification(item));
  } catch (error) {
    console.error('获取通知列表失败:', error);
  }
}

// 初始化并启动定时任务
onMounted(() => {
  // 立即获取一次
  fetchNotifications();
  // 每 5 秒刷新一次
  notificationTimer = setInterval(() => {
    fetchNotifications();
  }, 5000);
});

// 清理定时任务
onUnmounted(() => {
  if (notificationTimer) {
    clearInterval(notificationTimer);
    notificationTimer = null;
  }
});

// const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();
const accessStore = useAccessStore();
const { destroyWatermark, updateWatermark } = useWatermark();
const showDot = computed(() =>
  notifications.value.some((item) => !item.isRead),
);

const menus = computed(() => []);

const avatar = computed(() => {
  return userStore.userInfo?.avatar ?? preferences.app.defaultAvatar;
});

async function handleLogout() {
  await authStore.logout(false);
}

async function markRead(id: number | string) {
  const item = notifications.value.find((item) => item.id === id);
  if (item && !item.isRead) {
    try {
      await updateUserNotificationStatus(id);
      item.isRead = true;
      remove(id);
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  }
}

function remove(id: number | string) {
  notifications.value = notifications.value.filter((item) => item.id !== id);
}

async function handleViewAll() {
  try {
    await router.push('/system/user/notification/list');
  } catch (error) {
    console.error('路由跳转失败:', error);
  }
}

async function handleMakeAll() {
  if (notifications.value.length === 0) {
    return;
  }
  try {
    // 批量标记为已读
    await updateUserAllNotificationStatus();
    notifications.value = [];
  } catch (error) {
    console.error('批量标记已读失败:', error);
  }
}

async function handleNoticeClear() {
  if (notifications.value.length === 0) {
    return;
  }
  try {
    // 批量标记为已读
    await updateUserAllNotificationStatus();
    notifications.value = [];
  } catch (error) {
    console.error('批量标记已读失败:', error);
  }
}

watch(
  () => ({
    enable: preferences.app.watermark,
    content: preferences.app.watermarkContent,
  }),
  async ({ enable, content }) => {
    if (enable) {
      await updateWatermark({
        content:
          content ||
          `${userStore.userInfo?.username} - ${userStore.userInfo?.realName}`,
      });
    } else {
      destroyWatermark();
    }
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <BasicLayout @clear-preferences-and-logout="handleLogout">
    <template #user-dropdown>
      <UserDropdown
        :avatar
        :menus
        :text="userStore.userInfo?.realUsername"
        :description="userStore.userInfo?.username"
        :tag-text="$t('user.online')"
        @logout="handleLogout"
      />
    </template>
    <template #notification>
      <Notification
        :dot="showDot"
        :notifications="notifications"
        @clear="handleNoticeClear"
        @read="(item) => item.id && markRead(item.id)"
        @remove="(item) => item.id && remove(item.id)"
        @make-all="handleMakeAll"
        @view-all="handleViewAll"
      />
    </template>
    <template #extra>
      <AuthenticationLoginExpiredModal
        v-model:open="accessStore.loginExpired"
        :avatar
      >
        <LoginForm />
      </AuthenticationLoginExpiredModal>
    </template>
    <template #lock-screen>
      <LockScreen :avatar @to-login="handleLogout" />
    </template>
  </BasicLayout>
</template>
