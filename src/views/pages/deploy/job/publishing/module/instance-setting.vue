<template>
  <div>
    <div v-if="instanceList.length > 0" class="flex-start pb-sm">
      <div style="flex: 1;">
        <TsRow :gutter="10">
          <template v-for="(item,index) in getShowList(instanceList)">
            <Col
              :key="index"
              :span="6"
            >
              <div class="instance-item border-color overflow padding-sm" :title="showLabel(item)">
                {{ showLabel(item) }}
                <i v-if="!disabled" class="remove tsfont-close text-grey" @click="handleClose(item, index)"></i>
              </div>
            </Col>
          </template>  
        </TsRow>
      </div>
      <div v-if="instanceList.length > showNumber" class="pl-sm">
        <span class="text-tip-active tips pr-sm" @click="isShowMoreDialog = true">
          查看所有实例
        </span>
        <span class="text-href" @click="clearAll">
          {{ $t('page.clear') }}
        </span>
      </div>
    </div>
    <TsRow v-if="isHaveInitData">
      <Col :span="12">
      </Col>
      <Col :span="12">
        <InputSearcher
          v-model="keyword"
          :placeholder="$t('form.placeholder.pleaseinput',{'target':'ip'})"
          @change="getInstanceList(1)"
        ></InputSearcher>
      </Col>
    </TsRow>
    <div v-if="tableData.tbodyList && tableData.tbodyList.length > 0">
      <div class="pl-xs">
        <Checkbox
          :value="allInstanceCheck(tableData)"
          :indeterminate="allInstanceIndeterminate(tableData)"
          :disabled="disabled"
          @on-change="
            val => {
              checkAllInstance(val);
            }
          "
        >
          <span>{{ $t('page.selectall') }}</span>
          <Poptip
            :transfer="true"
            word-wrap
            trigger="hover"
          >
            <i class="tsfont-info-o text-tip-active tips"></i>
            <div slot="content" class="tooltip-content">仅选中当前页实例</div>
          </Poptip>
        </Checkbox>
      </div>
      <div class="instance-ul">
        <TsCard
          v-bind="tableData"
          :boxShadow="false"
          :sm="12"
          :lg="8"
          :xl="6"
          :xxl="4"
          :padding="false"
          @updatePage="searchData"
        >
          <template slot-scope="{ row }">
            <div class="overflow">
              <Checkbox
                v-model="row.isChecked"
                :disabled="disabled"
                @on-change="(val)=>{
                  checkInstance(val, row);
                }"
              >
                <span :title="showLabel(row)" class="text-tip">{{ showLabel(row) }}</span>
              </Checkbox>
            </div>
          </template>
        </TsCard>
      </div>
    </div>
    <NoData v-else-if="isHaveInitData"></NoData>
    <div v-else class="text-tip">{{ $t('term.deploy.moduleenvnotinstance', {modulename: module.name, envname: envName}) }}</div>
    <MoreInstanceDialog
      v-if="isShowMoreDialog"
      :dataList="instanceList"
      :disabled="disabled"
      @close="closeDialog"
    ></MoreInstanceDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsCard: () => import('@/resources/components/TsCard/TsCard.vue'),
    MoreInstanceDialog: () => import('./more-instance-dialog.vue'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue')
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    appSystemId: Number,
    envId: Number,
    envName: String,
    module: Object
  },
  data() {
    return {
      showNumber: 4,
      isShowMoreDialog: false,
      tableData: {},
      currentPage: 1,
      instanceList: [],
      keyword: '',
      isHaveInitData: false //是否有初始数据
    };
  },
  beforeCreate() {},
  created() {
    this.initData();
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
    initData() {
      this.instanceList = [];
      this.isHaveInitData = false;
      if (this.module.instanceList && this.module.instanceList.length) {
        this.instanceList = this.module.instanceList.map(m => {
          return {
            ...m,
            isChecked: true
          };
        });
      }
      this.getInstanceList(1, true);
    },
    getInstanceList(currentPage, isFirst) {
      //获取实例列表
      let data = {
        appSystemId: this.appSystemId,
        envId: this.envId,
        appModuleId: this.module.id,
        currentPage: currentPage || this.currentPage,
        pageSize: 100,
        keyword: this.keyword
      };
      currentPage && (this.currentPage = currentPage);
      this.$api.deploy.env.getInstanceList(data).then(res => {
        if (res.Status == 'OK') {
          this.tableData = res.Return;
          if (isFirst) {
            if (!this.$utils.isEmpty(this.tableData.tbodyList)) {
              this.isHaveInitData = true;
            }
          
            if (this.$utils.isEmpty(this.instanceList)) {
              this.instanceList = this.tableData.tbodyList.map(m => {
                return {
                  ...m,
                  isChecked: true
                };
              });
            }
          }
          this.tableData.tbodyList.forEach(i => {
            if (this.instanceList.find(ins => ins.id === i.id)) {
              this.$set(i, 'isChecked', true);
            } else {
              this.$set(i, 'isChecked', false);
            }
          });
        }
      }).finally(() => {
        this.$nextTick(() => {
          this.$set(this.module, 'loadingShow', false);
        });
      });
    },
    searchData(currentPage) {
      this.getInstanceList(currentPage);
    },
    checkInstance(val, row) {
      if (val) {
        this.instanceList.push(row);
      } else {
        this.instanceList = this.instanceList.filter(i => i.id !== row.id); 
      }
    },
    checkAllInstance(isChecked) {
      if (this.tableData && this.tableData.tbodyList.length) {
        this.tableData.tbodyList.forEach(i => {
          this.$set(i, 'isChecked', isChecked);
          const findItem = this.instanceList.find(ins => ins.id === i.id);
          if (isChecked && !findItem) {
            this.instanceList.push(i);
          } else if (!isChecked && findItem) {
            this.instanceList = this.instanceList.filter(ins => ins.id !== i.id);
          }
        });
      }
    },
    handleClose(item, index) {
      this.instanceList.splice(index, 1);
      this.tableData.tbodyList.forEach(i => {
        if (i.id === item.id) {
          this.$set(i, 'isChecked', false); 
        }
      });
    },
    clearAll() {
      this.instanceList = []; 
      this.checkAllInstance(false);
    },
    closeDialog(val) {
      if (val) {
        this.instanceList = val;
        this.tableData.tbodyList.forEach(i => {
          if (this.instanceList.find(ins => ins.id === i.id)) {
            this.$set(i, 'isChecked', true);
          } else {
            this.$set(i, 'isChecked', false);
          }
        });
      }
      this.isShowMoreDialog = false;
    }
  },
  filter: {},
  computed: {
    allInstanceCheck() {
      return (tableData) => {
        if (tableData.tbodyList && tableData.tbodyList.length > 0) {
          const uncheckItem = tableData.tbodyList.find(element => !element.isChecked);
          const checkedItem = tableData.tbodyList.find(element => element.isChecked);
          if (!uncheckItem && checkedItem) {
            return true;
          }
        }
        return false;
      };
    },
    allInstanceIndeterminate() {
      return (tableData) => {
        if (tableData.instanceList && tableData.instanceList.length > 0) {
          const uncheckItem = tableData.tbodyList.find(element => !element.isChecked);
          const checkedItem = tableData.tbodyList.find(element => element.isChecked);
          if (uncheckItem && checkedItem) {
            return true;
          }
        }
        return false;
      };
    },
    getShowList() {
      return function(list) {
        let showList = list.slice(0, this.showNumber);
        return showList;
      };
    },
    showLabel() {
      return data => {
        return this.$utils.getInstanceIpPort(data);
      };
    }
  },
  watch: {
    instanceList: {
      handler(val) {
        if (!this.$utils.isSame(val, this.module.instanceList)) {
          this.$emit('updateInstanceList', this.$utils.deepClone(this.instanceList));
        }
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
::v-deep .tscard-container {
  .tscard-body {
    min-height: 24px;
  }
}
.instance-item{
  width: 100%;
  position: relative;
  padding: 4px 10px;
  border: 1px solid;
  text-align: center;
  border-radius: 4px;
  .remove {
    position: absolute;
    right: 0px;
    top: 0px;
    width: 16px;
    height: 16px;
    line-height: 16px;
    display: none;
    cursor: pointer;
  }
  &:hover{
    .remove {
      display: block;
    }
  }
}
</style>
