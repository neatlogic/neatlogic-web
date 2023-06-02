<template>
  <div>
    <TsForm ref="argumentSettingForm" :item-list.sync="argumentSettingFormConfig"></TsForm>
  </div>
</template>
<script>
export default {
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: { action: { type: Object } },
  data() {
    return {
      argumentSettingFormConfig: {
        toUsers: {
          type: 'select',
          label: this.$t('page.recipient'),
          dynamicUrl: '/api/rest/codehub/user/search',
          idListName: 'idList',
          rootName: 'tbodyList',
          value: '',
          validateList: ['required'],
          valueName: 'userId',
          textName: 'userName',
          search: true,
          hasReturn: true,
          multiple: true
        },
        subject: {
          label: this.$t('page.theme'),
          type: 'text',
          validateList: ['required'],
          value: ''
        },
        content: {
          label: this.$t('page.content'),
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
