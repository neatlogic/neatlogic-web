<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <div>
          <div class="card-head">
            <div class="block-handler text-grey">{{ $t('page.sort') }}</div>
            <div class="block-name text-grey">{{ $t('term.cmdb.fieldname') }}</div>
            <div class="block-type text-grey">{{ $t('term.cmdb.fieldtype') }}</div>
            <div class="block-showtype text-grey">{{ $t('term.cmdb.displaytype') }}</div>
            <div v-if="!isVirtual" class="block-allowedit text-grey">{{ $t('page.allowedit') }}</div>
          </div>
          <draggable
            v-bind="dragOptions"
            tag="div"
            class="dataSource-ul"
            :list="attrRelList"
            :group="{ name: 'item-sub' }"
            handle=".tsfont-bar"
            :forceFallback="false"
            @start="moveStart"
            @end="moveEnd"
          >
            <div v-for="(item, index) in attrRelList" :key="index" class="card-item">
              <div class="block-handler"><i class="tsfont-bar move"></i></div>
              <div class="block-name">{{ item.itemLabel }}</div>
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
              <div v-if="!isVirtual" class="block-allowedit">
                <TsFormSelect
                  v-if="item.type != 'const'"
                  v-model="item.allowEdit"
                  :dataList="[
                    { value: 1, text: $t('page.yes') },
                    { value: 0, text: $t('page.no') }
                  ]"
                  :width="100"
                  :clearable="false"
                  border="border"
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
  </div>
</template>
<script>
import draggable from 'vuedraggable';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  name: '',
  components: {
    draggable,
    TsFormSelect
  },
  props: {
    ciId: {
      type: Number
    },
    isVirtual: { type: Number }
  },
  data() {
    return {
      dialogConfig: {
        title: this.$t('page.displaysetting'),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: this.isVirtual ? 'small' : 'medium'
      },
      dragOptions: {
        animation: 150,
        scroll: true,
        group: 'description',
        disabled: false,
        ghostClass: 'ghost'
      },
      attrRelList: [],
      showTypeList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getShowTypeList();
    this.getRelAttrList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    moveStart() {},
    moveEnd() {},
    getShowTypeList() {
      this.$api.cmdb.ci.getShowTypeList().then(res => {
        this.showTypeList = res.Return;
      });
    },
    getRelAttrList() {
      if (this.ciId) {
        this.$api.cmdb.ci.getCiViewByCiId(this.ciId).then(res => {
          this.attrRelList = res.Return;
        });
      }
    },
    save() {
      this.$api.cmdb.ci
        .saveCiView({
          ciId: this.ciId,
          ciViewList: this.attrRelList
        })
        .then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        });
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
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
