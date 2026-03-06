import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemUserApi {
  export interface SystemUser {
    [key: string]: any;
    id: string;
    name: string;
    permissions: string[];
    remark?: string;
    status: 0 | 1;
  }
}

/**
 * 获取用户列表数据
 */
async function getUserList(params: Recordable<any>) {
  return requestClient.get<Array<SystemUserApi.SystemUser>>(
    '/api/v1/user/list',
    { params },
  );
}

/**
 * 创建用户
 * @param data 用户数据
 */
async function createUser(data: Omit<SystemUserApi.SystemUser, 'id'>) {
  return requestClient.post('/api/v1/user', data);
}

/**
 * 更新用户
 *
 * @param id 用户 ID
 * @param data 用户数据
 */
async function updateUser(
  id: string,
  data: Omit<SystemUserApi.SystemUser, 'id'>,
) {
  return requestClient.put(`/api/v1/user/${id}`, data);
}

/**
 * 更新用户状态
 * @param id 用户 ID
 * @param status 用户状态
 */
async function updateUserStatus(
  id: string,
  data: Omit<SystemUserApi.SystemUser, 'id'>,
) {
  return requestClient.put(`/api/v1/user/status/${id}`, data);
}

/**
 * 删除用户
 * @param id 用户 ID
 */
async function deleteUser(id: string) {
  return requestClient.delete(`/api/v1/user/${id}`);
}

/**
 * 获取用户列表数据
 */
async function getUsers() {
  return requestClient.get<Array<SystemUserApi.SystemUser>>('/api/v1/users');
}

/**
 * 获取用户通知列表数据
 */
async function getUserNotifications() {
  return requestClient.get<Array<SystemUserApi.SystemUser>>(
    '/api/v1/user/notifications',
  );
}

/**
 * 更新用户通知状态
 * @param id 用户通知 ID
 * @param status 用户通知状态
 */
async function updateUserNotificationStatus(id: number | string) {
  return requestClient.put(`/api/v1/user/notification/status/${id}`, {
    status: 1,
  });
}

/**
 * 更新用户通知状态
 * @param status 用户通知状态
 */
async function updateUserAllNotificationStatus() {
  return requestClient.post(`/api/v1/user/notification/status`, {
    status: 1,
  });
}

export {
  createUser,
  deleteUser,
  getUserList,
  getUserNotifications,
  getUsers,
  updateUser,
  updateUserAllNotificationStatus,
  updateUserNotificationStatus,
  updateUserStatus,
};
