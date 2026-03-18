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
  export interface DnsChangeTrend {
    [key: string]: any;
  }
  export interface DnsStatTrend {
    [key: string]: any;
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

/**
 * 获取dns变更趋势
 */
async function getDnsChangeTrend() {
  return requestClient.get<DnsStatApi.DnsChangeTrend>(
    '/api/v1/dns/change/trend',
  );
}

/**
 * 获取dns记录趋势
 */
async function getDnsStatTrend() {
  return requestClient.get<DnsStatApi.DnsStatTrend>('/api/v1/dns/stat/trend');
}

export { getDnsChangeTrend, getDnsStatOverview, getDnsStatTrend };
