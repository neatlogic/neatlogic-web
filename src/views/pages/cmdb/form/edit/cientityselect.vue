<template>
  <div>
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">
        模型<span class="red">*</span>
      </label>
      <div class="formsetting-text">
        <div class="input-border">
          <!-- setting.ciIdList -->
          <TsFormSelect
            ref="entity"
            v-model="setting.ciId"
            v-bind="entityConfig"
            :dataList="entityArray"
            @on-change="changeMatrix()"
          ></TsFormSelect>
        </div>
      </div>
    </div>

    <div v-if="isShow" class="formsetting-block">
      <label class="formsetting-label text-grey">
        操作<span class="red">*</span>
      </label>
      <div class="formsetting-text bg-block">
        <div class=" tstable-container boxAction border-color">
          <Checkbox v-model="setting.actionAdd" class="actionItem">新增</Checkbox>
          <Checkbox v-model="setting.actionEdit" class="actionItem">编辑</Checkbox>
          <Checkbox v-model="setting.actionDel" class="actionItem">删除</Checkbox>
        </div>
        <div class="tstable-container">
          <table class="dynamic-table tstable-body">
            <thead>
              <tr>
                <th class="first-td">属性/关系</th>
                <th><span>显示</span>
                  <span><Poptip
                    trigger="hover"
                    content="如不勾选任何属性则按照模型显示设置中的配置显示相关属性"
                    width="200"
                    transfer
                    word-wrap
                  >
                    <i class="tsfont-info-o text-href" style="padding-left:3px;"></i>
                  </Poptip></span></th>
                <th><span>编辑</span>
                  <span><Poptip
                    trigger="hover"
                    content="如不勾选任何属性则代表所有属性都可以编辑"
                    width="200"
                    transfer
                    word-wrap
                  >
                    <i class="tsfont-info-o text-href" style="padding-left:3px;"></i>
                  </Poptip></span></th>
                <th></th>
              </tr>
            </thead>
            <draggable
              v-if="setting.ciId && setting.dataConfig && setting.dataConfig.length > 0"
              tag="tbody"
              :list="setting.dataConfig"
              handle=".tsfont-bar"
              ghost-class="li-active"
            >
              <tr v-for="(data, index) in setting.dataConfig" :key="index">
                <td class="text-grey first-td">
                  <span class="attrName">{{ data.title }}</span>
                </td>
                <td>
                  <Checkbox v-model="data.isShow"></Checkbox>
                </td>
                <td>
                  <Checkbox v-model="data.isEdit"></Checkbox>
                </td>
                <td><i class="tsfont-bar" title="拖动排序"></i></td>
              </tr>
            </draggable>
          </table>
        </div>
      </div>
    </div>

  </div>
</template>
<script>
import draggable from 'vuedraggable';
import editmixin from '@/resources/components/FormMaker/formedit/edit/components/editmixin.js';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  name: '',
  components: {
    TsFormSelect, draggable
  },
  filters: {},
  mixins: [editmixin],
  props: {

  },
  data() {
    return {
      entityConfig: {
        validateList: ['required'],
        multiple: false,
        clearable: false,
        transfer: true
      },
      isShow: true,
      carouselNumber: 1,
      entityArray: []//下拉枚举
    };
  },
  beforeCreate() {},
  created() {
  },
  beforeMount() {},
  mounted() {
    this.getCilist();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    validComponent() {
      let _this = this;
      let validList = [];
      if (!this.$refs.entity.valid()) {
        validList.push('至少选择一个模型');
      }

      // let newTem = [];

      // this.setting.dataConfig.forEach(v => {
      //   if (v.isShow || v.isEdit) {
      //     newTem.push(v);
      //   }
      // });

      if (!this.setting.actionAdd && !this.setting.actionEdit && !this.setting.actionDel) {
        validList.push('至少要选择一个可操作的字段');
      }
 
      // if (newTem.length == 0) {
      //   validList.push('至少要选择一个可回显或可编辑的字段');
      // }
      
      return validList;
    },
    getCilist() {
      this.$api.cmdb.ci.getCiList({isAllColumn: 1}).then((res) => {
        if (res.Status == 'OK') {
          this.entityArray = res.Return || [];
        }
      });
    },
    changeEdit(data) {
      if (data.isEdit) {
        data.editType = 'select';
      } else {
        data.editType = '';
      }
    },
    async changeMatrix() {
      if (this.setting.ciId) {
        this.setting.ciIdList = [];
        this.setting.ciIdList = [this.setting.ciId];
        this.isShow = false;
        await this.$api.cmdb.ci.getCiViewByCiId(this.setting.ciId).then((res) => {
          if (res.Status == 'OK') {
            let resdata = res.Return;
            let newArr = [];
            resdata.forEach(v => {
              //排除掉所有常量，因为常量不能修改
              const data = {};
              if (v.type != 'const') {
                data.isShow = false;
                data.isEdit = false;
                data.key = v.type + '_' + v.itemId;
                data.title = v.itemLabel;
                data.fromCiId = v.itemId;
                newArr.push(data);
              }
            });
            this.setting.actionEdit = false;
            this.setting.actionDel = false;
            this.setting.actionAdd = false;
            
            this.setting.dataConfig = newArr;
            this.isShow = true;
          }
        });
      } else {
        this.setting.ciIdList = [];
        this.setting.dataConfig = [];
      }
    }
  },
  computed: {},
  watch: {}

};

</script>
<style lang='less' scoped>
.boxAction{
  display: flex;
  border-bottom: 1px solid;
  padding: 4px 0 10px;
  .actionItem{
    flex: 1;
    // text-align: center;
  }
}
.dynamic-table {
  .first-td {
    padding-left: 0 !important;
  }
}
</style>
