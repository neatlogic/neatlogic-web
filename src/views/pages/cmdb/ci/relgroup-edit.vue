<template>
  <div>
    <TsDialog
      v-if="relGroupData"
      :is-show="isShow"
      v-bind="dialogConfig"
      @on-close="close"
    >
      <template v-slot>
        <TsForm ref="form" :item-list="formConfig">
        </TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import TsForm from '@/resources/plugins/TsForm/TsForm';
export default {
  name: '',
  components: {
    TsForm
  },
  props: {
    id: {type: Number},
    ciId: {type: Number},
    isShow: {typ: Boolean}
  },
  data() {
    const _this = this;
    return {
      relGroupData: {},
      dialogConfig: {
        title: this.id ? this.$t('dialog.title.edittarget', {target: this.$t('term.cmdb.relationgroup')}) : this.$t('dialog.title.addtarget', {target: this.$t('term.cmdb.relationgroup')}),
        type: 'modal',
        maskClose: false,
        isShow: false,
        width: 'small'
      },
      formConfig: {
        id: {
          type: 'text',
          isHidden: true
        },
        name: {
          type: 'text',
          label: this.$t('page.name'),
          validateList: ['required'],
          onChange: function(value) {
            _this.$set(_this.relGroupData, 'name', value);
          }
        }
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
    save: function() {
      const form = this.$refs['form'];
      if (form.valid()) {
        this.relGroupData.ciId = this.ciId;
        this.$api.cmdb.ci.saveRelGroup(this.relGroupData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        });
      }
    },
    getDataById: function() {
      if (this.id) {
        this.$api.cmdb.ci.getRelGroupById(this.id).then(res => {
          if (res.Status == 'OK') {
            this.relGroupData = res.Return;
            for (let key in this.formConfig) {
              const element = this.formConfig[key];
              element.value = this.relGroupData[key];
            }
          }
        });
      } else {
        this.relGroupData = {};
        for (let key in this.formConfig) {
          const element = this.formConfig[key];
          element.value = this.relGroupData[key];
        }
      }
    },
    close: function(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {},
  watch: { 
    isShow: {
      handler: function(val) {
        if (val) {
          this.getDataById();
        }
      }
    }
  }
};
</script>
<style lang="less">
</style>
