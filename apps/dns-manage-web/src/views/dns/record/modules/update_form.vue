<script lang="ts" setup>
import type { DnsRecordApi } from '#/api/dns/record';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { updateDnsRecord } from '#/api/dns/record';
import { $t } from '#/locales';

import { useUpdateFormSchema } from '../data';

const emits = defineEmits<{
  success: [];
  taskCreated: [taskId: number | string];
}>();

const formData = ref<DnsRecordApi.DnsRecord>();

const [Form, formApi] = useVbenForm({
  schema: useUpdateFormSchema(),
  showDefaultActions: false,
});

const id = ref();
const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    updateDnsRecord(id.value, values)
      .then((res: any) => {
        emits('success');
        if (res?.taskId) {
          emits('taskCreated', res.taskId);
        }
        drawerApi.close();
      })
      .catch(() => {
        drawerApi.unlock();
      });
  },

  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<DnsRecordApi.DnsRecord>();
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
        // 转换后端返回的字符串类型字段为数字类型
        const formData = {
          ...data,
          ttl: typeof data.ttl === 'string' ? Number(data.ttl) : data.ttl,
          weight:
            data.weight !== undefined &&
            data.weight !== null &&
            typeof data.weight === 'string'
              ? Number(data.weight)
              : data.weight,
        };
        formApi.setValues(formData);
      }
    }
  },
});

const getDrawerTitle = computed(() => {
  return formData.value?.id
    ? $t('common.edit', $t('dns.record.host'))
    : $t('common.create', $t('dns.record.host'));
});
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
