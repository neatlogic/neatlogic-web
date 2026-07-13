<template>
  <div class="issue-copy-tag">
    <span>{{ finalText }}</span>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    text: { type: String, default: '' }
  },
  data() {
    return {};
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
    finalText() {
      return this.text || this.$t('term.rdm.copy');
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.issue-copy-tag {
  color: #fff;
  background: #808695;
  padding: 0px 3px 0px 3px;
  border-radius: 3px;
  display: inline-block;
  font-size: 12px !important;
  transform: scale(0.75);
  line-height: 18px;
}
</style>
