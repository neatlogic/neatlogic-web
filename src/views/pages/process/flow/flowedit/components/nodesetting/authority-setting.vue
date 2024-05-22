<template>
  <div class="settingList">
    <div class="control-box">
      <div class="control-setting">
        <span class="label">{{ $t('page.authsetting') }}</span>
        <span class="control-btn">
          <span
            v-if="hasGlobal"
            class="tip"
            :class="isActive ==1?'text-tip':'text-href'"
            @click="gotoNodeSetting(isActive == 1,nodeConfig.handler,'auth')"
          >{{ isActive ==1? $t('page.custom'): $t('page.referenceglobal') }}</span>
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
      <div v-for="(item,index) of authorityList" :key="index" class="list list-bottom">
        <div class="second-title text-grey">{{ item.text }}</div>
        <div>
          <UserSelect
            :value.sync="item.acceptList"
            :groupList="item.groupList"
            border="border"
            width="100%"
          ></UserSelect>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import itemmixin from '../itemmixin.js';
export default {
  name: 'AuthoritySetting',
  components: {
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    UserSelect: () => import('@/resources/components/UserSelect/UserSelect')
  },
  mixins: [itemmixin],
  props: {
    defaultIsActive: {
      type: [String, Number],
      default: 0
    },
    list: {
      type: Array,
      default: function() {
        return [];
      }
    },
    hasGlobal: {
      type: Boolean,
      default: true
    },
    nodeConfig: {
      type: Object
    }
  },
  data() {
    return {
      isActive: this.defaultIsActive,
      authorityList: this.list
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
      this.authorityList.forEach(item => {
        item.acceptList = this.isActive == 1 ? item.acceptList && item.acceptList.length ? item.acceptList : [...(item.defaultValue || [])] : [];
      });
      return this.authorityList;
    },
    changeSwitch() {
      this.$emit('updateauthority', this.isActive, this.saveData());
    }
  },
  filter: {},
  computed: {},
  watch: {
    defaultIsActive: {
      handler: function(val) {
        this.isActive = val;
      }
    },
    list: {
      handler: function(val) {
        if (val && val.length > 0) {
          this.authorityList = val;
        }
      },
      deep: true
    }
  }
};
</script>
