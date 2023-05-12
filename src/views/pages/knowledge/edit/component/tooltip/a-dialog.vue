<template>
  <div>
    <TsDialog
      type="modal"
      :isShow.sync="isShow"
      :title="$t('dialog.title.addtarget', { target: $t('page.line') })"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template>
        <div v-if="type=='outerA'">
          <TsForm ref="form" :itemList="outConfig"></TsForm>
        </div>
        <div v-else-if="type=='innerA'">
          <TsForm ref="innerForm" :itemList="innerConfig"></TsForm>
        </div>
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
    showDialog: Boolean,
    type: String,
    innerText: String
  },
  data() {
    let _this = this;
    return {
      isShow: false,
      outConfig: {
        url: {
          label: 'URL',
          type: 'url',
          value: '',
          validateList: ['required', 'url'],
          desc: this.$t('term.knowledge.outtopage')
        }
      },
      innerConfig: {
        help: {
          type: 'textspan',
          value: _this.innerText,
          label: this.$t('term.knowledge.searchdockeyword')
        },
        id: {
          label: this.$t('term.knowledge.selectinlink'),
          type: 'select',
          value: '',
          validateList: ['required'],
          url: 'api/rest/knowledge/document/list/forinternallink',
          params: {keyword: ''},
          // dataList: [
          //   {
          //     value: 1,
          //     text: 1
          //   }
          // ],
          transfer: true,
          rootName: 'list'
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
    okDialog() {
      if (this.$refs.form && this.$refs.form.valid() && this.type === 'outerA') {
        let data = this.$refs.form.getFormValue();
        data.title = this.$t('term.knowledge.jumptolink', { target: data.url });
        this.$emit('on-ok', data);
        this.$emit('update:showDialog', false);
      } else if (this.$refs.innerForm && this.$refs.innerForm.valid() && this.type === 'innerA') {
        let data = this.$refs.innerForm.getFormValue();
        this.$emit('on-ok', data);
        this.$emit('update:showDialog', false);
      }
    },
    closeDialog() {
      this.$emit('update:showDialog', false);
    }
  },
  filter: {},
  computed: {},
  watch: {
    showDialog: {
      handler(val) {
        this.isShow = val;
        this.outConfig.url.value = '';
      },
      immediate: true
    },
    innerText: {
      handler(val) {
        this.innerConfig.id.params.keyword = val;
        this.innerConfig.help.value = val;
      },
      immediate: true
    }
  }
};
</script>
<style lang="less"></style>
