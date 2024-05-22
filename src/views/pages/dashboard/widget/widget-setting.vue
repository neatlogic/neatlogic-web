<template>
  <Row :gutter="8" style="height: 100%; line-height: 46px; position: relative;">
    <Col span="4">
      {{ $t('term.dashboard.widgetname') }}
    </Col>
    <Col span="10">
      <forminput
        v-model="name"
        maxlength="20"
        width="100%"
        @on-change="formchange"
      ></forminput>
    </Col>
  </Row>
</template>

<script>
export default {
  name: 'WidgetSetting',
  components: {
    forminput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: {
    widgetdata: Object
  },
  data() {
    return {
      name: this.widgetdata.name
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
    formchange(val) {
      this.widgetdata.name = val;
    },
    validData() {
      if (!this.name) {
        return {
          valid: false,
          msg: this.$t('term.dashboard.widgetnameempty')
        };
      } else {
        return {
          valid: true,
          msg: '！'
        };
      }
    },
    getData() {
      return {
        name: name
      };
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>

<style scoped></style>
