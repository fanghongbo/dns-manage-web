import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace DnsTaskApi {
  export interface DnsTask {
    [key: string]: any;
    id: string;
    name: string;
    remark?: string;
    status: 0 | 1;
  }
}

/**
 * 获取DNS任务列表数据
 */
async function getDnsTaskList(params: Recordable<any>) {
  return requestClient.get<Array<DnsTaskApi.DnsTask>>('/api/v1/dns/task/list', {
    params,
  });
}

/**
 * 创建DNS任务
 * @param data DNS任务数据
 */
async function createDnsTask(data: Omit<DnsTaskApi.DnsTask, 'id'>) {
  return requestClient.post('/api/v1/dns/task', data);
}

/**
 * 更新DNS任务
 *
 * @param id DNS任务 ID
 * @param data DNS任务数据
 */
async function updateDnsTask(id: string, data: Omit<DnsTaskApi.DnsTask, 'id'>) {
  return requestClient.put(`/api/v1/dns/task/${id}`, data);
}

/**
 * 更新DNS任务状态
 * @param id DNS任务 ID
 * @param status DNS任务状态
 */
async function updateDnsTaskStatus(
  id: string,
  data: Omit<DnsTaskApi.DnsTask, 'id'>,
) {
  return requestClient.put(`/api/v1/dns/task/status/${id}`, data);
}

/**
 * 删除DNS任务组
 * @param id DNS任务组 ID
 */
async function deleteDnsTask(id: string) {
  return requestClient.delete(`/api/v1/dns/task/${id}`);
}

/**
 * 获取DNS任务数据
 */
async function getDnsTasks() {
  return requestClient.get<Array<DnsTaskApi.DnsTask>>('/api/v1/dns/tasks');
}

/**
 * 获取DNS任务状态
 */
async function getDnsTaskStatus(id: number | string) {
  return requestClient.get<DnsTaskApi.DnsTask>(`/api/v1/dns/task/status/${id}`);
}

export {
  createDnsTask,
  deleteDnsTask,
  getDnsTaskList,
  getDnsTasks,
  getDnsTaskStatus,
  updateDnsTask,
  updateDnsTaskStatus,
};
