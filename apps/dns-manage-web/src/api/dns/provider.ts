import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace DnsProviderApi {
  export interface DnsProvider {
    [key: string]: any;
    id: string;
    name: string;
    remark?: string;
    status: 0 | 1;
  }
}

/**
 * 获取DNS服务商列表数据
 */
async function getDnsProviderList(params: Recordable<any>) {
  return requestClient.get<Array<DnsProviderApi.DnsProvider>>(
    '/api/v1/dns/provider/list',
    { params },
  );
}

/**
 * 创建DNS服务商
 * @param data DNS服务商数据
 */
async function createDnsProvider(data: Omit<DnsProviderApi.DnsProvider, 'id'>) {
  return requestClient.post('/api/v1/dns/provider', data);
}

/**
 * 更新DNS服务商
 *
 * @param id DNS服务商 ID
 * @param data DNS服务商数据
 */
async function updateDnsProvider(
  id: string,
  data: Omit<DnsProviderApi.DnsProvider, 'id'>,
) {
  return requestClient.put(`/api/v1/dns/provider/${id}`, data);
}

/**
 * 更新DNS服务商状态
 * @param id DNS服务商 ID
 * @param status DNS服务商状态
 */
async function updateDnsProviderStatus(
  id: string,
  data: Omit<DnsProviderApi.DnsProvider, 'id'>,
) {
  return requestClient.put(`/api/v1/dns/provider/status/${id}`, data);
}

/**
 * 删除DNS服务商组
 * @param id DNS服务商组 ID
 */
async function deleteDnsProvider(id: string) {
  return requestClient.delete(`/api/v1/dns/provider/${id}`);
}

/**
 * 获取DNS服务商数据
 */
async function getDnsProviders() {
  return requestClient.get<Array<DnsProviderApi.DnsProvider>>(
    '/api/v1/dns/providers',
  );
}

export {
  createDnsProvider,
  deleteDnsProvider,
  getDnsProviderList,
  getDnsProviders,
  updateDnsProvider,
  updateDnsProviderStatus,
};
