import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemUserNotificationApi {
  export interface SystemUserNotification {
    [key: string]: any;
    id: string;
    name: string;
    permissions: string[];
    remark?: string;
    status: 0 | 1;
  }
}

/**
 * 获取用户通知列表数据
 */
async function getUserNotificationList(params: Recordable<any>) {
  return requestClient.get<
    Array<SystemUserNotificationApi.SystemUserNotification>
  >('/api/v1/user/notification/list', { params });
}

/**
 * 更新用户通知状态
 * @param id 用户 ID
 * @param status 用户通知状态
 */
async function updateUserNotificationStatus(
  id: string,
  data: Omit<SystemUserNotificationApi.SystemUserNotification, 'id'>,
) {
  return requestClient.put(`/api/v1/user/notification/status/${id}`, data);
}

/**
 * 删除用户通知
 * @param id 用户通知 ID
 */
async function deleteUserNotification(id: string) {
  return requestClient.delete(`/api/v1/user/notification/${id}`);
}

/**
 * 批量操作用户通知
 * @param data 批量操作用户通知数据
 */
async function batchUserNotifications(data: Recordable<any>) {
  return requestClient.post('/api/v1/user/notification/batch', data);
}

export {
  batchUserNotifications,
  deleteUserNotification,
  getUserNotificationList,
  updateUserNotificationStatus,
};
