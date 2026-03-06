import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemRoleApi {
  export interface SystemRole {
    [key: string]: any;
    id: string;
    name: string;
    permissions: string[];
    remark?: string;
    status: 0 | 1;
  }
}

/**
 * 获取角色列表数据
 */
async function getRoleList(params: Recordable<any>) {
  return requestClient.get<Array<SystemRoleApi.SystemRole>>(
    '/api/v1/role/list',
    { params },
  );
}

/**
 * 创建角色
 * @param data 角色数据
 */
async function createRole(data: Omit<SystemRoleApi.SystemRole, 'id'>) {
  return requestClient.post('/api/v1/role', data);
}

/**
 * 更新角色
 *
 * @param id 角色 ID
 * @param data 角色数据
 */
async function updateRole(
  id: string,
  data: Omit<SystemRoleApi.SystemRole, 'id'>,
) {
  return requestClient.put(`/api/v1/role/${id}`, data);
}

/**
 * 更新角色状态
 * @param id 角色 ID
 * @param status 角色状态
 */
async function updateRoleStatus(
  id: string,
  data: Omit<SystemRoleApi.SystemRole, 'id'>,
) {
  return requestClient.put(`/api/v1/role/status/${id}`, data);
}

/**
 * 删除角色组
 * @param id 角色组 ID
 */
async function deleteRole(id: string) {
  return requestClient.delete(`/api/v1/role/${id}`);
}

/**
 * 获取角色数据
 */
async function getRoles() {
  return requestClient.get<Array<SystemRoleApi.SystemRole>>('/api/v1/roles');
}

export {
  createRole,
  deleteRole,
  getRoleList,
  getRoles,
  updateRole,
  updateRoleStatus,
};
