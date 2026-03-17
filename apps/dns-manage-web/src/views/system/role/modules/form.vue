<script lang="ts" setup>
import type { DataNode } from 'ant-design-vue/es/tree';

import type { Recordable } from '@vben/types';

import type { SystemRoleApi } from '#/api/system/role';

import { computed, nextTick, ref } from 'vue';

import { Tree, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Spin } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createRole, updateRole } from '#/api/system/role';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemRoleApi.SystemRole>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const permissions = ref<DataNode[]>([
  {
    key: 'dashboard',
    meta: {
      icon: 'lucide:layout-dashboard',
      title: 'page.dashboard.title',
    },
    type: 'catalog',
    children: [
      {
        key: 'dashboard.analytics',
        type: 'menu',
        meta: {
          icon: 'lucide:area-chart',
          title: 'page.dashboard.analytics',
        },
      },
    ],
  },
  {
    key: 'dns',
    meta: {
      icon: 'lucide:globe',
      title: 'dns.title',
    },
    type: 'catalog',
    children: [
      {
        key: 'dns.domain',
        type: 'menu',
        meta: {
          icon: 'mdi:domain',
          title: 'dns.domain.title',
        },
        children: [
          {
            key: 'dns.domain.list',
            type: 'button',
            meta: {
              title: 'common.list',
            },
          },
          {
            key: 'dns.domain.get',
            type: 'button',
            meta: {
              title: 'common.get',
            },
          },
          {
            key: 'dns.domain.create',
            type: 'button',
            meta: {
              title: 'common.create',
            },
          },
          {
            key: 'dns.domain.update',
            type: 'button',
            meta: {
              title: 'common.update',
            },
          },
          {
            key: 'dns.domain.delete',
            type: 'button',
            meta: {
              title: 'common.delete',
            },
          },
          {
            key: 'dns.domain.record',
            type: 'button',
            meta: {
              title: 'dns.domain.record',
            },
          },
          {
            key: 'dns.domain.analysis',
            type: 'button',
            meta: {
              title: 'dns.domain.analysis',
            },
          },
        ],
      },
      {
        key: 'dns.record',
        type: 'menu',
        meta: {
          icon: 'mdi:record',
          title: 'dns.record.title',
        },
        children: [
          {
            key: 'dns.record.list',
            type: 'button',
            meta: {
              title: 'common.list',
            },
          },
          {
            key: 'dns.record.get',
            type: 'button',
            meta: {
              title: 'common.get',
            },
          },
          {
            key: 'dns.record.create',
            type: 'button',
            meta: {
              title: 'common.create',
            },
          },
          {
            key: 'dns.record.update',
            type: 'button',
            meta: {
              title: 'common.update',
            },
          },
          {
            key: 'dns.record.delete',
            type: 'button',
            meta: {
              title: 'common.delete',
            },
          },
          {
            key: 'dns.record.check',
            type: 'button',
            meta: {
              title: 'dns.record.check',
            },
          },
          {
            key: 'dns.record.push',
            type: 'button',
            meta: {
              title: 'dns.record.push',
            },
          },
          {
            key: 'dns.record.pull',
            type: 'button',
            meta: {
              title: 'dns.record.pull',
            },
          },
        ],
      },
      {
        key: 'dns.provider',
        type: 'menu',
        meta: {
          icon: 'mdi:factory',
          title: 'dns.provider.title',
        },
        children: [
          {
            key: 'dns.provider.list',
            type: 'button',
            meta: {
              title: 'common.list',
            },
          },
          {
            key: 'dns.provider.get',
            type: 'button',
            meta: {
              title: 'common.get',
            },
          },
          {
            key: 'dns.provider.create',
            type: 'button',
            meta: {
              title: 'common.create',
            },
          },
          {
            key: 'dns.provider.update',
            type: 'button',
            meta: {
              title: 'common.update',
            },
          },
          {
            key: 'dns.provider.delete',
            type: 'button',
            meta: {
              title: 'common.delete',
            },
          },
        ],
      },
      {
        key: 'dns.task',
        type: 'menu',
        meta: {
          icon: 'mdi:list-todo',
          title: 'dns.task.title',
        },
        children: [
          {
            key: 'dns.task.list',
            type: 'button',
            meta: {
              title: 'common.list',
            },
          },
          {
            key: 'dns.task.get',
            type: 'button',
            meta: {
              title: 'dns.task.detail',
            },
          },
        ],
      },
      {
        key: 'dns.log',
        type: 'menu',
        meta: {
          icon: 'mdi:history',
          title: 'dns.log.title',
        },
        children: [
          {
            key: 'dns.log.list',
            type: 'button',
            meta: {
              title: 'common.list',
            },
          },
        ],
      },
      {
        key: 'dns.analysis',
        type: 'menu',
        meta: {
          icon: 'mdi:chart-box',
          title: 'dns.analysis.title',
        },
        children: [
          {
            key: 'dns.analysis.list',
            type: 'button',
            meta: {
              title: 'common.list',
            },
          },
          {
            key: 'dns.analysis.detail',
            type: 'button',
            meta: {
              title: 'common.get',
            },
          },
        ],
      },
    ],
  },
  {
    key: 'system',
    meta: {
      icon: 'carbon:settings',
      title: 'system.title',
    },
    type: 'catalog',
    children: [
      {
        key: 'system.role',
        type: 'menu',
        meta: {
          icon: 'mdi:account-group',
          title: 'system.role.title',
        },
        children: [
          {
            key: 'system.role.list',
            type: 'button',
            meta: {
              title: 'common.list',
            },
          },
          {
            key: 'system.role.get',
            type: 'button',
            meta: {
              title: 'common.get',
            },
          },
          {
            key: 'system.role.create',
            type: 'button',
            meta: {
              title: 'common.create',
            },
          },
          {
            key: 'system.role.update',
            type: 'button',
            meta: {
              title: 'common.update',
            },
          },
          {
            key: 'system.role.delete',
            type: 'button',
            meta: {
              title: 'common.delete',
            },
          },
        ],
      },
      {
        key: 'system.user',
        type: 'menu',
        meta: {
          icon: 'mdi:account',
          title: 'system.user.title',
        },
        children: [
          {
            key: 'system.user.list',
            type: 'button',
            meta: {
              title: 'common.list',
            },
          },
          {
            key: 'system.user.get',
            type: 'button',
            meta: {
              title: 'common.get',
            },
          },
          {
            key: 'system.user.create',
            type: 'button',
            meta: {
              title: 'common.create',
            },
          },
          {
            key: 'system.user.update',
            type: 'button',
            meta: {
              title: 'common.update',
            },
          },
          {
            key: 'system.user.delete',
            type: 'button',
            meta: {
              title: 'common.delete',
            },
          },
        ],
      },
      {
        key: 'system.userGroup',
        type: 'menu',
        meta: {
          icon: 'charm:organisation',
          title: 'system.userGroup.title',
        },
        children: [
          {
            key: 'system.user.group.list',
            type: 'button',
            meta: {
              title: 'common.list',
            },
          },
          {
            key: 'system.user.group.get',
            type: 'button',
            meta: {
              title: 'common.get',
            },
          },
          {
            key: 'system.user.group.create',
            type: 'button',
            meta: {
              title: 'common.create',
            },
          },
          {
            key: 'system.user.group.update',
            type: 'button',
            meta: {
              title: 'common.update',
            },
          },
          {
            key: 'system.user.group.delete',
            type: 'button',
            meta: {
              title: 'common.delete',
            },
          },
        ],
      },
      // {
      //   key: 'system.audit',
      //   type: 'menu',
      //   meta: {
      //     icon: 'mdi:history',
      //     title: 'system.audit.title',
      //   },
      //   children: [
      //     {
      //       key: 'system.audit.list',
      //       type: 'button',
      //       meta: {
      //         title: 'common.list',
      //       },
      //     },
      //   ],
      // },
    ],
  },
]);

const loadingPermissions = ref(false);

const id = ref();
const [Drawer, drawerApi] = useVbenDrawer({
  class: '!w-[40vw] max-w-none',
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    (id.value ? updateRole(id.value, values) : createRole(values))
      .then(() => {
        emits('success');
        drawerApi.close();
      })
      .catch(() => {
        drawerApi.unlock();
      });
  },

  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemRoleApi.SystemRole>();
      formApi.resetForm();

      if (data) {
        formData.value = data;
        id.value = data.id;
      } else {
        id.value = undefined;
      }

      // Wait for Vue to flush DOM updates (form fields mounted)
      await nextTick();
      if (data) {
        formApi.setValues(data);
      }
    }
  },
});

const getDrawerTitle = computed(() => {
  return formData.value?.id
    ? $t('common.update', $t('system.role.roleName'))
    : $t('common.create', $t('system.role.roleName'));
});

function getNodeClass(node: Recordable<any>) {
  const classes: string[] = [];
  if (node.value?.type === 'button') {
    classes.push('inline-flex');
  }

  return classes.join(' ');
}
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form>
      <template #permissions="slotProps">
        <Spin :spinning="loadingPermissions" wrapper-class-name="w-full">
          <Tree
            :tree-data="permissions"
            multiple
            bordered
            :default-expanded-level="2"
            :get-node-class="getNodeClass"
            v-bind="slotProps"
            value-field="key"
            label-field="meta.title"
            icon-field="meta.icon"
          >
            <template #node="{ value }">
              <IconifyIcon v-if="value.meta.icon" :icon="value.meta.icon" />
              {{ $t(value.meta.title) }}
            </template>
          </Tree>
        </Spin>
      </template>
    </Form>
  </Drawer>
</template>
<style lang="css" scoped>
:deep(.ant-tree-title) {
  .tree-actions {
    display: none;
    margin-left: 20px;
  }
}

:deep(.ant-tree-title:hover) {
  .tree-actions {
    display: flex;
    flex: auto;
    justify-content: flex-end;
    margin-left: 20px;
  }
}
</style>
