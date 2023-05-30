<template>
  
  <TsCard
    v-bind="cardData"
    headerPosition="right"
    @updatePage="updatePage"
    @updateSize="updateSize"
  >
    <template slot="header" slot-scope="{ row }">
      <div v-if="row.canEdit || canDelete" class="action-group">
        <div v-if="row.canEdit" class="action-item text-action ts-plus-o" @click="addMr(row.uuid,row.versionTypeStrategyRelationVo?row.versionTypeStrategyRelationVo.versionStrategyType:null)">创建MR</div>
        <!-- <div class="action-item text-action">
          <label>开/封板</label>
          <i-switch
            v-model="row.isOpen" :true-value="openval.true" :false-value="openval.false" @on-change="val => {changeOpen(val, row);}"
          ></i-switch>
        </div> -->
        <div v-if="canDelete" class="action-item text-action ts-trash" @click="deleteVersion(row.uuid)">删除</div>
      </div>
    </template>
    <template slot-scope="{ row }">
      <div>
        <table class="table" style="table-layout:fixed;">
          <tbody>
            <tr>
              <td>
                <span class="text-success h3">{{ row.name }}</span>
                <Tag v-if="row.versionTypeVo" color="default" class="tag-label">{{ row.versionTypeVo.description }}</Tag>
                <Tag :color="typeColor[row.versionTypeStrategyRelationVo.versionStrategyType]" style="opacity:.7;margin-left:10px">{{ typeTxt[row.versionTypeStrategyRelationVo.versionStrategyType] }}</Tag>
                
              </td>
              <td rowspan="2">
                <div v-if="row.versionTypeStrategyRelationVo">
                  <i class="ts-branch text-tip h3 text-icon mr-10"></i>
                  {{ row.versionTypeStrategyRelationVo.srcBranch }}
                  <i class="ts-long-arrow-right text-tip h2 branch-sep mr-20 ml-20"></i>
                  <i class="ts-branch text-tip h3 text-icon mr-10"></i>
                  {{ row.versionTypeStrategyRelationVo.targetBranch }}
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <Tooltip v-if="showtips(row)" theme="light" max-width="300">
                  <div>{{ setTxt(row,'text') }}</div>
                  <div slot="content">
                    <div>{{ setTxt(row,'tips') }}</div>
                  </div>
                </Tooltip>
                <div v-else>{{ setTxt(row,'text') }}</div>
              </td>
              <td width="300" class="text-right">
                <span>{{ row.fcu }}</span>
                <span class="text-tip ml-10">{{ row.fcd | formatDate }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </TsCard>
</template>

<script>
export default {
  name: '',
  components: {
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve)
  },
  props: {
    versionData: {
      type: Object
    },
    statusList: {
      type: Object
    },
    canDelete: {
      type: Boolean
    }
  },
  data() {
    return {
      openval: {
        true: 1,
        false: 0
      },
      isInit: false,
      cardData: {
        classname: 'version-card',
        classKey: 'isOpen',
        span: 24,
        sm: 24,
        lg: 24,
        xl: 24,
        xxl: 24,
        pageType: 'number',
        cardList: []
      },
      typeTxt: {
        'branch': '按分支合并',
        'issue': '按需求合并'
      },
      typeColor: {
        'branch': 'primary',
        'issue': 'warning'        
      }
    };
  },

  beforeCreate() {},

  created() {},

  beforeMount() {},

  mounted() {
    if (this.versionData) {
      Object.assign(this.cardData, {
        'pageCount': this.versionData.pageCount,
        'rowNum': this.versionData.rowNum,
        'pageSize': this.versionData.pageSize,
        'currentPage': this.versionData.currentPage,
        'cardList': this.versionData.list
      });
    }
  },

  beforeUpdate() {},

  updated() {},

  activated() {},

  deactivated() {},

  beforeDestroy() {},

  destroyed() {},

  methods: {
    updatePage(page) {
      this.$emit('updatePage', page);
    },
    updateSize(size) {
      this.$emit('updateSize', size);
    },
    addMr(uuid) {
      this.$emit('addMr', uuid);
    },
    changeOpen(val, list) {
      let _this = this;
      let listdata = {};
      Object.assign(listdata, {
        uuid: list.uuid,
        isOpen: val
      });
      this.$api.codehub.version.updateOpen(listdata).then(res => {
        if (res && res.Status == 'OK') {
          _this.$Message.success('操作成功');
        } else {
          _this.$set(list, 'isOpen', val ? 0 : 1);
        }
      }).catch(error => {
        _this.$set(list, 'isOpen', val ? 0 : 1);
      });
    },
    deleteVersion(uuid) {
      this.$emit('deleteVersion', uuid);
    }
  },

  filter: {},

  computed: { 
    showtips() {
      return function(config) {
        let isshow = false;
        if ((config.systemVo && config.systemVo.description) || (config.subSystemVo && config.subSystemVo.description)) {
          isshow = true;
        }
        return isshow;
      };
    },
    setTxt() {
      return function(config, type) {
        let text = '';
        let prev = config.systemVo || '';
        let next = config.subSystemVo || '';
        // if (type == 'text') {
        //   text = (prev ? prev.name : '') + (next ? '/' + next.name : '');
        // } else if (type == 'tips') {
        //   text = (prev && prev.description ? prev.description : '') + (next && next.description ? '/' + next.description : '');
        // }
        if (prev) {
          text = prev.name + (prev.description ? ('(' + prev.description + ')') : '');
          if (next) {
            text += ' / ' + next.name + (next.description ? ('(' + next.description + ')') : '');
          }
        }
        return text;
      };
    }
  },

  watch: {
    // versionData: {
    //   hanlder: function(val) {
    //     this.isInit = false;
    //     let _this = this;
    //     if (val) {
    //       Object.assign(_this.cardData, {
    //         'pageCount': val.pageCount,
    //         'rowNum': val.rowNum,
    //         'pageSize': val.pageSize,
    //         'currentPage': val.currentPage,
    //         'cardList': val.list
    //       });
    //       _this.$nextTick(() => {
    //         _this.isInit = true;
    //       });
    //     }
    //   },
    //   deep: true
    // }
  }
};
</script>
<style lang="less" scoped>
.tag-label{
  margin-left: 10px;
  transform: scale(0.9);
}
</style>
