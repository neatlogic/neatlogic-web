<template>
  <div v-if="errorList.length === 0" class="tstable-container pb-nm">
    <div class="tstable-main">
      <table class="tstable-body">
        <thead v-if="typeList.length > 0">
          <tr>
            <th></th>
            <th v-for="(type, index) in typeList" :key="index">
              {{ type.text }}
            </th>
          </tr>
        </thead>
        <tbody v-if="optionList.length > 0">
          <tr v-for="(option, index) in optionList" :key="index">
            <td>{{ option.text }}</td>
            <td v-for="(type, tindex) in typeList" :key="tindex">
              <div v-if="!readonly">
                <Checkbox
                  v-if="config.isMultiple"
                  :value="isChecked(type, option)"
                  :disabled="disabled"
                  @on-change="
                    val => {
                      changeValue(val, type, option);
                    }
                  "
                ></Checkbox>
                <Radio
                  v-else
                  :value="isChecked(type, option)"
                  :disabled="disabled"
                  @on-change="
                    val => {
                      changeValue(val, type, option);
                    }
                  "
                ></Radio>
              </div>
              <div v-else>
                <span v-if="isChecked(type, option)" :class="{ 'tsfont-circle-o': !config.isMultiple, 'tsfont-check-square': !!config.isMultiple, 'text-warning': readonlyTextIsHighlight, 'text-success': !readonlyTextIsHighlight}"></span>
                <span v-else :class="{ 'tsfont-circle': !config.isMultiple, 'tsfont-square': !!config.isMultiple }" class="text-grey"></span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div v-else class="text-grey">
    <ul>
      <li v-for="(error, index) in errorList" :key="index">{{ error }}</li>
    </ul>
  </div>
</template>
<script>
import base from './base.vue';
import validmixin from './common/validate-mixin.js';
export default {
  name: '',
  components: {},
  extends: base,
  mixins: [validmixin],
  props: {},
  data() {
    return {
      selectedValue: []
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
    validConfig() {
      const errorList = [];
      if (this.typeList.length === 0) {
        errorList.push({ field: 'typeList', error: this.$t('form.validate.leastonetarget', {'target': this.$t('page.category')}) });
      }
      if (this.optionList.length === 0) {
        errorList.push({ field: 'optionList', error: this.$t('form.validate.leastonetarget', {'target': this.$t('page.option')}) });
      }
      return errorList;
    },
    changeValue(val, type, option) {
      const index = this.selectedValue.findIndex(d => d.type === type.value && d.option === option.value);
      if (!val) {
        if (index > -1) {
          this.selectedValue.splice(index, 1);
        }
      } else {
        if (index == -1) {
          if (!this.config.isMultiple) {
            this.selectedValue = [];
          }
          this.selectedValue.push({ type: type.value, option: option.value });
        }
      }
    }
  },
  filter: {},
  computed: {
    errorList() {
      const errorList = [];
      this.validConfig().forEach(error => {
        if (!errorList.includes(error.error)) {
          errorList.push(error.error);
        }
      });
      return errorList;
    },
    typeList() {
      let typeList = [];
      if (this.config.typeList && this.config.typeList.length > 0) {
        typeList = this.config.typeList.filter(d => d.value !== '' && d.text !== '');
      }
      return typeList;
    },
    optionList() {
      let optionList = [];
      if (this.config.optionList && this.config.optionList.length > 0) {
        optionList = this.config.optionList.filter(d => d.value !== '' && d.text !== '');
      }
      return optionList;
    },
    isChecked() {
      return (type, option) => {
        const index = this.selectedValue.findIndex(d => d.type === type.value && d.option === option.value);
        return index > -1;
      };
    }
  },
  watch: {
    selectedValue: {
      handler: function(val) {
        if (!this.$utils.isSame(val, this.value)) {
          this.setValue(val);
        }
      },
      deep: true
    },
    value: {
      handler: function(val) {
        if (val && !this.$utils.isSame(val, this.selectedValue)) {
          this.selectedValue = val;
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
th,
td {
  text-align: center;
}
</style>
