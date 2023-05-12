<template>
  <div>
    <div v-if="!(ciEntityData.tbodyList.length > 0 && !attrData.config.isMultiple)">
      <a
        v-if="!attrData.config.mode || attrData.config.mode === 'r' || attrData.config.mode === 'rw'"
        :class="disabled?'text-disabled':''"
        href="javascript:void(0)"
        @click="selectCiEntity()"
      ><i class="tsfont-check"></i>选择</a>
      <a
        v-if="allowBatchAdd && (attrData.config.mode === 'w' || attrData.config.mode === 'rw')"
        :class="disabled?'text-disabled':''"
        href="javascript:void(0)"
        @click="addCiEntity()"
      ><i class="tsfont-plus"></i>添加</a>
    </div>
    <div v-if="ciEntityData && ciEntityData.tbodyList && ciEntityData.tbodyList.length > 0">
      <TsTable
        v-if="ciEntityData"
        v-bind="ciEntityData"
        :fixedHeader="false"
      >
        <template slot="_type" slot-scope="{ row }">
          <Tag v-if="!row.id" color="success" type="border">新的配置项</Tag>
        </template>
        <template v-for="(head, index) in finalHeaderList" :slot="head.key" slot-scope="{ row }">
          <div v-if="head.key.indexOf('attr_') == 0 && row.attrEntityData" :key="index">
            <div v-if="row.attrEntityData[head.key]">
              <AttrViewer :handler="row.attrEntityData[head.key].type" :ciEntity="row" :attrEntity="row.attrEntityData[head.key]"></AttrViewer>
            </div>
          </div>
          <div v-else-if="row.relEntityData[head.key] && row.relEntityData[head.key]['valueList']" :key="index">
            <a
              v-for="(relentity,rindex) in row.relEntityData[head.key]['valueList']"
              :key="rindex"
              class="modal-tag href"
              href="javascript:void(0)"
              @click="toCiEntity(relentity.ciEntityId, relentity.ciId)"
            >
              <span>{{ relentity.ciEntityName }}</span>
            </a>
          </div>
        </template>
        <template slot="action" slot-scope="{ row }">
          <div class="tstable-action">
            <ul class="tstable-action-ul">
              <li
                v-if="row.uuid"
                :class="disabled?'text-disabled':''"
                class="tsfont-edittext"
                @click="editCiEntity(row.uuid)"
              >编辑</li>
              <li class="tsfont-close-o" :class="disabled?'text-disabled':''" @click="deleteCiEntity(row)">删除</li>
            </ul>
          </div>
        </template>
      </TsTable>
    </div>
    <CiEntityChoose
      v-if="showSelectCiEntity"
      :ciId="attrData.targetCiId"
      :isMultiple="attrData.config.isMultiple?true:false"
      @close="showSelectCiEntity=false"
      @confirm="getCheckCiEntity"
    ></CiEntityChoose>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve), //这里需要保留，为了注入样式
    AttrViewer: resolve => require(['../../../cientity/attr-viewer.vue'], resolve),
    CiEntityChoose: resolve => require(['../../../cientity/cientity-choose.vue'], resolve)
  },
  props: {
    disabled: {type: Boolean, default: false},
    allowBatchAdd: {type: Boolean, default: true},
    attrData: {type: Object},
    valueList: {type: Array},
    attrEntity: {type: Object}
  },
  data() {
    return {
      showSelectCiEntity: false,
      /*
       暂存的选中值，包括选择值和添加值，最后会emit到外面的value中去，数据结构和cientity-list一致
      */
      tmpValueList: [],
      ciEntityData: {theadList: [], tbodyList: []}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.formatCiEntityData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    formatCiEntityData() {
      if (this.attrData.config.attrList) {
        const theadList = [{key: '_type', title: ''}];
        this.attrData.config.attrList.forEach(attr => {
          theadList.push({key: 'attr_' + attr.id, title: attr.label});
        });
        //增加一列操作列，可以删除配置项
        theadList.push({key: 'action'});
        this.ciEntityData.theadList = theadList;
      }
    },
    selectCiEntity() {
      if (!this.disabled) {
        this.showSelectCiEntity = true;
      }
    },
    addCiEntity() {
      if (!this.disabled) {
        this.$emit('new');
      }
    },
    editCiEntity(uuid) {
      if (!this.disabled) {
        this.$emit('edit', uuid);
      }
    },
    deleteCiEntity(item) {
      if (!this.disabled) {
        this.$emit('delete', item);
      }
    },
    getCheckCiEntity(ciEntityList) {
      if (ciEntityList && ciEntityList.length > 0) {
        ciEntityList.forEach(cientity => {
          this.$emit('select', cientity);
        });
      }
    },
    removeData(d) {
      let index = null;
      for (let i = 0; i < this.dataList.length; i++) {
        if (this.dataList[i] == d) {
          index = i;
          break;
        }
      }
      this.dataList.splice(index, 1);
    },
    valid() { //验证数据合法性
      return true;
    }
  },
  filter: {},
  computed: {
    finalHeaderList: function() {
      let finalList = [];
      if (this.ciEntityData && this.ciEntityData.theadList && this.ciEntityData.theadList.length > 0) {
        this.ciEntityData.theadList.forEach(element => {
          if (element.key.indexOf('attr_') == 0 || element.key.indexOf('relto_') == 0 || element.key.indexOf('relfrom_') == 0) {
            finalList.push(element);
          }
        });
      }
      return finalList;
    }
  },
  watch: {
    valueList: {
      handler: function(val) {
        if (val && val.length > 0) {
          //添加配置项
          const newCiEntityIdList = [];
          val.forEach(value => {
            if (this.ciEntityData.tbodyList.length == 0 || !this.ciEntityData.tbodyList.some(cientity => (cientity.id && value.id && cientity.id === value.id) || (cientity.uuid && value.uuid && cientity.uuid === value.uuid))) {
              if (typeof value == 'object') { //新添加的配置项
                this.ciEntityData.tbodyList.push(value);
              } else if (typeof value == 'string' || typeof value == 'number') {
                newCiEntityIdList.push(value);
              }
            }
          });
          if (newCiEntityIdList.length) {
            this.$api.cmdb.cientity.getCiEntityByIdList(this.attrData.targetCiId, newCiEntityIdList).then(res => {
              if (res.Return && res.Return.length > 0) {
                res.Return.forEach(item => {
                  this.ciEntityData.tbodyList.push(item);
                });
              }
            });
          }
          //删除配置项
          this.ciEntityData.tbodyList = this.ciEntityData.tbodyList.filter(cientity => { return val.some(value => { return (cientity.id && value.id && cientity.id === value.id) || (cientity.uuid && value.uuid && cientity.uuid === value.uuid); }); });
        } else {
          this.ciEntityData.tbodyList = [];
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
</style>
