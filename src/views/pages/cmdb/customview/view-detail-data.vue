<template>
  <div>
    <Card
      v-if="filtedAttrList && filtedAttrList.length > 0"
      :bordered="false"
      dis-hover
      class="radius-lg"
    >
      <div slot="title" class="card-top">
        <div class="title text-title">{{ $t('term.cmdb.basicattribute') }}</div>
      </div>
      <div>
        <div class="attr-main">
          <Col
            v-for="(attr, index) in filtedAttrList"
            :key="index"
            class="attr-item"
            :class="attr.needWholeRow ? 'attr-item-row' : ''"
          >
            <div class="attr-title text-grey overflow" :title="attr.label">
              {{ attr.label }}
            </div>
            <div class="attr-content">
              <div class="content">
                <AttrViewer
                  v-if="ciEntityData.attrEntityData && ciEntityData.attrEntityData['attr_' + attr.id]"
                  :mode="'detail'"
                  :handler="ciEntityData.attrEntityData['attr_' + attr.id].type"
                  :ciEntity="ciEntityData"
                  :attrEntity="ciEntityData.attrEntityData['attr_' + attr.id]"
                  :authData="ciEntityData.authData"
                ></AttrViewer>
              </div>
            </div>
          </Col>
        </div>
      </div>
    </Card>
    <div v-if="filtedRefCiList && filtedRefCiList.length > 0">
      <div v-for="(ci, index) in filtedRefCiList" :key="index">
        <div v-if="getDisplayColumnList(ci).length > 0" :bordered="false" dis-hover>
          <Divider plain orientation="start">{{ ci.alias }}</Divider>
          <CiEntityList
            :ciId="ci.ciId"
            :needCondition="false"
            :needAction="false"
            :displayColumnList="getDisplayColumnList(ci)"
            :needPage="false"
            :fixedHeader="false"
            :idList="getCiEntityIdList(ci.ciEntityList)"
          ></CiEntityList>
        </div>
      </div>
    </div>
    <div v-if="!hasData">
      <NoData>{{ $t('page.nodata') }}</NoData>
    </div>
  </div>
</template>
<script>
import AttrViewer from '../cientity/attr-viewer.vue';
import CiEntityList from '../cientity/cientity-list.vue';
export default {
  name: '',
  components: { AttrViewer, CiEntityList },
  props: {
    mode: {
      type: String,
      default: 'all',
      validator(value) {
        //显示模式，all或particular，all:显示所有属性和关系模型属性，particular:只会显示选中且非隐藏属性
        return value == 'all' || value == 'particular';
      }
    }, //显示模式，all
    viewId: { type: Number },
    ciEntityId: { type: Number }
  },
  data() {
    return {
      startCi: null,
      viewData: {},
      attrList: [],
      relList: [],
      refCiList: [],
      attrGroupList: [],
      ciEntityData: {}
    };
  },
  beforeCreate() {},
  created() {
    //this.getCustomViewData();
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
    getCustomViewData() {
      this.$api.cmdb.customview.getCustomViewData(this.viewId, this.ciEntityId).then(res => {
        this.viewData = res.Return;
        if (this.viewData.startCustomViewCiUuid && this.viewData.ciList && this.viewData.ciList.length > 0) {
          this.startCi = this.viewData.ciList.find(ci => ci.uuid === this.viewData.startCustomViewCiUuid);
          const refCiList = this.viewData.ciList.filter(ci => ci.uuid != this.viewData.startCustomViewCiUuid);
          this.refCiList = refCiList;
          if (this.startCi) {
            this.getStartCiAttrList(this.startCi.ciId);
            this.getStartCiEntityById(this.startCi.ciId, this.ciEntityId);
          }
        }
      });
    },
    getStartCiEntityById(ciId, ciEntityId) {
      if (ciId && ciEntityId) {
        this.$api.cmdb.cientity.getCiEntityById(ciId, ciEntityId, true, true, true).then(res => {
          this.ciEntityData = res.Return;
          /*if (this.ciEntityData && this.ciEntityData.attrEntityList && this.ciEntityData.attrEntityList.length > 0) {
            this.ciEntityData.attrEntityList.forEach(element => {
              this.attrEntityData[element.attrId] = element.actualValueList;
            });
          }*/
          //更新当前配置项信息进历史记录
          const prevPath = {
            router: this.$route.path,
            name: this.ciEntityData.name
          };
          sessionStorage.setItem('prevPath', JSON.stringify(prevPath, null, 2));
        });
      }
    },
    getStartCiAttrList(ciId) {
      this.$api.cmdb.ci.getAttrByCiId(ciId, 'detail').then(res => {
        this.attrList = res.Return;
        this.attrGroupList = [];
        if (this.attrList && this.attrList.length > 0) {
          this.attrList.forEach(element => {
            if (element.groupName && !this.attrGroupList.includes(element.groupName)) {
              this.attrGroupList.push(element.groupName);
            }
          });
        }
      });
    },
    getCiEntityIdList(ciEntityList) {
      if (ciEntityList != null && ciEntityList.length > 0) {
        return ciEntityList.map(cientity => cientity.id);
      }
    },
    getDisplayColumnList(ci) {
      if (this.mode === 'particular') {
        const columnList = [];
        if (ci.attrList && ci.attrList.length > 0) {
          ci.attrList.forEach(attr => {
            if (!attr.isHidden) {
              columnList.push('attr_' + attr.attrId);
            }
          });
        }
        return columnList;
      }
      return [];
    }
  },
  filter: {},
  computed: {
    hasData() {
      if (this.filtedAttrList && this.filtedAttrList.length > 0) {
        return true;
      }
      if (this.filtedRefCiList && this.filtedRefCiList.length > 0) {
        for (let i = 0; i < this.filtedRefCiList.length; i++) {
          const ci = this.filtedRefCiList[i];
          if (this.getDisplayColumnList(ci).length > 0) {
            return true;
          }
        }
      }
      return false;
    },
    filtedRefCiList() {
      let filtedRelCiList = [];
      if (this.refCiList && this.refCiList.length > 0) {
        this.refCiList.forEach(ci => {
          if (!ci.isHidden && ci.ciEntityList && ci.ciEntityList.length) {
            filtedRelCiList.push(ci);
          }
        });
      }
      return filtedRelCiList;
    },
    filtedAttrList() {
      let filtedAttrList = [];
      if (this.mode === 'particular') {
        if (this.attrList && this.attrList.length > 0 && this.startCi) {
          this.attrList.forEach(attr => {
            const a = this.startCi.attrList.find(d => d.attrId === attr.id);
            if (a && !a.isHidden) {
              filtedAttrList.push(attr);
            }
          });
        }
      } else {
        filtedAttrList = this.attrList;
      }
      return filtedAttrList;
    }
  },
  watch: {
    viewId: {
      handler: function(val) {
        if (val) {
          this.getCustomViewData();
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scope>
.cientity-label {
  text-align: right;
}
.cientity-item {
  margin-bottom: 10px;
  .label {
    margin-bottom: 4px;
  }
  .content {
    min-height: 20px;
  }
}

.attr-main {
  display: grid;
  grid-template-columns: 50% 50%;
  grid-gap: 10px;
  .attr-item-row {
    grid-column-start: 1;
    grid-column-end: 3;
  }
  .attr-item {
    display: grid;
    grid-gap: 10px;
    grid-template-columns: 120px auto;
    .attr-title {
      text-align: left;
      padding: 3px;
    }
    .attr-content {
      padding: 3px;
    }
    .attr-content .content {
      word-break: break-all;
    }
  }
}
</style>
