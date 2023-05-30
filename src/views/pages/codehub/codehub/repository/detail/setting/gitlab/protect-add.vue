<template>
  <TsDialog
    v-if="isShow"
    v-bind="setting"
    :isShow="isShow"
    @on-close="close"
  >
    <div>
      <TsForm ref="editform" :itemList="formConfig" :labelWidth="180">
      </TsForm>
    </div>
    <template v-slot:footer>
      <div class="footer-btn-contain">
        <Button type="text" @click="close">取消</Button>
        <Button type="primary" :disabled="isSubmit" @click="saveEdit">确定</Button>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve)
  },
  filters: {},
  props: {
    isShow: Boolean,
    uuid: String
  },
  data() {
    let _this = this;
    return {
      split: 0.3,
      setting: {
        title: '添加分支保护',
        maskClose: false,
        width: 'small'
      },
      isSubmit: false, //是否提交中，需要禁用调提交按钮
      formConfig: [
        {
          type: 'select',
          label: '分支名称',
          name: 'name',
          validateList: ['required'],
          dynamicUrl: '/module/codehub/api/rest/repository/gitlab/searchBranches',
          params: {
            repositoryUuid: _this.uuid
          },
          rootName: 'list',
          textName: 'name',
          valueName: 'name',
          allowCreate: true,
          transfer: true
        }, {
          type: 'select',
          label: 'developers_can_merge',
          name: 'developers_can_merge',
          validateList: ['required'],
          dataList: [{
            value: true,
            text: '是'
          }, {
            value: false,
            text: '否'           
          }],
          transfer: true       
        }, {
          type: 'select',
          label: 'developers_can_push',
          name: 'developers_can_push',
          validateList: ['required'],
          dataList: [{
            value: true,
            text: '是'
          }, {
            value: false,
            text: '否'           
          }],
          transfer: true               
        }
      ]
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
    saveEdit() {
      if (this.$refs.editform.valid()) { 
        let param = this.$refs.editform.getFormValue(); 
        Object.assign(param, {
          repositoryUuid: this.uuid,
          method: 'protectBranch'
        });   
        this.isSubmit = true;
        this.$api.codehub.repositorydetail.saveGitProtect(param).then(res => {
          if (res && res.Status == 'OK') {
            this.$emit('close', true);
          }
        }).finally(res => {
          this.isSubmit = false;
        });
      }
    },
    close() {
      this.$emit('close');
    },
    setFormVal(key, val) {
      this.formConfig.forEach(f => {
        if (f.name == key) {
          Object.assign(f, {
            value: val
          });
        }
      });
    }
  },
  computed: {
  },
  watch: {}

};

</script>
<style lang='less'>

</style>
