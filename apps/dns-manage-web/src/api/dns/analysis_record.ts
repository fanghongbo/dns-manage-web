import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace DnsAnalysisRecordApi {
  export interface DnsAnalysisRecord {
    [key: string]: any;
    id: string;
    createTime: string;
  }
}

/**
 * 获取DNS分析记录列表数据
 */
async function getDnsAnalysisRecordList(params: Recordable<any>) {
  return requestClient.get<Array<DnsAnalysisRecordApi.DnsAnalysisRecord>>(
    '/api/v1/dns/analysis/record/list',
    {
      params,
    },
  );
}

export { getDnsAnalysisRecordList };
