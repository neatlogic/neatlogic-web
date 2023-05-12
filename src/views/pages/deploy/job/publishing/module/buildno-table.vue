<template>
  <div v-if="versionData">
    <div class="pb-sm">
      <TsFormRadio
        v-model="buildType"
        :dataList="buildTypeList"
        @change="selectVersionValue=null"
      ></TsFormRadio>
    </div>
    <div v-if="buildType == 'add'" :style="{width:'50%'}">
      <TsFormSelect
        v-model="selectVersionValue"
        v-bind="buildFormConfig"
        :params="getParams(params)"
        @change="(value,selectItem)=>{getSelectedVersion(selectItem)}"
        @first="addVersion()"
      ></TsFormSelect>
    </div>
    <div v-else>
      <div class="version-top pb-nm">
        <div class="tsfont-plus text-action" @click="addVersion">{{ $t('page.versions') }}</div>
        <div class="search-box">
          <TimeSelect
            v-model="searchParam.startTimeRange"
            border="border"
            :placeholder="$t('term.deploy.compiletime')"
            transfer
            class="pr-sm time-select"
            @change="searchVersionBuildno(1)"
          ></TimeSelect>
          <InputSearcher
            v-model="searchParam.keyword"
            :placeholder="$t('page.versions')"
            border="border"
            @change="searchVersionBuildno(1)"
          ></InputSearcher>
        </div>
      </div>
      <TsTable
        v-model="selectVersionValue"
        keyName="version_buildNo"
        :theadList="theadList"
        v-bind="versionData"
        @changeCurrent="searchVersionBuildno"
        @getSelected="(value,selectItem)=>{getSelectedVersion(selectItem)}"
      >
        <template slot="status" slot-scope="{row}">
          <CommonStatus
            :statusValue="row.status"
            :statusName="row.statusName"
            type="text"
          ></CommonStatus>
        </template>
        <template slot="versionIsFreeze" slot-scope="{row}">
          <TsFormSwitch
            v-model="row.versionIsFreeze"
            :disabled="true"
          ></TsFormSwitch>
        </template>
      </TsTable>
    </div>
 
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    CommonStatus: resolve => require(['@/resources/components/Status/CommonStatus.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TimeSelect: resolve => require(['@/resources/components/TimeSelect/TimeSelect.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve)
  },
  props: {
    params: Object
  },
  data() {
    return {
      searchParam: {
        startTimeRange: null,
        keyword: ''
      },
      versionData: null,
      theadList: [
        {
          key: 'selection',
          multiple: false
        },
        {
          title: this.$t('page.versions'),
          key: 'version'
        },
        {
          title: this.$t('page.status'),
          key: 'status'
        },
        {
          title: this.$t('term.deploy.sealplate'),
          key: 'versionIsFreeze'
        },
        {
          title: 'buildNo',
          key: 'buildNo'
        },
        {
          title: this.$t('term.deploy.compiletime'),
          key: 'compileStartTime',
          type: 'time'
        }
      ],
      selectVersionValue: null,
      buildType: 'add',
      buildTypeList: [
        {
          text: this.$t('term.deploy.addbuildno'),
          value: 'add'
        },
        {
          text: this.$t('term.deploy.selectbuildno'),
          value: 'selected'
        }
      ],
      buildFormConfig: {
        dynamicUrl: '/api/rest/deploy/version/search',
        params: {
          appSystemIdList: [this.appSystemId]
        },
        rootName: 'tbodyList',
        transfer: true,
        search: true,
        border: 'border',
        dealDataByUrl: this.dealDataByUrl,
        firstSelect: false,
        firstText: this.$t('page.versions'),
        firstLi: true

      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchVersionBuildno();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    dealDataByUrl(nodeList) { // 处理默认值的数据结构
      return this.dealDataFilter(nodeList);
    },
    dealDataFilter(nodeList) {
      // 处理默认值的数据结构
      let columlist = [];           
      nodeList.forEach(v => {
        let text = v.version;
        if (v.isFreeze) {
          text += this.$t('term.deploy.sealedplate');
        } else {
          text += this.$t('term.deploy.unsealedversion');
        }
        columlist.push(
          {
            text: text, 
            value: v.version,
            _disabled: v.isFreeze
          }
        );
      });
      return columlist;
    },
    searchVersionBuildno(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.$api.deploy.version.searchVersionBuildno(this.searchParam).then((res) => {
        if (res.Status == 'OK') {
          let versionData = res.Return || {};
          if (versionData.tbodyList && versionData.tbodyList.length) {
            versionData.tbodyList.forEach(item => {
              this.$set(item, 'version_buildNo', item.version + '_' + item.buildNo);
            });
          }
          this.versionData = versionData;
        }
      });
    },
    getSelectedVersion(selectItem) {
      if (this.buildType == 'add') {
        this.$emit('getSelectedVersion', {'version': selectItem.value, 'buildNo': -1});
      } else {
        this.$emit('getSelectedVersion', selectItem[0]);
      }
    },
    addVersion() {
      this.$emit('addVersion');
    }
  },
  filter: {},
  computed: {
    getParams() {
      return (params) => {
        let data = {
          appSystemIdList: [params.appSystemId],
          appModuleIdList: [params.appModuleId]
        };
        return data;
      };
    }
  },
  watch: {
    params: {
      handler(val) {
        if (val) {
          if (val.appSystemId) {
            this.$set(this.searchParam, 'appSystemIdList', [val.appSystemId]);
          }
          if (val.appModuleId) {
            this.$set(this.searchParam, 'appModuleIdList', [val.appModuleId]);
          }
          if (val.version) {
            if (val.buildNo == -1) { //新建buildNo
              this.buildType = 'add';
              this.selectVersionValue = val.version;
            } else { //选择buildNo
              this.buildType = 'selected';
              this.selectVersionValue = [val.version + '_' + val.buildNo];
            }
          }
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.version-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .search-box {
    display: inline-flex;
    .time-select {
      width: 200px;
    }
  }
}
</style>
