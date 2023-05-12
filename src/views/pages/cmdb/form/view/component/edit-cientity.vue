<template>
  <TsDialog v-bind="setting" :isShow="true" @on-close="close">
    <div>
      <EditCiEntity
        ref="editContainer"
        :propCiId="ciId"
        :propRootCiId="rootCiId"
        :propCiEntityData="ciEntityData"
        saveMode="emit"
        mode="dialog"
        :isForm="isForm"
        :hideHeader="true"
        @save="saveCiEntity"
        @cancel="close"
      ></EditCiEntity>
    </div>
  </TsDialog>
</template>
<script>
import EditCiEntity from '@/views/pages/cmdb/cientity/cientity-edit.vue';
export default {
  name: '',
  components: {
    EditCiEntity
  },
  filters: {},
  props: {
    ciId: {
      type: Number
    },
    rootCiId: {
      type: Number
    },
    ciEntityData: {
      type: Object
    }
  },
  data() {
    return {
      isForm: true,
      setting: {
        title: '编辑配置项',
        maskClose: false,
        width: 'large',
        hasFooter: false
      }
    };
  },
  beforeCreate() {},
  created() {
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    close() {
      this.$emit('close');
    },
    saveCiEntity(ciEntityList) {
      if (ciEntityList && ciEntityList.length > 0) {
        this.$emit('save', ciEntityList);
      }
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped></style>
