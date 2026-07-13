<template>
  <TsDialog v-bind="dialogConfig" @on-ok="confirm()" @on-close="close()">
    <template v-slot>
      <div>
        <TsFormItem :label="$t('page.theme')" :labelWidth="50">
          <span>{{ name }}</span>
        </TsFormItem>
        <TsFormItem :label="$t('page.content')" :labelWidth="50">
          <TsCodemirror
            ref="content"
            v-model="content"
            codeMode="json"
            :validateList="['required']"
          ></TsCodemirror>
        </TsFormItem>
       
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror')
  },
  props: {
    name: { type: String }
  },
  data() {
    return {
      content: null,
      dialogConfig: {
        title: this.$t('term.framework.testtopic'),
        isShow: true,
        width: 'small'
      }
    };
  },
  beforeCreate() {},
  async created() {},
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
      this.$emit('close');
    },
    confirm() {
      if (this.$refs.content && this.$refs.content.valid()) {
        this.$api.framework.mq.testTopic({ name: this.name, content: this.content }).then(res => {
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('term.framework.sendsuccess'));
            this.close();
          }
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
