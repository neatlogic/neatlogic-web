<template>
  <div>
    <TsDialog
      :title="$t('page.validate')"
      type="modal"
      :isShow="true"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <Alert type="error">服务依赖关系成环：{{ validData.path }}，请选择选择删除下面一个服务依赖关系</Alert>
          
          <div v-for="(item,index) in tbodyList" :key="index" class="from-name overflow">
            <Checkbox v-model="item.isSelect" @on-change="(val)=>{changeSelect(val,item)}"></Checkbox>
            <span class="pr-sm">{{ item.serviceName }}</span>
            <span class="text-tip pl-sm pr-sm from-icon border-dashed"></span>
            <span class="text-tip tsfont-right text-dividing"></span>
            <span>{{ item.dependencyServiceName }}</span>
          </div>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    validData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      selectItem: null,
      validateList: ['required'],
      tbodyList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init(); 
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      if (!this.$utils.isEmpty(this.validData)) {
        this.tbodyList = this.validData.tbodyList;
      }
    },
    okDialog() {
      if (!this.selectItem) {
        return;
      }
      this.$emit('delete', this.selectItem);
    },
    closeDialog() {
      this.$emit('close');
    },
    changeSelect(val, item) {
      if (val) {
        this.tbodyList.forEach(d => {
          if (d.serviceId === item.serviceId) {
            this.selectItem = item;
            this.$set(item, 'isSelect', true);
          } else {
            this.$set(item, 'isSelect', false);
          }
        });
      } else {
        this.selectItem = null;
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.from-name {
  display: flex;
  align-items: center;
  &:not(:last-child){
    padding-bottom: 10px;
  }
}
</style>
