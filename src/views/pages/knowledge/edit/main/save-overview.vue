<template>
  <div>
    <TsDialog
      :isShow.sync="showDialog"
      :title="$t('dialog.title.addtarget',{target: $t('page.template')})"
      @on-close="close"
      @on-ok="saveOk"
    >
      <template v-slot>
        <TsForm ref="form" :itemList="form"></TsForm>
      </template>
    </TsDialog>
  </div>
</template>

<script>
import TsForm from '@/resources/plugins/TsForm/TsForm';
import handler from '../../../dashboard/widget/handler';
export default {
  name: '',
  components: {
    TsForm
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showDialog: false,
      form: [
        {
          name: 'name',
          label: this.$t('page.name'),
          type: 'text',
          value: '',
          validateList: ['required', 'name-special', {
            name: 'searchUrl', url: 'api/rest/knowledge/template/save'
          }],
          errorMessage: null,
          onFocus: () => {
            this.form[0].errorMessage = null;
          }
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
    close() {
      this.showDialog = false;
      this.$emit('update:isShow', false);
    },
    saveOk() {
      if (this.$refs.form.valid()) {
        let data = this.$refs.form.getFormValue();
        let templateDataList = this.$parent.getTemplateData();
        let list = [];
        const levelList = [1, 2];
        if (templateDataList && templateDataList.length > 0) {
          list = templateDataList.filter(item => levelList.includes(item.attrs.level)).map((item) => {
            const handler = `h${item.attrs.level}`;
            return {
              handler: handler,
              uuid: item.attrs.blockUuid,
              content: item.content?.[0].text,
              config: {}
            };
          });
        }
        this.$api.knowledge.template.save({name: data.name, content: list})
          .then((res) => {
            if (res.Status == 'OK') {
              this.close();
              this.$Message.success(this.$t('message.savesuccess'));
            }
          })
          .catch(errorMsg => {
            this.form[0].errorMessage = errorMsg;
          });
      }
    }
  },

  filter: {},

  computed: {},

  watch: {
    isShow(val) {
      this.showDialog = val;
    }
  }
};
</script>
<style lang='less' scoped>
</style>
