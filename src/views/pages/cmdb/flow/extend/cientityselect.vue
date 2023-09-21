<template>
  <div class="control-box">
    <div class="control-setting">
      <span class="label">
        <span>{{ $t('term.cmdb.cientityattribute') }}</span>
      </span>
      <span class="control-btn tsfont-setting text-href" @click="editExtend()"></span>
    </div>
    <EditExtend
      v-if="isEdit"
      :isShow="isEdit"
      :config="config?config.entityFilter:{}"
      :handlerList="getCihandler(formConfig)"
      @close="close"
      @updateConfig="updateConfig"
    ></EditExtend>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    EditExtend: resolve => require(['./edit/cientityselect.vue'], resolve)
  },
  filters: {},
  mixins: [],
  props: {
    config: Object,
    formConfig: Object
  },
  data() {
    return {
      isEdit: false
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
    editExtend() {
      this.isEdit = true;
    },
    close() {
      this.isEdit = false;
    },
    updateConfig(config) {
      this.$emit('updateConfig', config);
    }
  },
  computed: {
    getCihandler() {
      return function(config) {
        let list = [];
        if (config && config.controllerList && config.controllerList.length > 0) {
          list = config.controllerList.filter((con) => {
            return con.handler == 'cientityselect';
          });
        }
        return list;
      };
    }
  },
  watch: {}

};

</script>
<style lang='less'>

</style>
