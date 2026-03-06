import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace DnsRecordApi {
  export interface DnsRecord {
    [key: string]: any;
    id: string;
    domainName: string;
    remark?: string;
    status: 0 | 1;
  }
}

/**
 * 获取DNS记录列表数据
 */
async function getDnsRecordList(params: Recordable<any>) {
  return requestClient.get<Array<DnsRecordApi.DnsRecord>>(
    '/api/v1/dns/record/list',
    { params },
  );
}

/**
 * 创建DNS记录
 * @param data DNS记录数据
 */
async function createDnsRecord(data: Omit<DnsRecordApi.DnsRecord, 'id'>) {
  return requestClient.post('/api/v1/dns/record', data);
}

/**
 * 更新DNS记录
 *
 * @param id DNS记录 ID
 * @param data DNS记录数据
 */
async function updateDnsRecord(
  id: string,
  data: Omit<DnsRecordApi.DnsRecord, 'id'>,
) {
  return requestClient.put(`/api/v1/dns/record/${id}`, data);
}

/**
 * 更新DNS记录状态
 * @param id DNS记录 ID
 * @param status DNS记录状态
 */
async function updateDnsRecordStatus(
  id: string,
  data: Omit<DnsRecordApi.DnsRecord, 'id'>,
) {
  return requestClient.put(`/api/v1/dns/record/status/${id}`, data);
}

/**
 * 删除DNS记录组
 * @param id DNS记录组 ID
 */
async function deleteDnsRecord(id: string) {
  return requestClient.delete(`/api/v1/dns/record/${id}`);
}

/**
 * 获取DNS记录数据
 */
async function getDnsRecords() {
  return requestClient.get<Array<DnsRecordApi.DnsRecord>>(
    '/api/v1/dns/records',
  );
}

/**
 * 获取DNS记录
 */
async function getDnsRecordInfo(recordId: string) {
  return requestClient.get<Recordable<any>>(`/api/v1/dns/record/${recordId}`);
}

/**
 * 批量操作DNS记录
 * @param data 批量操作DNS记录数据
 */
async function batchDnsRecords(data: Recordable<any>) {
  return requestClient.post('/api/v1/dns/record/batch', data);
}

/**
 * 检查DNS记录
 */
async function checkDnsRecord(id: string) {
  return requestClient.get<Recordable<any>>(`/api/v1/dns/record/check/${id}`);
}

export {
  batchDnsRecords,
  checkDnsRecord,
  createDnsRecord,
  deleteDnsRecord,
  getDnsRecordInfo,
  getDnsRecordList,
  getDnsRecords,
  updateDnsRecord,
  updateDnsRecordStatus,
};
