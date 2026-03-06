import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace DnsDomainApi {
  export interface DnsDomain {
    [key: string]: any;
    id: string;
    name: string;
    remark?: string;
    status: 0 | 1;
  }
}

/**
 * 获取域名列表数据
 */
async function getDnsDomainList(params: Recordable<any>) {
  return requestClient.get<Array<DnsDomainApi.DnsDomain>>(
    '/api/v1/dns/domain/list',
    { params },
  );
}

/**
 * 创建域名
 * @param data 域名数据
 */
async function createDnsDomain(data: Omit<DnsDomainApi.DnsDomain, 'id'>) {
  return requestClient.post('/api/v1/dns/domain', data);
}

/**
 * 更新域名
 *
 * @param id 域名 ID
 * @param data 域名数据
 */
async function updateDnsDomain(
  id: string,
  data: Omit<DnsDomainApi.DnsDomain, 'id'>,
) {
  return requestClient.put(`/api/v1/dns/domain/${id}`, data);
}

/**
 * 更新域名状态
 * @param id 域名 ID
 * @param status 域名状态
 */
async function updateDnsDomainStatus(
  id: string,
  data: Omit<DnsDomainApi.DnsDomain, 'id'>,
) {
  return requestClient.put(`/api/v1/dns/domain/status/${id}`, data);
}

/**
 * 删除域名组
 * @param id 域名组 ID
 */
async function deleteDnsDomain(id: string) {
  return requestClient.delete(`/api/v1/dns/domain/${id}`);
}

/**
 * 获取域名信息
 */
async function getDnsDomainInfo(domainId: string) {
  return requestClient.get<Recordable<any>>(`/api/v1/dns/domain/${domainId}`);
}

export {
  createDnsDomain,
  deleteDnsDomain,
  getDnsDomainInfo,
  getDnsDomainList,
  updateDnsDomain,
  updateDnsDomainStatus,
};
