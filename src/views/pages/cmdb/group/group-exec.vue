<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        <div>{{ $t('term.cmdb.executeconfirm') }}</div>
      </template>
      <template v-slot>
        <div>
          <div class="padding">{{ $t('term.cmdb.applyallrulesconfirm') }}</div>
          <div class="padding fz10 text-grey">
            <Checkbox v-model="isSync">{{ $t('term.cmdb.deletemismatchedcientityrel') }}</Checkbox>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="confirm()">{{ $t('page.confirm') }}</Button>
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
          this.$Message.success(this.$t('message.executesuccess'));
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
