<template>
  <div>
    <TsDialog v-bind="setting" :isShow="true" @on-close="close">
      <div>
        <CiEntityView
          :propCiId="ciId"
          :propCiEntityId="ciEntityId"
          :hideHeader="true"
          :hideHistory="true"
          mode="dialog"
        ></CiEntityView>
      </div>
    </TsDialog>
  </div>
</template>
<script>
import CiEntityView from '@/views/pages/cmdb/cientity/cientity-view.vue';
export default {
  name: '',
  components: {
    CiEntityView
  },
  props: {
    ciId: {type: Number},
    ciEntityId: {type: Number}
  },
  data() {
    return {
      setting: {
        type: 'slider',
        title: '配置项详情',
        maskClose: true,
        width: 'large',
        hasFooter: false
      }
    };
  },
  beforeCreate() {},
  created() {},
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
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
