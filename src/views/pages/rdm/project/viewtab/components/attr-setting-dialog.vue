<template>
  <TsDialog v-bind="dialogConfig">
    <template v-slot>
      <div>
        <div class="card-head">
          <div class="block-handler text-grey">{{ $t('page.sort') }}</div>
          <div class="block-name text-grey">{{ $t('term.cmdb.fieldname') }}</div>
          <div class="block-type text-grey">{{ $t('term.cmdb.fieldtype') }}</div>
          <div class="block-showtype text-grey">{{ $t('term.cmdb.displaytype') }}</div>
        </div>
        <draggable
          v-bind="dragOptions"
          tag="div"
          class="dataSource-ul"
          :list="attrList"
          :group="{ name: 'item-sub' }"
          handle=".ts-bars"
          :forceFallback="false"
        >
          <div v-for="(item, index) in attrList" :key="index" class="card-item">
            <div class="block-handler"><i class="ts-bars move"></i></div>
            <div class="block-name">{{ item.label }}</div>
            <div class="block-type">{{ item.typeText }}</div>
            <div class="block-showtype">
              <TsFormSelect
                v-model="item.showType"
                :dataList="showTypeList"
                :width="100"
                border="border"
                :clearable="false"
                :transfer="true"
              ></TsFormSelect>
            </div>
          </div>
        </draggable>
      </div>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.cancel') }}</Button>
      <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
import draggable from 'vuedraggable';
export default {
  name: '',
  components: {
    draggable,
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  props: { projectId: { type: Number }, appId: { type: Number } },
  data() {
    return {
      showTypeList: [],
      dialogConfig: {
        type: 'modal',
        title: this.$t('term.rdm.attributesetting'),
        width: 'medium',
        maskClose: false,
        isShow: true
      },
      dragOptions: {
        animation: 150,
        scroll: true,
        group: 'description',
        disabled: false,
        ghostClass: 'ghost'
      },
      attrList: [] //对象属性列表，此处会返回所有属性，包括未激活属性
    };
  },
  beforeCreate() {},
  created() {
    this.getShowTypeList();
    this.searchAppAttr();
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
    getShowTypeList() {
      this.$api.common.getSelectList({enumClass: 'neatlogic.framework.rdm.enums.ShowType'}).then(res => {
        this.showTypeList = res.Return;
      });
    },
    searchAppAttr() {
      this.$api.rdm.app.searchAppAttr({ appId: this.appId }).then(res => {
        this.attrList = res.Return;
      });
    },
    updateAttrList(event, val) {
      this.attrList = val;
      const idList = [];
      this.attrList.forEach(element => {
        idList.push(element.id);
      });
      this.$api.rdm.project.updateAttrSort({idList: idList, appId: this.appId});
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    save() {
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.card-head {
  position: relative;
  height: 30px;
  .block-handler {
    position: absolute;
    left: 10px;
    line-height: 30px;
  }
  .block-name {
    position: absolute;
    left: 60px;
    top: 0px;
    line-height: 30px;
  }
  .block-type {
    position: absolute;
    left: 250px;
    top: 0px;
    line-height: 30px;
  }
  .block-showtype {
    position: absolute;
    left: 400px;
    top: 0px;
    line-height: 30px;
  }
  .block-allowedit {
    position: absolute;
    left: 550px;
    top: 0px;
    line-height: 30px;
  }
}
.card-item {
  margin-bottom: 10px;
  position: relative;
  height: 30px;
  .block-handler {
    position: absolute;
    left: 10px;
    line-height: 30px;
    cursor: move;
  }
  .block-name {
    position: absolute;
    left: 60px;
    top: 0px;
    line-height: 30px;
  }
  .block-type {
    position: absolute;
    left: 250px;
    top: 0px;
    line-height: 30px;
  }
  .block-showtype {
    position: absolute;
    left: 400px;
    top: 0px;
  }
  .block-allowedit {
    position: absolute;
    left: 550px;
    top: 0px;
  }
}
</style>

