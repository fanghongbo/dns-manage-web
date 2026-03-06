import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemUserGroupApi {
  export interface SystemUserGroup {
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
async function getUserGroupList(params: Recordable<any>) {
  return requestClient.get<Array<SystemUserGroupApi.SystemUserGroup>>(
    '/api/v1/user/group/list',
    { params },
  );
}

/**
 * 创建用户
 * @param data 用户数据
 */
async function createUserGroup(
  data: Omit<SystemUserGroupApi.SystemUserGroup, 'id'>,
) {
  return requestClient.post('/api/v1/user/group', data);
}

/**
 * 更新用户
 *
 * @param id 用户 ID
 * @param data 用户数据
 */
async function updateUserGroup(
  id: string,
  data: Omit<SystemUserGroupApi.SystemUserGroup, 'id'>,
) {
  return requestClient.put(`/api/v1/user/group/${id}`, data);
}

/**
 * 更新用户状态
 * @param id 用户 ID
 * @param status 用户状态
 */
async function updateUserGroupStatus(
  id: string,
  data: Omit<SystemUserGroupApi.SystemUserGroup, 'id'>,
) {
  return requestClient.put(`/api/v1/user/group/status/${id}`, data);
}

/**
 * 删除用户组
 * @param id 用户组 ID
 */
async function deleteUserGroup(id: string) {
  return requestClient.delete(`/api/v1/user/group/${id}`);
}

/**
 * 获取用户组列表数据
 */
async function getUserGroups() {
  return requestClient.get<Array<SystemUserGroupApi.SystemUserGroup>>(
    '/api/v1/user/groups',
  );
}

export {
  createUserGroup,
  deleteUserGroup,
  getUserGroupList,
  getUserGroups,
  updateUserGroup,
  updateUserGroupStatus,
};
