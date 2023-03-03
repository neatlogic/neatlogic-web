<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        <div>执行确认</div>
      </template>
      <template v-slot>
        <div>
          <div class="padding">确认应用所有规则？</div>
          <div class="padding fz10 text-grey">
            <Checkbox v-model="isSync">删除不符合规则的配置项关联</Checkbox>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">取消</Button>
        <Button type="primary" @click="confirm()">确定</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {
    id: {type: Number}
  },
  data() {
    return { 
      isSync: false,
      dialogConfig: {
        type: 'modal',
        maskClose: true,
        isShow: true,
        width: 'mini'
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
    confirm() {
      this.$api.cmdb.group.execGroup(this.id, this.isSync ? 1 : 0).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success('执行成功');
          this.close(true);
        }
      });
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
