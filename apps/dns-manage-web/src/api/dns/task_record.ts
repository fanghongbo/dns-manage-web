import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace DnsTaskRecordApi {
  export interface DnsTaskRecord {
    [key: string]: any;
    id: string;
    name: string;
    remark?: string;
    status: 0 | 1;
  }
}

/**
 * 获取DNS任务记录列表数据
 */
async function getDnsTaskRecordList(params: Recordable<any>) {
  return requestClient.get<Array<DnsTaskRecordApi.DnsTaskRecord>>(
    '/api/v1/dns/task/record/list',
    {
      params,
    },
  );
}

export { getDnsTaskRecordList };
