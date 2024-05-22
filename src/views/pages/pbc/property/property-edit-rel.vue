<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <div v-if="propertyRelData.tbodyList.length == 0" style="text-align:center">
          <a href="javascript:void(0)" @click="addRel()">{{ $t('term.pbc.addrelation') }}</a>
        </div>
        <div v-else>
          <TsTable
            v-if="propertyRelData"
            v-bind="propertyRelData"
          >
            <template v-slot:toInterfaceId="{ row }">
              <TsFormSelect
                :ref="'sltToInterfaceId'+row.index"
                v-model="row.toInterfaceId"
                :validateList="[{name:'required',message:' '}]"
                v-bind="selectConfig"
              ></TsFormSelect>
            </template>
            <template v-slot:toValuePropertyId="{ row }">
              <TsFormSelect
                :ref="'sltToValuePropertyId'+row.index"
                v-model="row.toValuePropertyId"
                :validateList="[{name:'required',message:' '}]"
                v-bind="selectPropertyConfig(row.toInterfaceId)"
              ></TsFormSelect>
            </template>
            <template v-slot:toTextPropertyId="{ row }">
              <TsFormSelect
                :ref="'sltToTextPropertyId'+row.index"
                v-model="row.toTextPropertyId"
                :validateList="[{name:'required',message:' '}]"
                v-bind="selectPropertyConfig(row.toInterfaceId)"
              ></TsFormSelect>
            </template>
            <template v-slot:btn="{ row }">
              <a
                class="tsfont-minus"
                href="javascript:void(0)"
                @click="removeRel(row)"
              ></a>
              <a
                v-if="row.index == propertyRelData.tbodyList.length - 1"
                class="tsfont-plus"
                href="javascript:void(0)"
                @click="addRel()"
              ></a>
            </template>
          </TsTable>
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
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: { uid: {type: Number}},
  data() {
    return {
      formConfig: [{
        type: 'slot',
        name: 'config',
        hideLabel: true
      }],
      dialogConfig: {
        type: 'modal',
        title: this.$t('term.pbc.editrelation'),
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      selectConfig: {
        dynamicUrl: '/api/rest/pbc/interface/search',
        rootName: 'tbodyList',
        valueName: 'id',
        textName: 'name',
        transfer: true
      },
      theadList: Object.freeze([
        { title: this.$t('page.interface'), key: 'toInterfaceId', width: '33%' },
        { title: this.$t('term.pbc.valueproperty'), key: 'toValuePropertyId', width: '33%' },
        {title: this.$t('term.cmdb.nameattribute'), key: 'toTextPropertyId', width: '33%'}
      ]),
      propertyRelData: {
        theadList: [
          {key: 'toInterfaceId', title: this.$t('page.interface')},
          {key: 'toValuePropertyId', title: this.$t('term.pbc.valueproperty')},
          {key: 'toTextPropertyId', title: this.$t('term.cmdb.nameattribute')},
          {key: 'btn'}
        ],
        tbodyList: [{}]
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getPropertyRelByPropertyUid();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getPropertyRelByPropertyUid() {
      if (this.uid) {
        this.$api.pbc.property.getPropertyRelByPropertyUid(this.uid).then(res => {
          if (res.Return && res.Return.length > 0) {
            this.$set(this.propertyRelData, 'tbodyList', []);
            res.Return.forEach((element, index) => {
              element.index = index;
              this.propertyRelData.tbodyList.push(element);
            });
          } else {
            this.$set(this.propertyRelData, 'tbodyList', [{index: 0}]);
          }
        });
      }
    },
    save() {
      let isValid = true;
      this.propertyRelData.tbodyList.forEach(element => {
        const sltToInterfaceId = this.$refs['sltToInterfaceId' + element.index];
        const sltToValuePropertyId = this.$refs['sltToValuePropertyId' + element.index];
        const sltToTextPropertyId = this.$refs['sltToTextPropertyId' + element.index];

        if (!sltToInterfaceId.valid()) {
          isValid = false;
        }
        if (!sltToValuePropertyId.valid()) {
          isValid = false;
        }
        if (!sltToTextPropertyId.valid()) {
          isValid = false;
        }
      });
      if (isValid) {
        this.$api.pbc.property.savePropertyRel({uid: this.uid, relList: this.propertyRelData.tbodyList}).then(res => {
          if (res.Status == 'OK') {
            this.close(true);
            this.$Message.success(this.$t('message.savesuccess'));
          }
        });
      }
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    addRel() {
      this.propertyRelData.tbodyList.push({index: this.propertyRelData.tbodyList.length});
    },
    removeRel(row) {
      const index = this.propertyRelData.tbodyList.findIndex(d => d.index == row.index);
      if (index > -1) {
        this.propertyRelData.tbodyList.splice(index, 1);
      }
      this.propertyRelData.tbodyList.forEach((d, index) => {
        this.$set(d, 'index', index);
      });
    }
  },
  filter: {},
  computed: {
    selectPropertyConfig() {
      return (interfaceId) => {
        if (interfaceId) {
          return {
            dynamicUrl: '/api/rest/pbc/interface/property/get',
            params: {'interfaceId': interfaceId},
            valueName: 'id',
            textName: 'name',
            transfer: true
          };
        } else {
          return {
            dynamicUrl: '/api/rest/pbc/interface/property/get',
            params: {'interfaceId': '_blank'}, //提供一个不存在的Interface，让后端返回空数组
            valueName: 'id',
            textName: 'name',
            transfer: true
          };
        }
      };
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
