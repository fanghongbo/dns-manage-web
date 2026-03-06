import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace DnsAnalysisApi {
  export interface DnsAnalysis {
    [key: string]: any;
    id: string;
    createTime: string;
  }

  /** 对比项，后端返回；tab 文案由前端拼接 sourceName + '-' + targetName */
  export interface CompareItem {
    sourceId: string;
    sourceName: string;
    targetId: string;
    targetName: string;
  }
}

/**
 * 获取DNS分析列表数据
 */
async function getDnsAnalysisList(params: Recordable<any>) {
  return requestClient.get<Array<DnsAnalysisApi.DnsAnalysis>>(
    '/api/v1/dns/analysis/list',
    {
      params,
    },
  );
}

/**
 * 执行DNS分析
 */
async function executeDnsAnalysis(data: Recordable<any>) {
  return requestClient.post('/api/v1/dns/analysis/execute', data);
}

/**
 * 获取分析对比选项（tabs），用于区分本地与云 DNS 记录差异
 * 返回 sourceId/sourceName/targetId/targetName，tab 文案前端拼接为 sourceName + '-' + targetName
 */
async function getDnsAnalysisCompareOptions(analysisId: string) {
  return requestClient.get<DnsAnalysisApi.CompareItem[]>(
    `/api/v1/dns/analysis/${analysisId}/compare-options`,
  );
}

export { executeDnsAnalysis, getDnsAnalysisCompareOptions, getDnsAnalysisList };
