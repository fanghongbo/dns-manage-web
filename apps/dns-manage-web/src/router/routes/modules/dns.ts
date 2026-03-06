import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:globe',
      title: $t('dns.title'),
      order: 7777,
    },
    name: 'Dns',
    path: '/dns',
    redirect: '/dns/domain/list',
    children: [
      {
        name: 'DnsDomainList',
        path: '/dns/domain/list',
        component: () => import('#/views/dns/domain/list.vue'),
        meta: {
          icon: 'mdi:domain',
          title: $t('dns.domain.title'),
        },
      },
      {
        path: '/dns/domain/:domainId/record/list',
        name: 'DnsRecordList',
        meta: {
          hideInMenu: true,
          icon: 'mdi:record',
          title: $t('dns.record.title'),
          activePath: '/dns/domain/list',
        },
        component: () => import('#/views/dns/record/list.vue'),
      },
      {
        path: '/dns/provider/list',
        name: 'DnsProviderList',
        meta: {
          icon: 'mdi:factory',
          title: $t('dns.provider.title'),
        },
        component: () => import('#/views/dns/provider/list.vue'),
      },
      {
        path: '/dns/task/list',
        name: 'DnsTaskList',
        meta: {
          icon: 'lucide:list-todo',
          title: $t('dns.task.title'),
        },
        component: () => import('#/views/dns/task/list.vue'),
      },
      {
        path: '/dns/task/:taskId/record/list',
        name: 'DnsTaskRecordList',
        meta: {
          icon: 'lucide:list-todo',
          title: $t('dns.task.record.title'),
          activePath: '/dns/task/list',
          hideInMenu: true,
        },
        component: () => import('#/views/dns/task/record/list.vue'),
      },
      {
        path: '/dns/log/list',
        name: 'DnsLogList',
        meta: {
          icon: 'lucide:history',
          title: $t('dns.log.title'),
        },
        component: () => import('#/views/dns/log/list.vue'),
      },
      {
        path: '/dns/analysis/list',
        name: 'DnsAnalysisList',
        meta: {
          icon: 'lucide:bar-chart',
          title: $t('dns.analysis.title'),
        },
        component: () => import('#/views/dns/analysis/list.vue'),
      },
      {
        path: '/dns/analysis/:analysisId/record/list',
        name: 'DnsAnalysisRecordList',
        meta: {
          icon: 'lucide:bar-chart',
          title: $t('dns.analysis.record.title'),
          activePath: '/dns/analysis/list',
          hideInMenu: true,
        },
        component: () => import('#/views/dns/analysis/record/list.vue'),
      },
    ],
  },
];

export default routes;
