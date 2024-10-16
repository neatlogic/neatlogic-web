<template>
  <div class="pt-sm">
    <TsRow v-if="list.length" :gutter="8" class="text-tip pb-sm">
      <Col span="8">
        {{ $t('page.component') }}
      </Col>
      <Col span="4">
        {{ $t('page.type') }}
      </Col>
      <Col span="8">
        {{ $t('page.constant') }}/{{ $t('term.framework.hideattrassignment') }}
      </Col>
    </TsRow>
    <div v-for="(item,index) in list" :key="index" class="pb-sm">
      <TsRow :gutter="8">
        <Col span="8">
          <div>
            <TsFormSelect
              ref="formItem"
              v-model="item.attrUuid"
              :dataList="currentAttrList(item.attrUuid)"
              valueName="uuid"
              textName="label"
              :transfer="true"
              :validateList="validateList"
              border="border"
            ></TsFormSelect>
          </div>
        </Col>
        <Col :span="4">
          <div class>
            <TsFormSelect
              ref="formItem"
              v-model="item.type"
              :dataList="typeDataList"
              :transfer="true"
              :validateList="validateList"
              border="border"
              @change="
                $set(item, 'value', '');
              "
            ></TsFormSelect>
          </div>
        </Col>
        <Col span="8">
          <div>
            <TsFormSelect
              v-if="item.type === 'dynamic'"
              ref="formItem"
              v-model="item.value"
              :dataList="hiddenFieldList"
              border="border"
              transfer
              :validateList="validateList"
            ></TsFormSelect>
            <TsFormInput
              v-else
              ref="formItem"
              v-model="item.value"
              border="border"
              :validateList="validateList"
            ></TsFormInput>
          </div>
        </Col>
        <Col span="4">
          <div class="btn-group text-tip">
            <span
              class="tsfont-plus text-action pr-xs"
              @click="addItem()"
            ></span>
            <span
              class="tsfont-minus text-action"
              @click="delItem(index)"
            ></span>
          </div>
        </Col>
      </TsRow>
    </div>
    <div class="tsfont-plus text-href" @click="addItem()">{{ $t('term.framework.assignment') }}</div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  filters: {
  },
  props: {
    currentAttrUuid: {
      type: String,
      default: ''
    },
    value: {
      type: Array,
      default: () => []
    },
    hiddenFieldList: { //隐藏字段列表
      type: Array,
      default: () => []
    },
    attrList: { //被赋值组件列表
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      list: [],
      validateList: [{ name: 'required', message: ' ' }],
      typeDataList: [
        {
          text: this.$t('term.autoexec.static'),
          value: 'static'
        },
        {
          text: this.$t('page.dynamicvalue'),
          value: 'dynamic'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      this.list = this.$utils.deepClone(this.value) || [];
    },
    addItem() {
      this.list.push({ attrUuid: '', type: '', value: '' });
    },
    delItem(index) {
      this.list.splice(index, 1);
    },
    valid() {
      let isValid = true;
      for (let key in this.$refs) {
        const item = this.$refs[key];
        if (item) {
          if (Array.isArray(item) && item.length) {
            item.forEach(k => {
              k.valid && !k.valid() && (isValid = false);
            });
          } else {
            item.valid && !item.valid() && (isValid = false);
          }
        } 
      }
      return isValid;
    },
    save() {
      return this.list;
    }
  },
  computed: {
    currentAttrList() {
      return (attrUuid) => {
        let arr = [];
        this.attrList.forEach(item => {
          if (item.uuid === this.currentAttrUuid || item.handler !== 'formtext') {
            return;
          }
          let obj = { ...item };
          if (this.list) {
            let findItem = this.list.find(f => f.attrUuid === item.uuid && f.attrUuid !== attrUuid);
            if (findItem) {
              this.$set(obj, '_disabled', true);
            } else {
              this.$set(obj, '_disabled', false);
            }
          }
          arr.push(obj);
        });
        return arr;
      };
    }
  },
  watch: {
    list: {
      handler(val) {
        if (!this.$utils.isSame(this.value, val)) {
          this.$emit('change', this.$utils.deepClone(val));
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.btn-group {
  height: 32px;
  display: flex;
  align-items: center;
}
</style>
