import { requestClient } from '#/api/request';

export namespace DnsStatApi {
  export interface DnsStatOverview {
    [key: string]: any;
    domainStat: {
      total: number;
      value: number;
    };
    domainRecordStat: {
      total: number;
      value: number;
    };
    taskStat: {
      total: number;
      value: number;
    };
    taskRate: {
      total: number;
      value: number;
    };
  }
}

/**
 * 获取dns统计信息
 */
async function getDnsStatOverview() {
  return requestClient.get<DnsStatApi.DnsStatOverview>(
    '/api/v1/dns/stat/overview',
  );
}
export { getDnsStatOverview };
