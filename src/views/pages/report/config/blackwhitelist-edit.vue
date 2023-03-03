<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        <div v-if="blackWhiteData.id">编辑可用对象</div>
        <div v-if="!blackWhiteData.id">添加可用对象</div>
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
export default {
  name: '',
  components: {
    TsForm: resolve =>
      require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    id: { type: Number }
  },
  data() {
    const _this = this;
    return { 
      dialogConfig: { 
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      },
      blackWhiteData: {},
      formConfig: [
        {
          type: 'text',
          name: 'id',
          isHidden: true
        },
        {
          type: 'text',
          name: 'itemName',
          label: '对象名称',
          maxlength: 50,
          desc: '支持itemName*或*itemName两种匹配方式，如果输入*，代表匹配所有对象。',
          validateList: [{name: 'required', message: '请输入类型名称'}],
          onChange: (name) => {
            this.blackWhiteData.itemName = name;
          }
        },
        {
          type: 'radio',
          name: 'itemType',
          label: '对象类型',
          dataList: [{value: 'table', text: '表格'}, {value: 'column', text: '字段'}],
          validateList: [{name: 'required'}],
          onChange: (val) => {
            this.blackWhiteData.itemType = val;
          }
        },
        {
          type: 'radio',
          name: 'type',
          label: '类型',
          dataList: [{value: 'whitelist', text: '白名单'}, {value: 'blacklist', text: '黑名单'}],
          desc: '在白名单匹配范围内的对象才能被访问，黑名单用于屏蔽白名单中的对象。',
          validateList: [{name: 'required'}],
          onChange: (val) => {
            this.blackWhiteData.type = val;
          }
        },
        {
          type: 'textarea',
          name: 'description',
          label: '备注',
          maxlength: 500,
          onChange: (name) => {
            this.blackWhiteData.description = name;
          }
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() { this.getBlackWhite(); },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getBlackWhite() {
      if (this.id) {
        this.$api.report.report.getBlackWhiteById(this.id).then(res => {
          this.blackWhiteData = res.Return;
          this.formConfig.forEach(element => {
            this.$set(element, 'value', this.blackWhiteData[element.name]);
          });
        });
      } else {
        this.blackWhiteData = {};
        this.formConfig.forEach(element => {
          this.$set(element, 'value', this.blackWhiteData[element.name]);
        });
      }
    },
    save() {
      const form = this.$refs['form'];
      if (form.valid()) {
        this.$api.report.report.saveBlackWhite(this.blackWhiteData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.content.savesuccess'));
            this.close(true);
          }
        });
      }
    },
    close: function(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {},
  watch: {
  }
};
</script>
<style lang="less">
</style>
