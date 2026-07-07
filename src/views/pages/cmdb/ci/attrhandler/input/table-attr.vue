<template>
  <div>
    <div v-if="!(tbodyList.length > 0 && !attrData.config.isMultiple)">
      <a
        v-if="!attrData.config.mode || attrData.config.mode === 'r' || attrData.config.mode === 'rw'"
        :class="disabled ? 'text-disabled' : ''"
        href="javascript:void(0)"
        @click="selectCiEntity()"
      >
        <i class="tsfont-check"></i>
        {{ $t('page.choose') }}
      </a>
      <a
        v-if="allowBatchAdd && (attrData.config.mode === 'w' || attrData.config.mode === 'rw')"
        :class="disabled ? 'text-disabled' : ''"
        href="javascript:void(0)"
        @click="addCiEntity()"
      >
        <i class="tsfont-plus"></i>
        {{ $t('page.add') }}
      </a>
    </div>
    <div v-if="theadList.length > 0 && tbodyList.length > 0">
      <TsTable :theadList="theadList" :tbodyList="tbodyList" :fixedHeader="false">
        <template slot="_type" slot-scope="{ row }">
          <Tag v-if="!row.id" color="success" type="border">{{ $t('term.cmdb.newcientity') }}</Tag>
        </template>
        <template v-for="(head, index) in attrList" :slot="head.key" slot-scope="{ row }">
          <div v-if="head.key.indexOf('attr_') == 0 && row.attrEntityData" :key="index">
            <div v-if="row.attrEntityData[head.key]">
              <AttrViewer :handler="row.attrEntityData[head.key].type" :ciEntity="row" :attrEntity="row.attrEntityData[head.key]"></AttrViewer>
            </div>
          </div>
          <div v-else-if="row.relEntityData[head.key] && row.relEntityData[head.key]['valueList']" :key="'e' + index">
            <a
              v-for="(relentity, rindex) in row.relEntityData[head.key]['valueList']"
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
              <!--
                旧的cmdb表单组件将会下线，此功能先注释
                <li
                v-if="row.uuid"
                :class="disabled?'text-disabled':''"
                class="tsfont-edittext"
                @click="editCiEntity(row.uuid)"
              >编辑</li>-->
              <li class="tsfont-trash-o" :class="disabled ? 'text-disabled' : ''" @click="deleteCiEntity(row)">{{ $t('page.delete') }}</li>
            </ul>
          </div>
        </template>
      </TsTable>
    </div>
    <CiEntityChoose
      v-if="showSelectCiEntity"
      :ciId="attrData.targetCiId"
      :isMultiple="attrData.config.isMultiple ? true : false"
      @close="showSelectCiEntity = false"
      @confirm="getCheckCiEntity"
    ></CiEntityChoose>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable'), //这里需要保留，为了注入样式
    AttrViewer: () => import('../../../cientity/attr-viewer.vue'),
    CiEntityChoose: () => import('../../../cientity/cientity-choose.vue')
  },
  props: {
    disabled: { type: Boolean, default: false },
    allowBatchAdd: { type: Boolean, default: true },
    attrData: { type: Object },
    valueList: { type: Array },
    attrEntity: { type: Object }
  },
  data() {
    return {
      showSelectCiEntity: false,
      /*
       暂存的选中值，包括选择值和添加值，最后会emit到外面的value中去，数据结构和cientity-list一致
      */
      tmpValueList: [],
      tbodyList: []
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
    valid() {
      //验证数据合法性
      return true;
    }
  },
  filter: {},
  computed: {
    theadList() {
      return [{ key: '_type', title: '' }, ...this.attrList, { key: 'action' }];
    },
    attrList() {
      const theadList = [];
      if (this.attrData.config.attrList) {
        this.attrData.config.attrList.forEach(attr => {
          if (attr.isSelected) {
            theadList.push({ key: 'attr_' + attr.id, title: attr.label });
          }
        });
      }
      return theadList;
    }
  },
  watch: {
    valueList: {
      handler: function(val) {
        if (val && val.length > 0) {
          //排序参照
          const idSortList = [];

          const newCiEntityList = [];
          //添加配置项
          const newCiEntityIdList = [];
          val.forEach(value => {
            if (typeof value === 'object' && !newCiEntityList.some(cientity => (cientity.id && value.id && cientity.id === value.id) || (cientity.uuid && value.uuid && cientity.uuid === value.uuid))) {
              //新添加的配置项
              this.$delete(value, '_selected');
              this.$delete(value, 'isSelected');
              newCiEntityList.push(value);
              if (value.id) {
                idSortList.push({ id: value.id });
              } else if (value.uuid) {
                idSortList.push({ uuid: value.uuid });
              }
            } else if (typeof value === 'number') {
              newCiEntityIdList.push(value);
              idSortList.push({ id: value });
            }
          });
          if (newCiEntityIdList.length > 0) {
            const attrList = [];
            this.attrData.config.attrList.forEach(attr => {
              if (attr.isSelected) {
                attrList.push('attr_' + attr.id);
              }
            });
            const searchParam = {
              ciId: this.attrData.targetCiId,
              idList: newCiEntityIdList,
              showAttrRelList: attrList
            };
            this.$api.cmdb.cientity.searchCiEntity(searchParam).then(res => {
              if (res.Return && res.Return.tbodyList && res.Return.tbodyList.length > 0) {
                this.tbodyList = [...newCiEntityList, ...res.Return.tbodyList];

                // 构建排序Map
                const orderMap = new Map();
                idSortList.forEach((item, idx) => {
                  if (item.id !== undefined) orderMap.set(`id:${item.id}`, idx);
                  if (item.uuid !== undefined) orderMap.set(`uuid:${item.uuid}`, idx);
                });

                // 排序
                this.tbodyList.sort((a, b) => {
                  // 按优先顺序查找对应key
                  const aIdx = orderMap.get(`id:${a.id}`) ?? orderMap.get(`uuid:${a.uuid}`) ?? Infinity;
                  const bIdx = orderMap.get(`id:${b.id}`) ?? orderMap.get(`uuid:${b.uuid}`) ?? Infinity;
                  return aIdx - bIdx;
                });
              }
            });
          } else {
            this.tbodyList = newCiEntityList;
          }
        } else {
          this.tbodyList = [];
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped></style>
