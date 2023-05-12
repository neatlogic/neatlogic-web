<template>
  <div>
    <div class="category">
      <span class="text overflow">
        <TsFormTree v-bind="selectConfig"></TsFormTree>
      </span>
      <span
        v-if="isReviewer == 1"
        class="tsfont-edit text-action"
        style="float:right"
        @click="editType"
      ></span>
    </div>
    <TsDialog
      :isShow="showType"
      :title="$t('dialog.title.edittarget',{target:$t('page.classify')})"
      className="select-dialog"
      @on-close="close"
      @on-ok="okSave"
    >
      <template>
        <TsForm ref="form" :itemList="form"></TsForm>
      </template>
    </TsDialog>
  </div>
</template>

<script>
import TsForm from '@/resources/plugins/TsForm/TsForm';
import TsFormTree from '@/resources/plugins/TsForm/TsFormTree';

export default {
  name: '',
  components: { TsForm, TsFormTree },
  props: {
    knowledgeDocumentTypeUuid: {
      type: [String, Number],
      default: null
    },
    isReviewer: Number
  },
  data() {
    return {
      showType: false,
      form: [
        {
          name: 'uuid',
          label: this.$t('page.classify'),
          type: 'tree',
          url: 'api/rest/knowledge/document/type/tree/forselect',
          value: '',
          valueName: 'uuid',
          textName: 'name',
          width: '100%',
          validateList: ['required'],
          transfer: true,
          showPath: true,
          multiple: false
        }
      ],
      selectConfig: {
        url: 'api/rest/knowledge/document/type/tree/forselect',
        valueName: 'uuid',
        textName: 'name',
        value: '',
        readonly: true,
        showPath: true,
        readonlyClass: ''
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
    close() {
      this.showType = false;
    },
    okSave() {
      if (this.$refs.form.valid()) {
        let data = this.$refs.form.getFormValue();
        this.$emit('on-ok', data);
        this.selectConfig.value = data.uuid;
        this.showType = false;
      }
    },
    editType() {
      this.form[0].value = this.selectConfig.value;
      this.showType = true;
    }
  },

  filter: {},

  computed: {},

  watch: {
    knowledgeDocumentTypeUuid: {
      handler(val) {
        if (val) {
          this.selectConfig.value = val;
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.category {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}
</style>
