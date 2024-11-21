<template>
  <div>
    <div><TsFormSelect
      v-if="isShow"
      ref="handler"
      :value="selectValueList"
      :disabled="disabled || (!isMultiple && extraDataList.length > 0)"
      v-bind="searchConfig"
      :validateList="validateList"
      :multiple="isMultiple"
    >
      <template v-if="allowCreate && (isMultiple || (!isMultiple && selectValueList.length == 0 && extraDataList.length == 0))" v-slot:first-ul>
        <li class="tsfont-plus text-href first-slot" style="text-align:left" @click="addCiEntity">{{ $t('page.option') }}</li>
      </template>
    </TsFormSelect>
    </div>
    <Divider
      v-if="isShow && extraDataList.length > 0"
      plain
      orientation="left"
      style="font-size:12px;margin:5px 0px;"
    >{{ $t('page.newtarget',{'target':$t('page.option')}) }}</Divider>
    <div v-if="extraDataList.length > 0">
      <Tag
        v-for="(d,index) in extraDataList"
        :key="index"
        :closable="true"
        style="cursor:pointer"
        type="dot"
        color="success"
        @click.native="editCiEntity(d.uuid)"
        @on-close="deleteCiEntity(d)"
      >{{ d.name }}</Tag>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {
    disabled: { type: Boolean, default: false },
    attrData: { type: Object },
    valueList: { type: Array }
  },
  data() {
    return {
      multiple: false,
      searchConfig: {
        border: 'border',
        search: true,
        width: '100%',
        dynamicUrl: '/api/rest/cmdb/attr/targetci/search?attrId=' + this.attrData.id + '&pageSize=40',
        textName: 'name',
        valueName: 'id',
        transfer: true,
        onChange: (val, opt) => {
          let returnValue = [];
          let returnActualValue = [];
          if (opt) {
            if (Array.isArray(opt)) {
              returnValue = val;
              returnActualValue = opt.filter(d => d.text);
            } else {
              if (!this.$utils.isEmpty(opt)) {
                returnValue.push(val);
                returnActualValue.push(opt.text);
              }
            }
          }
          if (this.extraDataList.length > 0) {
            this.extraDataList.forEach(d => {
              returnValue.push(d);
              returnActualValue.push(d.name);
            });
          }

          this.$emit(
            'setData',
            returnValue,
            returnActualValue
          );
        }
      }
    };
  },
  beforeCreate() {},
  created() {
  
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    valid() {
      //验证数据合法性
      const handler = this.$refs['handler'];
      let isValid = true;
      if (handler) {
        isValid = handler.valid();
      }
      if (isValid) {
        if (this.attrData && (this.attrData.isRequired || this.attrData.isCiUnique)) {
          if (this.selectValueList.length == 0 && this.extraDataList.length == 0) {
            isValid = false;
          }
        }
      }
      return isValid;
    },
    addCiEntity() {
      if (!this.disabled) {
        this.$emit('new');
      }
    },
    deleteCiEntity(item) {
      if (!this.disabled) {
        this.$emit('delete', item);
      }
    },
    editCiEntity(uuid) {
      if (!this.disabled) {
        this.$emit('edit', uuid);
      }
    }
  },
  filter: {},
  computed: {
    validateList() {
      if (this.attrData) {
        if (this.attrData.isRequired || this.attrData.isCiUnique) {
          if (this.extraDataList.length === 0) {
            return ['required'];
          }
        }
      }
      return [];
    },
    isShow() {
      return !(!this.isMultiple && this.extraDataList.length > 0);
    },
    isMultiple: function() {
      if (this.attrData && this.attrData.config && this.attrData.config.isMultiple) {
        return true;
      }
      return false;
    },
    allowCreate: function() {
      if (this.attrData && this.attrData.config && this.attrData.config.mode && this.attrData.config.mode.indexOf('w') > -1) {
        return true;
      }
      return false;
    },
    extraDataList() {
      const list = [];
      if (this.valueList && this.valueList.length > 0) {
        this.valueList.forEach(v => {
          if (typeof v == 'object') {
            list.push(v);
          }
        });
      }
      return list;
    },
    selectValueList() {
      const list = [];
      if (this.valueList && this.valueList.length > 0) {
        this.valueList.forEach(v => {
          if (typeof v != 'object') {
            if (v) {
              list.push(v);
            }
          }
        });
      }
      return list;
    }
  },
  watch: {
    /*attrData: {
      handler: function() {
        if (this.attrData) {
          if (this.attrData.isRequired == 1) {
            this.validateList.push('required');
          }
        }
      },
      deep: true,
      immediate: true
    }
    */
  }
};
</script>
<style lang="less"></style>
