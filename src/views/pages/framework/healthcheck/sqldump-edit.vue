<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <TsForm ref="form" :item-list="formConfig"></TsForm>
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
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {},
  data() {
    return {
      dialogConfig: {
        title: '设置SQL',
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      },
      formConfig: [
        {
          type: 'radio',
          name: 'action',
          label: '操作',
          validateList: [{name: 'required', message: '请选择操作'}],
          dataList: [
            { value: 'insert', text: '增加监控' },
            { value: 'remove', text: '删除监控' },
            { value: 'clear', text: '清空所有' }
          ],
          desc: '增加监控：开始监控指定sql，删除监控：解除解控指定sql，清空所有：清空所有sql监控'
        },
        {
          type: 'text',
          name: 'id',
          label: 'sql id',
          validateList: ['required'],
          desc: 'sql id是mybatis sql语句mapper文件中的语句id，请联系研发获取，如果添加*，代表监控所有SQL语句，系统最多只会保存最新的1000条审计记录。'
        }
      ]
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
    save() {
      const form = this.$refs['form'];
      if (form.valid()) {
        this.$api.framework.healthcheck.toggleSqlInterceptor(form.getFormValue()).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.content.savesuccess'));
            this.close();
          }
        });
      }
    },
    close() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
