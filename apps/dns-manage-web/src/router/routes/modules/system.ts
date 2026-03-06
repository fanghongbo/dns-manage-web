import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ion:settings-outline',
      order: 9997,
      title: $t('system.title'),
    },
    name: 'System',
    path: '/system',
    children: [
      {
        path: '/system/role/list',
        name: 'SystemRole',
        meta: {
          icon: 'mdi:account-group',
          title: $t('system.role.title'),
        },
        component: () => import('#/views/system/role/list.vue'),
      },
      {
        path: '/system/user/list',
        name: 'SystemUser',
        meta: {
          icon: 'mdi:account',
          title: $t('system.user.title'),
        },
        component: () => import('#/views/system/user/list.vue'),
      },
      {
        path: '/system/user/group/list',
        name: 'SystemUserGroup',
        meta: {
          icon: 'charm:organisation',
          title: $t('system.userGroup.title'),
        },
        component: () => import('#/views/system/user_group/list.vue'),
      },
      {
        path: '/system/user/notification/list',
        name: 'SystemUserNotification',
        meta: {
          icon: 'mdi:bell',
          title: $t('system.userNotification.title'),
        },
        component: () => import('#/views/system/user_notification/list.vue'),
      },
      // {
      //   path: '/system/audit/list',
      //   name: 'SystemAudit',
      //   meta: {
      //     icon: 'mdi:history',
      //     title: $t('system.audit.title'),
      //   },
      //   component: () => import('#/views/system/audit/list.vue'),
      // },
    ],
  },
];

export default routes;
