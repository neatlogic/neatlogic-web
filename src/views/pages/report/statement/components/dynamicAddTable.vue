<template>
  <div>
    <el-button
      type="primary"
      size="small"
      icon="el-icon-plus"
      plain
      @click="handleAddClick"
    >{{ $t('common.new') }}</el-button>
    <el-table :data="formData" style="width: 100%">
      <el-table-column prop="name" :label="$t('page.name')" width="60" />
      <el-table-column prop="key" :label="'key' + $t('page.value')" width="70" />
      <el-table-column prop="width" :label="$t('common.width')" width="50" />
      <el-table-column :label="$t('page.action')" width="100">
        <template slot-scope="scope">
          <div class="button-group">
            <el-button
              type="text"
              size="small"
              @click="handleEditorClick(scope.$index, scope.row)"
            >{{ $t('button.edit') }}</el-button>
            <el-button
              type="text"
              size="small"
              @click="handleDeleteClick(scope.$index, scope.row)"
            >{{ $t('button.delete') }}</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :title="$t('common.new')"
      :visible.sync="dialogVisible"
      width="30%"
      :before-close="handleClose"
    >
      <el-form :model="rowFormData" label-width="50px">
        <el-form-item :label="$t('page.name') + ':'">
          <el-input
            v-model.trim="rowFormData['name']"
            :placeholder="$t('form.placeholder.name')"
            size="mini"
          >
          </el-input>
        </el-form-item>
        <el-form-item :label="'key' + $t('common.value') + ':'">
          <el-input
            v-model.trim="rowFormData['key']"
            :placeholder="$t('form.placeholder.pleaseinput', {target: 'key' + $t('common.value')})"
            size="mini"
          >
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('common.width') + ':'">
          <el-input
            v-model.trim="rowFormData['width']"
            :placeholder="$t('form.placeholder.pleaseinput', {target:$t('common.width')})"
            size="mini"
          >
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogVisible = false">{{ $t('button.cancel') }}</el-button>
        <el-button
          size="mini"
          type="primary"
          @click="handleSaveClick"
        >{{ $t('button.confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  model: {
    prop: 'formData',
    event: 'input'
  },
  props: {
    formData: Array
  },
  data() {
    return {
      dialogVisible: false,
      rowFormData: {
        name: '',
        key: '',
        width: ''
      },
      flag: true, // true 新增， false 编辑
      indexEditor: -1, // 编辑第几个数据
      tableData: []
    };
  },
  methods: {
    // 新增
    handleAddClick() {
      this.rowFormData = {};
      this.flag = true;
      this.dialogVisible = true;
    },
    // 编辑
    handleEditorClick(index, row) {
      this.flag = false;
      this.rowFormData = this.deepClone(row);
      this.indexEditor = index;
      this.dialogVisible = true;
    },
    // 关闭
    handleClose() {
      this.dialogVisible = false;
    },
    // 保存
    handleSaveClick() {
      if (this.flag) {
        // 新增
        this.formData.push(this.rowFormData);
        this.dialogVisible = false;
      } else {
        // 编辑
        this.formData[this.indexEditor] = this.rowFormData;
        this.$set(this.formData, this.indexEditor, this.rowFormData);
        this.dialogVisible = false;
      }
      this.$emit('input', this.formData);
      this.$emit('change', this.formData);
    },
    // 删除
    handleDeleteClick(index) {
      this.formData.splice(index, 1);
      this.$emit('input', this.formData);
      this.$emit('change', this.formData);
    }
  }
};
</script>
<style  scoped>
/deep/::-webkit-scrollbar-track-piece {
  background-color: transparent;
}
/deep/ .el-table__body-wrapper::-webkit-scrollbar {
  width: 0; // 横向滚动条
  height: 8px; // 纵向滚动条 必写
}
// 滚动条的滑块
/deep/ .el-table__body-wrapper::-webkit-scrollbar-thumb {
  border-radius: 5px;
  background-color: rgba(144, 146, 152, 0.3);
}
/deep/.el-table,
/deep/.el-table__expanded-cell,
/deep/.el-table th,
/deep/.el-table tr {
  background-color: transparent !important;
  color: #859094 !important;
  font-size: 12px !important;
}
/deep/.el-table td,
/deep/.el-table th.is-leaf {
  border-bottom: none;
  line-height: 26px;
}
/deep/.el-table tbody tr:hover {
  background-color: #263445 !important;
}
/deep/.el-table tbody tr:hover > td {
  background-color: #263445 !important;
}
/deep/.el-table::before {
  height: 0;
}
.button-group .el-button {
  padding: 0;
}
</style>
