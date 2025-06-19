<template>
  <Tooltip
    placement="bottom"
    max-width="500px"
    theme="light"
    transfer
  >
    <span class="stepName name" :class="{ 'text-primary': operation.status == 'running' }">{{ getOperationName(operation) }}</span>
    <div slot="content" style="width:500px">
      <TsRow :gutter="8">
        <Col span="4" class="text-right">{{ $t('page.name') }}:</Col>
        <Col span="20" class="text-left">{{ getOperationName(operation) }}</Col>
      </TsRow>
      <TsRow v-if="operation.version" :gutter="8">
        <Col span="4" class="text-right">{{ $t('page.versions') }}:</Col>
        <Col span="20" class="text-left">{{ operation.version }}</Col>
      </TsRow>
      <TsRow v-if="operation.title" :gutter="8">
        <Col span="4" class="text-right">{{ $t('term.framework.versionremarks') }}:</Col>
        <Col span="20" class="text-left">{{ operation.title }}</Col>
      </TsRow>
    </div>
  </Tooltip>
</template>

<script>
export default {
  props: {
    operation: { type: Object }
  },
  methods: {
    getOperationName(step) {
      if (step.name) {
        return step.name;
      } else {
        return '-';
      }
    }
  }
};
</script>

<style>

</style>
