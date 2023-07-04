<template>
  <div>
    <TsDialog
      :title="$t('page.detail')"
      type="slider"
      width="large"
      :isShow.sync="detailDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <DocumentonlineContent
            v-if="fileConfig.filePath"
            :filePath="fileConfig.filePath"
          ></DocumentonlineContent>
        </div>
      </template>
      <template v-slot:footer>
        <Button
          v-if="moduleGroup !== 'unClassified' && !isRelated"
          ghost
          type="primary"
          @click="addClassification"
        >{{ $t('term.documentonline.relcurrclass') }}</Button>
        <Button type="primary" @click="openClassifyDialog">{{ $t('page.add') }}</Button>
        <Button v-if="moduleGroup !== 'unClassified' && isRelated" type="error" @click="delClassification">{{ $t('term.process.move') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    DocumentonlineContent: resolve => require(['@/views/pages/documentonline/document/documentonline-content.vue'], resolve)
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    moduleGroup: {
      type: String,
      default: ''
    },
    fileConfig: {
      type: Object,
      default: () => {}
    },
    isRelated: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      detailDialog: false
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
    closeDialog() {
      this.$emit('close');
    },
    addClassification() {
      this.$emit('close', 'add');
    },
    openClassifyDialog() {
      this.$emit('close', 'edit');
    },
    delClassification() {
      this.$emit('close', 'del');
    }
  },
  filter: {},
  computed: {},
  watch: {
    isShow: {
      handler(val) {
        if (val) {
          this.detailDialog = val;
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
