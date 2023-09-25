<template>
  <div class="version-log-dialog-wrap">
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <div>
          <Loading
            :loadingShow="loadingShow"
            type="fix"
          ></Loading>
          <div class="mb-nm">
            <TimeSelect
              v-model="startTime"
              style="width: 200px;"
              v-bind="timeSelectConfig"
              @change="() => searchVersionLogList()"
            ></TimeSelect>
            <!-- TODO:暂时注释，勿删
        <div class="action-group">
        <span class="action-item">
          <Button
            v-download="exportFile"
            :loading="donwloadLoading"
            icon="md-cloud-download"
            type="default"
          >{{ $t('page.export') }}</Button> 
        </span>
      </div> -->
          </div>
          <NoData v-if="$utils.isEmpty(versionList)"></NoData>
          <Timeline v-else style="margin-top: 30px;">
            <TimelineItem v-for="(item, index) of versionList" :key="index">
              <span slot="dot" :class="index == isActive ? 'tsfont-check-s text-success' : 'tsfont-circle'"></span>
              <div>
                <div class="bg-op padding ml-nm radius-sm" style="margin-top: -16px;">
                  <div class="flex-between cursor-pointer" @click.stop="searchVersionLogDetail(item, index)">
                    <span>{{ item.text }}</span>
                    <span :class="index == isActive ? 'tsfont-up' : 'tsfont-down'"></span>
                  </div>
                  <Loading
                    v-if="item.loadingShow"
                    :loadingShow="item.loadingShow"
                  ></Loading>
                  <div v-else-if="index == isActive && !$utils.isEmpty(item.value)" class="mt-nm">
                    <template v-for="(valueItem, valueName, valueIndex) in item.value">
                      <div :key="valueIndex">
                        <div v-if="hasdllordml(valueName) && getSqlSentence(valueItem)" class="mb-xs">
                          <li class="text-uppercase mb-xs">
                            <span class="text-danger tsfont-tags"></span>
                            {{ valueName }}</li>
                          <li class="ml-nm">
                            <TsCodemirror
                              :value="getSqlSentence(valueItem)"
                              :isReadOnly="true"
                              codeMode="shell"
                            ></TsCodemirror>
                          </li>
                        </div>
                        <template v-else-if="valueName == 'version'">
                          <div v-for="(versionItem, versionIndex) in item.value[valueName]?.content" :key="versionIndex" class="mb-xs">
                            <li v-if="versionItem.type" class="mb-xs">
                              <span class="text-danger tsfont-tags"></span>
                              {{ versionItem.type }}
                            </li>
                            <li
                              v-for="(detailItem, detailIndex) in versionItem.detail"
                              :key="detailIndex"
                              class="text-grey ml-nm"
                            >{{ detailItem.msg }}</li>
                          </div>
                        </template>
                      </div>
                    </template>
                  </div>
                
                </div>
              </div>
            </TimelineItem>
          </Timeline>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
    TimeSelect: resolve => require(['@/resources/components/TimeSelect/TimeSelect.vue'], resolve),
    TsCodemirror: resolve => require(['@/resources/plugins/TsCodemirror/TsCodemirror'], resolve)
  },
  directives: { download },
  mixins: [],
  props: {
    moduleId: { 
      type: String,
      require: true
    }
  },
  data() {
    return {
      tabValue: '',
      isActive: -1,
      loadingShow: false,
      donwloadLoading: false,
      versionList: [],
      startTime: {},
      timeSelectConfig: {
        border: 'border',
        placement: 'bottom-start',
        transfer: true
      },
      dialogConfig: {
        title: this.$t('term.framework.versionlog'),
        type: 'slider',
        width: 'large',
        isShow: true,
        hasFooter: false
      }
    };
  },
  beforeCreate() {},
  created() {
    this.searchVersionLogList();
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
    searchVersionLogList() {
      this.loadingShow = true;
      this.versionList = [];
      this.isActive = -1;
      if (!this.moduleId) {
        this.loadingShow = false;
        return false;
      }
      this.$api.framework.module.searchVersionLogList({moduleId: this.moduleId, startTime: this.startTime}).then(res => {
        if (res.Status == 'OK') {
          let versionList = res.Return?.versionList || [];
          this.versionList = versionList.filter(item => !!item).map(item => ({ text: item, value: {} }));
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    searchVersionLogDetail(row, index) {
      this.isActive = index == this.isActive ? -1 : index;
      if (this.isActive != -1 && !this.$utils.isEmpty(row)) {
        this.$set(row, 'loadingShow', true);
        this.$api.framework.module.searchVersionLogDetail({moduleId: this.moduleId, date: row.text}).then(res => {
          if (res.Status == 'OK') {
            row.value = res.Return || {};
          }
        }).finally(() => {
          this.$set(row, 'loadingShow', false);
        });
      }
    },
    close() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {
    hasdllordml() {
      return (value) => {
        return ['dll', 'dml'].includes(value);
      };
    },
    getSqlSentence() {
      return (list) => {
        let sqlSentence = '';
        if (list && list instanceof Array && !this.$utils.isEmpty(list)) {
          list.forEach((item) => {
            sqlSentence += `${item}\n`;
          });
        }
        return sqlSentence;
      };
    },
    exportFile() {
      return {
        url: '/api/binary/autoexec/script/version/export',
        method: 'post',
        params: {},
        changeStatus: status => {
          if (status == 'start') {
            this.donwloadLoading = true;
          } else if (status == 'success' || status == 'error') {
            this.donwloadLoading = false;
          }
        }
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
 /deep/ .ivu-timeline-item-head-custom {
    font-size: 22px;
  }
  /deep/ .ivu-timeline-item-head {
    background: transparent;
  }
  /deep/ .ivu-timeline-item-head-custom {
    left: -7px;
  }
  .text-uppercase {
    text-transform: uppercase;
  }
</style>
