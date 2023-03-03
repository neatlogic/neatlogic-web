<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        <div>属性映射设置</div>
      </template>
      <template v-slot>
        <TsForm v-model="interfaceData" :item-list="formConfig" :labelWidth="60">
          <template v-slot:viewId>
            <TsFormSelect v-model="interfaceData.customViewId" v-bind="viewSelectConfig"></TsFormSelect>
          </template>
          <template v-slot:ciId>
            <TsFormSelect v-model="interfaceData.ciId" v-bind="ciSelectConfig">
              <template v-slot:option="{ item }">
                <div>
                  <span>{{ item.label }}</span>
                  <span class="text-grey">({{ item.name }})</span>
                </div>
              </template>
            </TsFormSelect>
          </template>
          <template v-slot:rule>
            <div v-if="interfaceCorporationList && interfaceCorporationList.length > 0">
              <div v-if="interfaceData.ciId || interfaceData.customViewId">
                <div class="text-grey">帮助：机构只会导入符合自身规则的配置项，如机构不配置规则，则代表该模型所有配置项都会关联该机构。</div>
                <div v-for="interfaceCorporation in interfaceCorporationList" :key="interfaceCorporation.corporationId">
                  <Divider style="font-size:13px;margin:6px 0px" orientation="left">{{ interfaceCorporation.corporationName }}</Divider>
                  <ConditionGroup v-if="interfaceData.priority === 'ci' && interfaceData.ciId" v-model="interfaceCorporation.rule" :ciId="interfaceData.ciId"></ConditionGroup>
                  <CustomviewConditionGroup v-else-if="interfaceData.priority === 'view' && interfaceData.customViewId" v-model="interfaceCorporation.rule" :customViewId="interfaceData.customViewId"></CustomviewConditionGroup>
                </div>
              </div>
              <div v-else class="text-grey">
                请先选择模型或视图
              </div>
            </div>
            <div v-else>
              没有任何机构配置，请先
              <a href="javascript:void(0)" @click="$router.push({ path: '/corporation-manage' })">添加</a>
            </div>
          </template>
          <template v-slot:mapping>
            <div class="tstable-container tstable-normal tstable-allborder tstable-no-fixedHeader radius-lg">
              <div class="table-main bg-op">
                <table class="table-main tstable-body" style="width:100%">
                  <thead>
                    <tr>
                      <th nowrap>属性</th>
                      <th nowrap>值域</th>
                      <th nowrap>约束条件</th>
                      <th nowrap>定义</th>
                      <th nowrap style="width:180px">模型属性</th>
                      <th nowrap>设置</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(prop, index) in propertyList" :key="index">
                      <td>
                        <div v-if="prop.complexId" style="word-break:break-all;white-space:normal" class="text-grey fz10">{{ prop.complexName }}({{ prop.complexId }})</div>
                        <div style="word-break:break-all;;white-space:normal">{{ prop.name }}({{ prop.id }})</div>
                      </td>
                      <td style="word-break:break-all;white-space:normal">{{ prop.valueRange }}</td>
                      <td>
                        <span v-if="prop.restraint == 'M'">必填(M)</span>
                        <span v-else-if="prop.restraint == 'O'">选填(O)</span>
                        <span v-else-if="prop.restraint == 'C'">条件非空(C)</span>
                      </td>
                      <td>
                        <Poptip
                          v-if="prop.description"
                          word-wrap
                          width="400"
                          trigger="hover"
                          :transfer="true"
                        >
                          <i style="cursor:pointer" class="tsfont-message-o"></i>
                          <div slot="content">
                            <Divider v-if="prop.definition" style="margin:3px 0px;font-size:15px" orientation="left">定义</Divider>
                            <div>{{ prop.definition }}</div>
                            <Divider v-if="prop.description" style="margin:3px 0px;font-size:15px" orientation="left">说明</Divider>
                            <div>{{ prop.description }}</div>
                          </div>
                        </Poptip>
                      </td>
                      <td>
                        <TsFormSelect
                          v-if="interfaceData.priority === 'ci'"
                          :transfer="true"
                          :dataList="ciAttrList"
                          textName="label"
                          valueName="id"
                          :value="prop.mapping ? prop.mapping.id : getDefaultValue(prop)"
                          @on-change="
                            (val, valobj, valitem) => {
                              setPropMapping(prop, valitem);
                            }
                          "
                        >
                          <template v-slot:option="{ item }">
                            <div>
                              <span>{{ item.label }}</span>
                              <span class="text-grey">({{ item.name }})</span>
                            </div>
                          </template>
                        </TsFormSelect>
                        <TsFormSelect
                          v-else-if="interfaceData.priority === 'view'"
                          :transfer="true"
                          :dataList="customViewAttrList"
                          textName="label"
                          valueName="name"
                          :value="prop.mapping && prop.mapping.name"
                          @on-change="
                            (val, valobj, valitem) => {
                              setPropMapping(prop, valitem);
                            }
                          "
                        ></TsFormSelect>
                      </td>
                      <td><a :class="prop.propDefaultValue || prop.transferRule ? 'tsfont-edit-s' : 'tsfont-setting'" href="javascript:void(0)" @click="openPropConfigDialog(prop)"></a></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </template>
        </TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="close()">取消</Button>
        <Button type="primary" @click="save()">确定</Button>
      </template>
    </TsDialog>
    <InterfaceMappingConfig v-if="isPropConfigDialogShow" :property="currentProp" @close="closePropConfigDialog"></InterfaceMappingConfig>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    InterfaceMappingConfig: resolve => require(['./interface-mapping-config.vue'], resolve),
    //AttrSearcher: resolve => require(['@/views/pages/cmdb/cientity/attr-searcher.vue'], resolve),
    ConditionGroup: resolve => require(['@/views/pages/cmdb/components/condition/condition-group.vue'], resolve),
    CustomviewConditionGroup: resolve => require(['@/views/pages/cmdb/components/condition/customview-condition-group.vue'], resolve)
  },
  props: {
    interfaceId: { type: String }
  },
  data() {
    return {
      interfaceCorporationList: [],
      formConfig: {
        priority: {
          label: '来源',
          type: 'radio',
          dataList: [
            { value: 'ci', text: '模型' },
            { value: 'view', text: '自定义视图' }
          ],
          onChange: val => {
            if (val === 'ci') {
              this.formConfig.viewId.isHidden = true;
              this.formConfig.ciId.isHidden = false;
            } else if (val === 'view') {
              this.formConfig.viewId.isHidden = false;
              this.formConfig.ciId.isHidden = true;
            }
          }
        },
        viewId: {
          label: '视图',
          type: 'slot'
        },
        ciId: {
          label: '模型',
          type: 'slot'
        },
        rule: {
          label: '规则',
          type: 'slot'
        },
        mapping: {
          label: '映射',
          type: 'slot'
        }
      },
      interfaceData: { priority: 'ci' },
      isPropConfigDialogShow: false,
      currentProp: null,
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'large'
      },
      viewSelectConfig: {
        transfer: true,
        valueName: 'id',
        textName: 'name',
        rootName: 'tbodyList',
        dynamicUrl: '/api/rest/cmdb/customview/public/search',
        onChange: val => {
          this.getCustomViewAttr(val);
        }
      },
      ciSelectConfig: {
        transfer: true,
        valueName: 'id',
        textName: 'label',
        dynamicUrl: '/api/rest/pbc/ci/search',
        onChange: val => {
          this.getCiAttrRelList(val);
        }
      },
      propertyList: [],
      ciAttrList: [], //模型属性列表
      customViewAttrList: [] //自定义视图属性列表
    };
  },
  beforeCreate() {},
  created() {
    this.init();
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
    async init() {
      await this.getInterfaceById();
      await this.getProperty();
      if (this.interfaceData.ciId) {
        await this.getCiAttrRelList(this.interfaceData.ciId);
      }
      if (this.interfaceData.customViewId) {
        await this.getCustomViewAttr(this.interfaceData.customViewId);
      }
      this.getInterfaceCorporation();
    },
    async getInterfaceById() {
      await this.$api.pbc.interfaces.getInterfaceById(this.interfaceId).then(res => {
        this.interfaceData = res.Return;
        if (!this.interfaceData.priority) {
          this.interfaceData.priority = 'ci';
        }
        if (this.interfaceData.priority === 'ci') {
          this.formConfig.viewId.isHidden = true;
          this.formConfig.ciId.isHidden = false;
        } else if (this.interfaceData.priority === 'view') {
          this.formConfig.viewId.isHidden = false;
          this.formConfig.ciId.isHidden = true;
        }
      });
    },
    closePropConfigDialog(prop) {
      if (prop) {
        let p = this.propertyList.find(d => d.uid === prop.uid);
        if (p) {
          this.$set(p, 'propDefaultValue', prop.propDefaultValue);
          this.$set(p, 'transferRule', prop.transferRule);
        }
      }
      this.isPropConfigDialogShow = false;
    },
    openPropConfigDialog(prop) {
      this.currentProp = prop;
      this.isPropConfigDialogShow = true;
    },
    setPropMapping(prop, val) {
      this.$set(prop, 'mapping', {});
      if (val) {
        Object.assign(prop.mapping, val);
      }
    },
    async getProperty() {
      await this.$api.pbc.property.getPropertyByInterfaceId(this.interfaceId).then(res => {
        this.propertyList = [];
        res.Return.forEach(d => {
          if (!d.subPropertyList) {
            this.propertyList.push(d);
          } else {
            d.subPropertyList.forEach(sd => {
              this.propertyList.push(sd);
            });
          }
        });
      });
    },
    async getCustomViewAttr(customViewId) {
      await this.$api.pbc.interfaces.getCustomViewAttrList(customViewId).then(res => {
        this.customViewAttrList = res.Return;
      });
    },
    async getCiAttrRelList(ciId) {
      await this.$api.pbc.interfaces.getCiAttrRelList(ciId).then(res => {
        this.ciAttrList = res.Return;
      });
    },
    getInterfaceCorporation() {
      this.$api.pbc.interfaces.getInterfaceCorporation(this.interfaceId).then(res => {
        this.interfaceCorporationList = res.Return;
      });
    },
    close() {
      this.$emit('close');
    },
    getDefaultValue(prop) {
      /*
      ciAttrList中的数据范例：
      {
        "attrId": 443275471233024,
        "name": "computerRoomGradeUptimeTier->label",
        "id": "attr_443275471233024.481659140759552",
        "label": "机房等级-Uptime TIER等级->名称",
        "targetCiId": 443251714695168,
        "type": "attr",
        "targetAttrId": 481659140759552
      },
      {
        "attrId": 443275756445696,
        "name": "uuid",
        "id": "uuid_443275756445696.443252251566080",
        "label": "数据中心级别->唯一标识",
        "targetCiId": 443252251566080,
        "type": "uuid"
      },
      {
        "attrId": 443275756445696,
        "name": "name",
        "id": "name_443275756445696.443252251566080",
        "label": "数据中心级别->名称",
        "targetCiId": 443252251566080,
        "type": "name"
      }
      */
      //如果是引用属性或关系，默认使用name作为默认属性
      const item = this.ciAttrList.find(d => d.name == prop.id);
      if (item) {
        prop.mapping = item;
        return item.id;
      } else {
        //寻找引用属性或关系,先找到任意一个属性，再定位到name属性
        const tmpItem = this.ciAttrList.find(d => d.name.indexOf(prop.id + '->') == 0);
        if (tmpItem) {
          const item = this.ciAttrList.find(d => d.type == 'name' && d.attrId == tmpItem.attrId);
          if (item) {
            prop.mapping = item;
            return item.id;
          }
        }
      }
      return null;
    },
    save() {
      this.interfaceData.propertyList = this.propertyList;
      this.interfaceData.corporationRuleList = this.interfaceCorporationList;
      this.$api.pbc.interfaces.saveInterfaceMapping(this.interfaceData).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.content.savesuccess'));
          this.close();
        }
      });
    }
  },
  filter: {},
  computed: {
    /* filterCiAttrList() {
      return prop => {
        if (prop.complexId) {
          let targetCiId;
          this.propertyList.forEach(p => {
            if (p.complexId == prop.complexId && p.mapping && p.mapping.targetCiId) {
              targetCiId = p.mapping.targetCiId;
              return false;
            }
          });
          if (targetCiId) {
            return this.ciAttrList.filter(d => d.targetCiId == targetCiId);
          } else {
            return this.ciAttrList;
          }
        } else {
          return this.ciAttrList;
        }
      };
    }*/
  },
  watch: {}
};
</script>
<style lang="less"></style>
