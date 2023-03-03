<template>
  <div>
    <TsForm ref="form" :item-list="formConfig" labelPosition="top">
      <template v-slot:type>
        <ButtonGroup>
          <Button
            v-for="(object, index) in objectList"
            :key="index"
            :type="buttonType(object.id)"
            @click="currentObjectId = object.id"
          >{{ object.name }}</Button>
        </ButtonGroup>
      </template>
      <template v-slot:attrList>
        <div>
          <div><a class="tsfont-plus" @click="addAttr">自定义属性</a></div>
          <TsTable
            v-if="objectAttrData[currentObjectId] && objectAttrData[currentObjectId].length > 0"
            :fixedHeader="false"
            :canDrag="true"
            keyName="id"
            :theadList="theadList"
            :tbodyList="objectAttrData[currentObjectId]"
            @updateRowSort="updateAttrList"
          >
            <template v-slot:isActive="{ row }">
              <TsFormSwitch
                v-model="row.isActive"
                :trueValue="1"
                :falseValue="0"
                @on-change="val=>{
                  changeAttrActive(row);
                }"
              ></TsFormSwitch>
            </template>
            <template v-slot:isRequired="{ row }">
              <span v-if="row.isRequired" class="text-success">是</span>
              <span v-if="!row.isRequired" class="text-grey">否</span>
            </template>
            <template v-slot:isPrivate="{ row }">
              <span v-if="row.isPrivate" class="text-success">是</span>
              <span v-if="!row.isPrivate" class="text-grey">否</span>
            </template>
            <template v-slot:action="{ row }">
              <div v-if="!row.isPrivate" class="tstable-action">
                <ul class="tstable-action-ul">
                  <li class="tsfont-edit" @click="editAttr(row)">编辑</li>
                  <li class="tsfont-trash-o" @click="deleteAttr(row)">删除</li>
                </ul>
              </div>
            </template>
          </TsTable>
        </div>
      </template>
    </TsForm>
    <!--<div style="text-align:right" class="mt-md">
      <Button type="primary" @click="save">保存</Button>
    </div>-->
    <CustomAttrEdit
      v-if="isAttrShow"
      :objectId="currentObjectId"
      :attrId="currentAttrId"
      @close="closeAttr"
    ></CustomAttrEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    CustomAttrEdit: resolve => require(['./customattr-edit-dialog.vue'], resolve)
  },
  props: {
    projectId: { type: Number }
  },
  data() {
    return {
      objectList: [],
      selectedList: [],
      isAttrShow: false,
      currentObjectId: null,
      currentAttrId: null,
      objectAttrData: {}, //对象属性列表，此处会返回所有属性，包括未激活属性
      formConfig: [
        {
          type: 'slot',
          name: 'type',
          label: '对象类型'
        },
        {
          type: 'slot',
          name: 'attrList',
          label: '属性设置'
        }
      ],
      tbodyList: [],
      theadList: [
        {
          key: 'isActive',
          title: '激活'
        },
        { key: 'name', title: '唯一标识' },
        { key: 'label', title: '名称' },
        { key: 'typeText', title: '类型' },
        { key: 'isPrivate', title: '系统属性' },
        { key: 'isRequired', title: '必填' },
        { key: 'description', title: '说明' },
        { key: 'action' }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.getObjectByProjectId();
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
    changeAttrActive(attr) {
      this.$api.rdm.project.updateAttrIsActive(attr.id, attr.isActive).then(res => {
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('message.content.updatesuccess'));
        }
      });
    },
    addAttr() {
      this.currentAttrId = null;
      this.isAttrShow = true;
    },
    deleteAttr(attr) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: '确认删除当前属性？注意：属性删除后该属性的值也会被同时删除，且不能恢复。',
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.rdm.project.deleteAttrById(attr.id).then(res => {
            if (res.Status === 'OK') {
              const index = this.objectAttrData[this.currentObjectId].findIndex(d => d.id === attr.id);
              if (index > -1) {
                this.objectAttrData[this.currentObjectId].splice(index, 1);
              }
              vnode.isShow = false;
              this.$Message.success(this.$t('message.content.deletesuccess'));
            }
          });
        }
      });
    },
    editAttr(attr) {
      this.isAttrShow = true;
      this.currentAttrId = attr.id;
    },
    closeAttr(attrId) {
      this.isAttrShow = false;
      if (attrId) {
        this.getNewAttrById(attrId);
      }
    },
    updateAttrList(event, val) {
      this.objectAttrData[this.currentObjectId] = val;
      const idList = [];
      this.objectAttrData[this.currentObjectId].forEach(element => {
        idList.push(element.id);
      });
      this.$api.rdm.project.updateAttrSort({idList: idList, objectId: this.currentObjectId});
    },
    getNewAttrById(id) {
      this.$api.rdm.project.getAttrById(id).then(res => {
        const attrData = res.Return;
        const index = this.objectAttrData[this.currentObjectId].findIndex(d => d.id === attrData.id);
        if (index > -1) {
          this.$set(this.objectAttrData[this.currentObjectId], index, attrData);
        } else {
          this.objectAttrData[this.currentObjectId].push(attrData);
        }
      });
    },
    searchObjectAttr() {
      if (this.currentObjectId && !this.objectAttrData[this.currentObjectId]) {
        this.$api.rdm.project.searchObjectAttr({ objectId: this.currentObjectId }).then(res => {
          this.$set(this.objectAttrData, this.currentObjectId, res.Return);
        });
      }
    },
    getObjectByProjectId() {
      if (this.projectId) {
        this.$api.rdm.project.getObjectByProjectId(this.projectId).then(res => {
          this.objectList = res.Return;
          //默认选中第一个
          if (this.objectList && this.objectList.length > 0) {
            this.currentObjectId = this.objectList[0].id;
          }
        });
      }
    }
  },
  filter: {},
  computed: {
    buttonType() {
      return objectId => {
        if (objectId === this.currentObjectId) {
          return 'primary';
        } else {
          return null;
        }
      };
    }
  },
  watch: {
    currentObjectId: {
      handler: function(val) {
        if (val) {
          this.searchObjectAttr();
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less"></style>
