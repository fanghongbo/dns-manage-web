<script lang="ts" setup>
import type { SystemUserGroupApi } from '#/api';
import type { SystemRoleApi } from '#/api/system/role';
import type { SystemUserApi } from '#/api/system/user';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { getUserGroups } from '#/api';
import { getRoles } from '#/api/system/role';
import { createUser, updateUser } from '#/api/system/user';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemUserApi.SystemUser>();
const roleOptions = ref<Array<{ label: string; value: string }>>([]);
const userGroupOptions = ref<Array<{ label: string; value: string }>>([]);

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const id = ref();
const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    (id.value ? updateUser(id.value, values) : createUser(values))
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
      const data = drawerApi.getData<SystemUserApi.SystemUser>();
      formApi.resetForm();

      if (data) {
        formData.value = data;
        id.value = data.id;
      } else {
        id.value = undefined;
      }

      // 加载角色选项
      if (roleOptions.value.length === 0) {
        await loadRoles();
      }

      // 加载用户组选项
      if (userGroupOptions.value.length === 0) {
        await loadUserGroups();
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
    ? $t('common.edit', $t('system.user.name'))
    : $t('common.create', $t('system.user.name'));
});

async function loadRoles() {
  try {
    const roles = await getRoles();
    roleOptions.value = roles.map((role: SystemRoleApi.SystemRole) => ({
      label: role.name,
      value: role.id,
    }));
    // 更新表单 schema 中的角色选项
    formApi.updateSchema([
      {
        fieldName: 'roles',
        componentProps: {
          allowClear: true,
          mode: 'multiple',
          options: roleOptions.value,
          style: { width: '100%' },
        },
      },
    ]);
  } catch (error) {
    console.error('Failed to load roles:', error);
  }
}

async function loadUserGroups() {
  try {
    const userGroups = await getUserGroups();
    userGroupOptions.value = userGroups.map(
      (userGroup: SystemUserGroupApi.SystemUserGroup) => ({
        label: userGroup.name,
        value: userGroup.id,
      }),
    );
    // 更新表单 schema 中的用户组选项
    formApi.updateSchema([
      {
        fieldName: 'groups',
        componentProps: {
          allowClear: true,
          mode: 'multiple',
          options: userGroupOptions.value,
          style: { width: '100%' },
        },
      },
    ]);
  } catch (error) {
    console.error('Failed to load user groups:', error);
  }
}
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form />
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
