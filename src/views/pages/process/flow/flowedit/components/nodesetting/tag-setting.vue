
<template>
  <div class="settingList">
    <div class="control-box">
      <div class="control-setting">
        <span class="label">{{ $t('page.tag') }}</span>
        <span class="control-btn">
          <TsFormSwitch
            v-model="isActive"
            :true-value="1"
            :false-value="0"
            @on-change="changeSwitch"
          ></TsFormSwitch>
        </span>
      </div>
    </div>
    <div v-if="isActive == 1" class="permission-list">
      <TsFormSelect
        v-model="tagList"
        v-bind="selectConfig"
        :dynamicDefaultValue="defaultValue"
      ></TsFormSelect>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  filters: {
  },
  props: {
    nodeConfig: Object,
    defaultIsActive: {
      type: [String, Number],
      default: 0
    },
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    let _this = this;
    return {
      isActive: 0,
      selectConfig: {
        placeholder: this.$t('dialog.title.addtarget', {target: this.$t('page.tag')}),
        border: 'border',
        search: true,
        allowCreate: true,
        transfer: true,
        multiple: true,
        dynamicUrl: '/api/rest/process/tag/get',
        rootName: 'list',
        textName: 'text',
        valueName: 'text'
      },
      defaultValue: _this.list,
      tagList: []
     
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
    getData() {
      let tagList = [];
      if (this.isActive) {
        tagList = this.tagList;
      }
      return tagList;
    },
    changeSwitch(val) { 
      if (!val) {
        this.tagList = [];
      }
    }
  },
  computed: {},
  watch: {
    defaultIsActive: {
      handler: function(val) {
        this.isActive = val;
      },
      immediate: true
    },
    list: {
      handler: function(val) {
        if (val && val.length > 0) {
          this.tagList = this.$utils.deepClone(val);
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
