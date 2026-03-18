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
  export interface DnsTypeTrend {
    [key: string]: any;
  }
  export interface DnsStatRank {
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

/**
 * 获取dns类型趋势
 */
async function getDnsTypeTrend() {
  return requestClient.get<DnsStatApi.DnsTypeTrend>('/api/v1/dns/type/trend');
}

/**
 * 获取dns域名排行
 */
async function getDnsStatRank() {
  return requestClient.get<DnsStatApi.DnsStatRank>('/api/v1/dns/stat/rank');
}

export {
  getDnsChangeTrend,
  getDnsStatOverview,
  getDnsStatRank,
  getDnsStatTrend,
  getDnsTypeTrend,
};
