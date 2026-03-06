import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace DnsLogApi {
  export interface DnsLog {
    [key: string]: any;
    id: string;
    createTime: string;
  }
}

/**
 * 获取DNS操作日志列表数据
 */
async function getDnsLogList(params: Recordable<any>) {
  return requestClient.get<Array<DnsLogApi.DnsLog>>('/api/v1/dns/log/list', {
    params,
  });
}

export { getDnsLogList };
