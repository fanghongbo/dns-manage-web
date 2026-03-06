<script lang="ts" setup>
import type { SystemRoleApi, SystemUserApi } from '#/api';
import type { SystemUserGroupApi } from '#/api/system/user_group';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { getRoles, getUsers } from '#/api';
import { createUserGroup, updateUserGroup } from '#/api/system/user_group';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemUserGroupApi.SystemUserGroup>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const roleOptions = ref<Array<{ label: string; value: string }>>([]);
const userOptions = ref<Array<{ label: string; value: string }>>([]);

const id = ref();
const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    (id.value ? updateUserGroup(id.value, values) : createUserGroup(values))
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
      const data = drawerApi.getData<SystemUserGroupApi.SystemUserGroup>();
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

      // 加载用户选项
      if (userOptions.value.length === 0) {
        await loadUsers();
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
    ? $t('common.edit', $t('system.userGroup.name'))
    : $t('common.create', $t('system.userGroup.name'));
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

async function loadUsers() {
  try {
    const users = await getUsers();
    userOptions.value = users.map((user: SystemUserApi.SystemUser) => ({
      label: user.nickname,
      value: user.id,
    }));
    // 更新表单 schema 中的用户选项
    formApi.updateSchema([
      {
        fieldName: 'users',
        componentProps: {
          allowClear: true,
          mode: 'multiple',
          options: userOptions.value,
          style: { width: '100%' },
        },
      },
    ]);
  } catch (error) {
    console.error('Failed to load users:', error);
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
