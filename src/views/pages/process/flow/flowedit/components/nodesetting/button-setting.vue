<template>
  <div class="settingList">
    <div class="control-box">
      <div class="control-setting">
        <span class="label">{{ title }}</span>
        <span class="control-btn">
          <span class="tip" :class="isActive == 1?'text-tip':'text-href'" @click="gotoNodeSetting(isActive == 1,nodeConfig.handler,'button')">{{ isActive == 1 ? $t('page.custom') : $t('page.referenceglobal') }}</span>
          <span style="display: inline-block;">
            <TsFormSwitch
              v-model="isActive"
              :true-value="1"
              :false-value="0"
              @on-change="changeSwitch"
            ></TsFormSwitch>
          </span>
        </span>
      </div>
    </div>
    <div v-if="isActive == 1" class="permission-list">
      <template v-for="(keyValue,key) in config">
        <div v-if="keyValue.dataList && keyValue.dataList.length" :key="key" class="list list-bottom">
          <div class="second-title text-grey" @click="keyValue.isShowButton = !keyValue.isShowButton">
            <span>{{ keyValue.text }}</span>
            <span :class="keyValue.isShowButton?'tsfont-down':'tsfont-right'"></span>
          </div>
          <div v-show="keyValue.isShowButton" class="edit-setting content">
            <div v-for="(item, index) of keyValue.dataList" :key="index" class="status-list">
              <span class="status-left overflow" :title="item.text.length > 5 ? item.text : ''">{{ item.text }}</span>
              <span class="status-center">
                <img src="~@/resources/assets/images/itsm/btn-relevance.png" />
              </span>
              <span class="status-right input-border">
                <TsFormInput
                  v-model="item.value"
                  :placeholder="$t('page.referenceglobal')"
                  border="border"
                  @on-change="changeValue"
                />
              </span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
import itemmixin from '../itemmixin.js';
export default {
  name: '',
  components: {
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  mixins: [itemmixin],
  props: {
    title: {
      type: String,
      default() {
        return this.$t('page.edittext');
      }
    },
    defaultIsActive: {
      type: [String, Number],
      default: 0
    },
    defaultCustomButtonList: {
      type: Array,
      default: function() {
        return [];
      }
    },
    defaultCustomStatusList: {
      type: Array,
      default: function() {
        return [];
      }
    },
    defaultReplaceableTextList: {
      type: Array,
      default: function() {
        return [];
      }
    },
    nodeConfig: {
      type: Object
    }
  },
  data() {
    return {
      isActive: 0,
      config: {
        customButtonList: {
          text: this.$t('page.button'),
          dataList: [],
          isShowButton: true
        }, 
        customStatusList: {
          text: this.$t('term.process.nodestatus'),
          dataList: [],
          isShowButton: true
        }, 
        replaceableTextList: {
          text: this.$t('page.others'),
          dataList: [],
          isShowButton: true
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
    saveData() {
      let data = {};
      for (let key in this.config) {
        data[key] = this.config[key].dataList;
      }
      return data;
    },
    changeSwitch(val) {
      for (let key in this.config) {
        let item = this.config[key];
        item.dataList.forEach(cc => {
          cc.value = '';
        });
      }
      this.changeValue();
    },
    changeValue() {
      let data = this.saveData();
      this.$emit('updatebutton', data);
    }
  },
  filter: {},
  computed: {},
  watch: {
    defaultIsActive: {
      handler: function(val) {
        if (val == 1) {
          this.isActive = 1;
        }
      },
      immediate: true
    },
    defaultCustomButtonList: {
      handler: function(val) {
        if (val && val.length > 0) {
          this.config.customButtonList.dataList = this.$utils.deepClone(val);
        }
      },
      deep: true,
      immediate: true
    },
    defaultCustomStatusList: {
      handler: function(val) {
        if (val && val.length > 0) {
          this.config.customStatusList.dataList = this.$utils.deepClone(val);
        }
      },
      deep: true,
      immediate: true
    },
    defaultReplaceableTextList: {
      handler: function(val) {
        if (val && val.length > 0) {
          this.config.replaceableTextList.dataList = this.$utils.deepClone(val);
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.second-title{
  display: flex;
  cursor: pointer;
  justify-content: space-between;
}
</style>

