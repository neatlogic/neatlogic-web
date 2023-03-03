<template>
  <div>
    <TsDialog
      v-if="rel"
      v-bind="ciDialogConfig"
      :hasFooter="false"
      @on-close="close"
    >
      <template v-slot:header>
        <div>{{ rel.label }}</div>
      </template>
      <template v-slot>
        <CiEntityList
          :ciId="rel.ciId"
          :needCondition="false"
          :needAction="false"
          mode="dialog"
          :direction="rel.direction=='from'?'to':'from'"
          :relCiEntityId="rel.ciEntityId"
          :relId="rel.relId"
          :pageSize="10"
        ></CiEntityList>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import CiEntityList from './cientity-list.vue';

export default {
  name: '',
  components: {
    CiEntityList
  },
  props: {
    rel: {type: Object}
  },
  data() {
    return {
      ciDialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: '900px'
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
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
