<template>
  <div class="proflie-setting">
    <div
      v-if="profileList.length"
      class="text-action pt-nm"
      :class="isHideAll?'tsfont-down':'tsfont-up'"
      @click="toggleshowAll()"
    >{{ isHideAll ? $t('page.expandall') : $t('page.putawayall') }}</div>
    <div
      v-for="item in profileList"
      :id="'profile_' + item.profileId"
      :key="item.profileId"
      class="list border-color"
    >
      <div class="top">
        <div class="overflow text-tip">{{ item.profileName }}</div>
        <div class="btn-list">
          <i v-if="canEdit" class="tsfont-edit text-tip-active pr-xs" @click="editProfile(item)"></i>
          <i class="text-tip-active" :class="item.isHide ? 'tsfont-down' : 'tsfont-up'" @click="toggleshow(item)"></i>
        </div>
      </div>
      <div v-show="!item.isHide" class="params-list pt-md">
        <div v-if="item.paramList && item.paramList.length > 0">
          <TsTable
            :theadList="theadList"
            :tbodyList="item.paramList"
            :fixedHeader="false"
          >
            <template slot="name" slot-scope="{row}">
              <div class="flex-start" style="width: 140px;">
                <span>{{ row['name'] }}</span>
                <Poptip
                  v-if="row['description']"
                  trigger="hover"
                  word-wrap
                  width="350"
                  transfer
                  :content="row['description']"
                  style="margin-left: 4px;"
                >
                  <span class="tsfont-info-o text-grey"></span>
                </Poptip>
              </div>
            </template>
            <template slot="inherit" slot-scope="{row}">
              <Checkbox
                v-model="row.inherit"
                :trueValue="1"
                :falseValue="0"
                :disabled="!canEdit"
                @on-change="changeInherit"
              ></Checkbox>
            </template>
            <template slot="defaultValue" slot-scope="{row}">
              <div v-if="row.mappingMode == 'globalparam'">
                {{ row.defaultValue }}
              </div>
              <div v-else class="overflow">
                <Items
                  :is="handleType(row.type)"
                  v-model="row.defaultValue"
                  :config="row.config"
                  :readonly="!!row.inherit || !canEdit"
                  @change="changeParamValue"
                ></Items>
              </div>
            </template>
            <template slot="action" slot-scope="{ row }">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li class="icon tsfont-tool">
                    <Dropdown
                      :visible="isVisible"
                      trigger="click"
                      transfer
                      @on-visible-change="(val)=>{getReferenceList(val, row, item)}"
                    >
                      <span class="text-action">{{ $t('term.deploy.referencequery') }}</span>
                      <DropdownMenu v-if="referenceList.length > 0" slot="list" class="dropdown">
                        <DropdownItem
                          v-for="(r, index) of referenceList"
                          :key="index"
                          @click.native="jumpToItem(r)"
                        >
                          <div class="text-action">{{ r.text }}</div>
                        </DropdownItem>
                      </DropdownMenu>
                      <DropdownMenu v-else slot="list" class="dropdown">
                        <DropdownItem>
                          <div class="text-tip">
                            {{ $t('term.deploy.noparamreference') }}
                          </div>
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </li>
                  <li class="icon tsfont-config" @click.stop="getParamoverrideList(row, item)">{{ $t('term.deploy.upstreamanddownstreamparametervalues') }}</li>
                </ul>
              </div>
            </template>
          </TsTable>
        </div>
      </div>
    </div>
    <ToolProfileEdit
      v-if="isShow"
      :toolProfileId="profileId"
      @close="closeDialog"
    >
    </ToolProfileEdit>
    <TsDialog
      :title="$t('term.deploy.upstreamanddownstreamparametersets')"
      type="modal"
      :isShow.sync="showParams"
      :hasFooter="false"
      :maskClose="true"
      @on-close="showParams == false"
    >
      <template v-slot>
        <TsTable v-bind="paramoverrideTable">
          <template slot="value" slot-scope="{row}">
            <Items
              :is="handleType(row.value.type)"
              v-if="row.value"
              v-model="row.value.defaultValue"
              :config="row.value.config"
              :readonly="true"
            ></Items>
            <div v-else>{{ $t('page.notconfig') }}</div>
          </template>
        </TsTable>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import Items from '@/views/pages/autoexec/components/param/view/index.js';
export default {
  name: '',
  components: {
    ToolProfileEdit: () => import('@/views/pages/autoexec/config/profile/component/tool-profile-edit.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    ...Items
  },
  props: {
    appSystemId: Number, //应用id
    appModuleId: Number, //模块id
    envId: Number, //环境id
    referenceList: Array,
    defaultProfileList: Array,
    canEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      defaultParamoverride: {}, //预设参数初始值
      profileList: [], //预置参数列表
      isShow: false,
      profileId: null,
      theadList: [
        {
          title: this.$t('page.inherit'),
          key: 'inherit',
          width: 50
        },
        {
          title: this.$t('term.autoexec.paramsname'),
          key: 'name',
          width: 140
        },
        {
          title: this.$t('term.autoexec.paramsvalue'),
          key: 'defaultValue'
        },
        {
          key: 'action'
        }
      ],
      showParams: false,
      paramoverrideTable: {
        theadList: [
          {
            title: this.$t('page.path'),
            key: 'text'
          },
          {
            title: this.$t('term.autoexec.paramsvalue'),
            key: 'value'
          }
        ],
        tbodyList: []
      },
      isVisible: false,
      isHideAll: true
    };
  },
  beforeCreate() {},
  created() {
    this.profileList.forEach((item) => {
      this.$set(item, 'isHide', this.isHideAll);
    });
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
    initParamList(list) {
      this.initParamoverride = {};
      list && list.forEach((item) => {
        this.$set(this.defaultParamoverride, 'profileId', item.paramList);
      });
    },
    closeDialog(needRefresh) {
      this.isShow = false;
      if (needRefresh) {
        this.getProfileList(this.profileId);
      }
    },
    editProfile(item) {
      this.profileId = item.profileId;
      this.isShow = true;
    },
    toggleshow(item) {
      if (item.isHide) {
        this.$set(item, 'isHide', false);
      } else {
        this.$set(item, 'isHide', true);
      }
      let isAnyExpand = this.profileList.some(item => !item.isHide);
      this.isHideAll = !isAnyExpand;
    },
    getReferenceList(val, row, item) {
      if (!val) {
        return;
      }
      let data = {
        profileId: item.profileId,
        key: row.key
      };
      this.$emit('getReferenceList', data);
    },
    getParamoverrideList(row, item) {
      let data = {
        appSystemId: this.appSystemId,
        profileId: item.profileId,
        key: row.key
      };
      if (this.appModuleId) { //模块层
        this.$set(data, 'appModuleId', this.appModuleId);
      }
      if (this.envId) { //环境层
        this.$set(data, 'envId', this.envId);
      }
      this.$set(this.paramoverrideTable, 'loading', true);
      this.showParams = true;
      this.$api.deploy.apppipeline.getParamoverrideList(data).then((res) => {
        if (res.Status == 'OK') {
          this.$set(this.paramoverrideTable, 'tbodyList', res.Return.tbodyList || []);
        }
      }).finally(() => {
        this.$set(this.paramoverrideTable, 'loading', false);
      });
    },
    changeInherit() {
      this.$emit('saveOverrideProfileList', this.profileList);
    },
    changeParamValue() {
      this.$emit('saveOverrideProfileList', this.profileList);
    },
    jumpToItem(item) {
      this.$emit('jumpToItem', item);
    },
    getProfileList(id) { //预置参数更新
      let data = {
        appSystemId: this.appSystemId,
        defaultValue: [id]
      };
      this.$api.deploy.apppipeline.getAppProfileList(data).then((res) => {
        if (res.Status == 'OK') {
          let profileConfig = res.Return[0];
          this.profileList.forEach(item => {
            if (item.profileId == profileConfig.profileId) {
              let paramList = [];
              profileConfig.paramList.forEach(p => {
                let paramConfig = item.paramList.find(s => s.key == p.key);
                if (paramConfig) {
                  if (!paramConfig.inherit) {
                    this.$set(p, 'inherit', 0);
                    this.$set(p, 'defaultValue', paramConfig.defaultValue);
                  }
                  paramList.push(p);
                } else {
                  paramList.push(p);
                }
              });
              this.$set(item, 'paramList', paramList);
            }
          });
          this.$emit('saveOverrideProfileList', this.profileList);
        }
      });
    },
    toggleshowAll() {
      this.isHideAll = !this.isHideAll;
      this.profileList.forEach((item) => {
        this.$set(item, 'isHide', this.isHideAll);
      });
    }
  },
  filter: {},
  computed: {
    handleType() {
      return (value) => {
        let type = value + 'Handler';
        type = Items[type] ? type : 'defaultInput';
        return type;
      };
    }
  },
  watch: {
    defaultProfileList: {
      handler(val) {
        if (val) {
          if (!this.$utils.isSame(val, this.profileList)) {
            this.profileList = this.$utils.deepClone(val);
          }
        } else {
          this.profileList = [];
        }
        this.initParamList(val);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.proflie-setting {
   padding: 0 16px;
  .list {
    padding: 16px 0;
    &:hover {
      .btn-list {
        display: block;
      }
    }
    &:not(:last-child) {
      border-bottom: 1px solid;
    }
    .top {
      position: relative;
      padding-right: 40px;
    }
    .btn-list {
      position: absolute;
      right: 0;
      top: 0;
      display: none;
    }
    .params-text {
      &:not(:last-child) {
        margin-bottom: 12px;
      }
    }
  }
}
</style>
