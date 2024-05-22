<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        <div v-if="interfaceItemData.id">{{ $t('term.pbc.editdata') }}</div>
        <div v-if="!interfaceItemData.id">{{ $t('term.pbc.adddata') }}</div>
      </template>
      <template v-slot>
        <div class="form-main">
          <div v-for="(prop, index) in propertyList" :key="index" :class="prop.complexId ? 'form-item-row' : 'form-item'">
            <div class="form-title text-grey">
              <span v-if="prop.complexId">
                <i class="tsfont-plus text-href" @click="addSubItem(prop.complexId)"></i>
                {{ prop.complexName }}
              </span>
              <span v-else>
                <Poptip
                  v-if="interfaceItemData.error && interfaceItemData.error[prop.id]"
                  :transfer="true"
                  trigger="hover"
                  :title="$t('page.exception')"
                  class="error"
                  word-wrap
                  width="400"
                  :content="interfaceItemData.error[prop.id]"
                >
                  <i class="text-error tsfont-warning-s"></i>
                </Poptip>
                <i v-if="prop.restraint == 'M'" class="text-error">*</i>
                {{ prop.name }}
              </span>
            </div>
            <div class="form-content">
              <div v-if="prop.complexId" class="tstable-container tstable-normal border tstable-no-fixedHeader radius-lg">
                <div class="tstable-main bg-op">
                  <table class="table-main tstable-body">
                    <thead>
                      <tr>
                        <th></th>
                        <th v-for="(subprop, pindex) in prop.subPropertyList" :key="pindex" nowrap>
                          <i v-if="subprop.restraint == 'M'" class="text-error">*</i>
                          {{ subprop.name }}
                        </th>
                      </tr>
                    </thead>
                    <tbody v-if="interfaceItemData.data[prop.complexId] && interfaceItemData.data[prop.complexId].length > 0" class="tbody-main">
                      <tr v-for="(data, dindex) in interfaceItemData.data[prop.complexId]" :key="dindex">
                        <td><i class="tsfont-minus text-href" @click="removeSubItem(prop.complexId, dindex)"></i></td>
                        <td
                          v-for="(subprop, pindex) in prop.subPropertyList"
                          :key="pindex"
                          style="position:relative"
                          nowrap
                        >
                          <Poptip
                            v-if="interfaceItemData.error && interfaceItemData.error[prop.complexId] && interfaceItemData.error[prop.complexId][dindex.toString()] && interfaceItemData.error[prop.complexId][dindex.toString()] && interfaceItemData.error[prop.complexId][dindex.toString()][subprop.id]"
                            style="position:absolute;top:0px;right:0px"
                            :transfer="true"
                            trigger="hover"
                            :title="$t('page.exception')"
                            class="error"
                            word-wrap
                            width="400"
                            :content="interfaceItemData.error[prop.complexId][dindex.toString()][subprop.id]"
                          >
                            <i class="text-error tsfont-warning-s"></i>
                          </Poptip>
                          <PropertyHandler
                            ref="propertyHandler"
                            :index="dindex"
                            :value="data[subprop.id]"
                            :property="subprop"
                            @setData="setData"
                          ></PropertyHandler>
                        </td>
                      </tr>
                    </tbody>
                    <tbody v-else class="tbody-main">
                      <tr>
                        <td :colspan="prop.subPropertyList.length + 1">
                          <span class="tsfont-plus text-href" @click="addSubItem(prop.complexId)">{{ $t('term.pbc.adddataitem') }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div v-else>
                <PropertyHandler
                  ref="propertyHandler"
                  :value="interfaceItemData.data[prop.id]"
                  :property="prop"
                  @setData="setData"
                ></PropertyHandler>
              </div>
            </div>
          </div>
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
export default {
  name: '',
  components: {
    PropertyHandler: () => import('../property/property-handler.vue')
  },
  props: {
    interfaceId: { type: String },
    interfaceItemId: { type: Number },
    corporationId: { type: Number }
  },
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'large'
      },
      interfaceItemData: {
        corporationId: this.corporationId,
        interfaceId: this.interfaceId,
        data: {}
      },
      propertyList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getProperty();
    this.getInterfaceItemById();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    addSubItem(complexId) {
      if (!this.interfaceItemData.data[complexId]) {
        this.$set(this.interfaceItemData.data, complexId, []);
      }
      this.interfaceItemData.data[complexId].push({});
    },
    removeSubItem(complexId, index) {
      this.$delete(this.interfaceItemData.data[complexId], index);
    },
    getInterfaceItemById() {
      if (this.interfaceItemId) {
        this.$api.pbc.interfaceitem.getInterfaceItemById(this.interfaceItemId).then(res => {
          this.interfaceItemData = res.Return;
        });
      }
    },
    getProperty() {
      this.$api.pbc.property.getPropertyByInterfaceId(this.interfaceId).then(res => {
        this.propertyList = res.Return;
      });
    },
    setData(property, index, value) {
      if (typeof index == 'undefined') {
        this.$set(this.interfaceItemData.data, property.id, value);
      } else {
        this.$set(this.interfaceItemData.data[property.complexId][index], property.id, value);
      }
    },
    save() {
      const handlers = this.$refs['propertyHandler'];
      let isValid = true;
      if (handlers) {
        for (let i = 0; i < handlers.length; i++) {
          if (!handlers[i].valid()) {
            isValid = false;
          }
        }
      }
      //console.log(JSON.stringify(this.interfaceItemData.data, null, 2));
      if (isValid) {
        this.$api.pbc.interfaceitem.saveInterfaceItem(this.interfaceItemData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        });
      }
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
.error {
  opacity: 0.5;
  cursor: pointer;
}
.table {
  width: 100%;
  border-collapse: collapse;
  td,
  th {
    border: 1px solid @default-border;
    padding: @space-xs;
  }
}
.form-main {
  display: grid;
  grid-template-columns: 50% 50%;
  grid-gap: 10px;
  .form-item-row {
    display: grid;
    grid-gap: 10px;
    grid-column-start: 1;
    grid-column-end: 3;
    grid-template-columns: 150px 1fr;
    .form-content {
      padding: 3px;
      overflow: auto;
    }
  }
  .form-item {
    display: grid;
    grid-gap: 10px;
    grid-template-columns: 150px 1fr;
    .form-content {
      padding: 3px;
    }
    .form-content .content {
      word-break: break-all;
    }
  }
  .form-title {
    text-align: left;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding: 3px;
  }
}
</style>
