<template>
  <div>
    <TsForm ref="argumentSettingForm" :item-list.sync="argumentSettingFormConfig"></TsForm>
  </div>
</template>
<script>
import TsForm from '@/resources/plugins/TsForm/TsForm';

export default {
  components: {
    TsForm
  },
  props: { action: { type: Object } },
  data() {
    return {
      argumentSettingFormConfig: {
        toUsers: {
          type: 'select',
          label: '收件人：',
          dynamicUrl: '/module/codehub/api/rest/user/search',
          idListName: 'idList',
          rootName: 'list',
          value: '',
          validateList: ['required'],
          valueName: 'userId',
          textName: 'userName',
          search: true,
          hasReturn: true,
          multiple: true
        },
        subject: {
          label: '主题：',
          type: 'text',
          validateList: ['required'],
          value: ''
        },
        content: {
          label: '内容：',
          type: 'codemirror'
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
  methods: {},
  filter: {},
  computed: {
    returnJson: function() {
      let json = {};
      for (let key in this.argumentSettingFormConfig) {
        json[key] = this.argumentSettingFormConfig[key].value;
      }
      return json;
    }
  },
  watch: {
    action: {
      handler: function(val) {
        if (val.arguments) {
          let dataList = JSON.parse(val.arguments);
          for (let key in dataList) {
            this.argumentSettingFormConfig[key].value = dataList[key];
          }
        }
      },
      deep: true
      //immediate: true
    },
    returnJson: {
      handler: function(val) {
        this.$emit('setArguments', val);
      },
      deep: true
    }
  }
};
</script>
<style lang="less"></style>
