<template>
  <div>
    <TsDialog
      v-if="relGroupData"
      :is-show="isShow"
      v-bind="dialogConfig"
      @on-close="close"
    >
      <template v-slot:header>
        <div v-if="relGroupData.id">编辑关系分组</div>
        <div v-if="!relGroupData.id">添加关系分组</div>
      </template>
      <template v-slot>
        <TsForm ref="form" :item-list="formConfig">
        </TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="close()">取消</Button>
        <Button type="primary" @click="save()">确定</Button>
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
        type: 'modal',
        maskClose: false,
        isShow: false,
        width: '500px'
      },
      formConfig: {
        id: {
          type: 'text',
          isHidden: true
        },
        name: {
          type: 'text',
          label: '名称',
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
            this.$Message.success(this.$t('message.content.savesuccess'));
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
