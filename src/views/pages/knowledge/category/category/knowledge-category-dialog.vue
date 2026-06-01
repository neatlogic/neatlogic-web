<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsForm
            v-model="formData"
            :item-list="formConfig"
          ></TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    knowledgeDocumentId: {
      type: Number,
      default: null
    },
    // 知识分类类型uuid
    knowledgeDocumentTypeUuid: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dialogSetting: {
        title: this.$t('term.knowledge.knowtype'),
        type: 'modal',
        isShow: true,
        okText: this.$t('page.save')
      },
      formData: {
        knowledgeDocumentTypeUuid: this.knowledgeDocumentTypeUuid
      },
      selectedCategoryPath: '',
      formConfig: {
        knowledgeDocumentTypeUuid: {
          type: 'tree',
          label: this.$t('page.type'),
          width: '100%',
          url: 'api/rest/knowledge/document/type/tree/forselect',
          params: { isActive: 1 },
          search: true,
          valueName: 'uuid',
          textName: 'name',
          transfer: true,
          showPath: true,
          validateList: ['required'],
          onChange: (val, valueObject) => {
            this.selectedCategoryPath = valueObject?._path || '';
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
    closeDialog(data) {
      this.$emit('close', data);
    },
    okDialog() {
      const data = {
        knowledgeDocumentId: this.knowledgeDocumentId,
        knowledgeDocumentTypeUuid: this.formData.knowledgeDocumentTypeUuid
      };
      this.$api.knowledge.knowledge.updateType(data).then(res => {
        if (res.Status == 'OK') {
          this.closeDialog({
            knowledgeDocumentTypeUuid: this.formData.knowledgeDocumentTypeUuid,
            path: this.selectedCategoryPath
          });
          this.$Message.success(this.$t('message.executesuccess'));
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
