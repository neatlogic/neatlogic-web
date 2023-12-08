<template>
  <div>
    <TsRow :gutter="8">
      <Col v-if="validSetting" :span="10">
        <TsFormSelect
          v-model="valiDate"
          :dataList="dataList"
          :placeholder="$t('form.placeholder.checkrule')"
          :readonly="readonly"
          :disabled="disabled"
          border="border"
          transfer
          @on-change="changeConfig"
        ></TsFormSelect>
      </Col>
      <Col :span="validSetting?14:24">
        <TsFormInput
          ref="item"
          :type="type"
          :value="value"
          :readonly="readonly"
          :disabled="disabled"
          v-bind="getSetting"
          border="border"
          :maxlength="type==='textarea'? 4096:500"
          @on-change="updateval"
        ></TsFormInput>
      </Col>
    </TsRow>
  </div>
</template>

<script>
import comMixin from './editmixin.js';
export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  mixins: [comMixin],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    //  value: [String, Number]
  },
  data() {
    return {
      dataList: [
        {
          text: this.$t('page.letter'),
          value: 'unique_ident'
        },
        {
          text: this.$t('page.lowercaseletter'),
          value: 'lowercase'
        },
        {
          text: this.$t('page.capitalletter'),
          value: 'uppercase'
        },
        {
          text: this.$t('page.number'),
          value: 'number'
        },
        {
          text: this.$t('page.lettersandnumbers'),
          value: 'enchar'
        },
        {
          text: this.$t('page.emailaddress'),
          value: 'mail'
        },
        {
          text: this.$t('page.phonenumber'),
          value: 'phone'
        },
        {
          text: this.$t('page.ip'),
          value: 'ip'
        },
        {
          text: this.$t('page.port'),
          value: 'port'
        },
        {
          text: 'URL',
          value: 'url'
        },
        {
          text: '高危代码',
          value: 'highriskcode'
        }
      ],
      valiDate: null,
      type: 'text'
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
    updateval(val) {
      this.$emit('change', val);
    },
    changeConfig(val) {
      if (val) {
        this.$emit('getConfig', {validateList: [{'name': val}]});
      } else {
        this.$emit('getConfig', {validateList: []});
      }
    }
  },

  filter: {},

  computed: {
    validSetting() {
      let isSet = false;
      if (this.setValidComponentsList.includes('text') || this.setValidComponentsList.includes('textarea')) {
        isSet = true;
      }
      return isSet; 
    }
  },

  watch: {
    config: {
      handler(val) {
        let validList = ['unique_ident', 'lowercase', 'uppercase', 'number', 'enchar', 'mail', 'phone', 'ip', 'port', 'url', 'highriskcode'];
        if (val) {
          if (!this.$utils.isEmpty(val.validateList)) {
            val.validateList.forEach(item => {
              if (validList.includes(item.name)) {
                this.valiDate = item.name;
              }
            });
          }
          if (val.type) {
            this.type = val.type;
          }
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
/deep/ .tsform-input-readonly {
  opacity: 1;
  cursor: text;
  .tsform-readonly {
    cursor: text;
  }
}
</style>
