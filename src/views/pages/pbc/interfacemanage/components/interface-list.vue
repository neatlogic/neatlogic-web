/*
 * Copyright(c) 2023 NeatLogic Co., Ltd. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
<template>
  <div>
    <div class="padding" style="padding-top:0px">
      <TsFormInput
        v-model="keyword"
        border="bottom"
        :search="true"
        :placeholder="$t('form.placeholder.keyword')"
      ></TsFormInput>
    </div>
    <div class="titlelistBox">
      <ul>
        <li
          v-for="(inter, index) in filterInterface"
          :id="'interface_' + inter.id"
          :key="index"
          class="interface-item text-default overflow cursor radius-sm padding-sm"
          :class="inter.id === id ? ' bg-selected' : ''"
          @click="click(inter)"
        >
          <div>{{ inter.name }}</div>
          <div class="text-grey fz10">{{ inter.id }}</div>
          <div v-if="!needItemCount && (inter.ciId || inter.customViewId)" class="mapping-item tsfont-bind"></div>
          <div v-if="needItemCount && inter.itemCount" class="item-count">
            <Badge v-if="inter.itemCount >= 100" type="primary" :text="'99+'"></Badge>
            <Badge v-else type="primary" :count="inter.itemCount"></Badge>
          </div>
          <div v-if="!needItemCount" class="btn-edit tsfont-edit cursor" @click="editInterface(inter)"></div>
          <div v-if="!needItemCount" class="btn-delete tsfont-trash-o cursor" @click="deleteInterface(inter)"></div>
        </li>
      </ul>
    </div>
    <EditInterface v-if="isEditInterfaceDialogShow" :interfaceId="currentInterfaceId" @close="closeEditInterfaceDialog"></EditInterface>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    EditInterface: resolve => require(['./interface-edit-dialog.vue'], resolve)
  },
  filters: {},
  props: {
    id: { type: String },
    needItemCount: { type: Boolean, default: false }
  },
  data() {
    return {
      interfaceList: [],
      keyword: '',
      currentInterfaceId: null,
      isEditInterfaceDialogShow: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  async mounted() {
    await this.searchInterface();
    if (this.interfaceList && this.interfaceList.length > 0) {
      if (!this.id) {
        this.$emit('click', this.interfaceList[0]);
        this.$utils.jumpTo('#interface_' + this.interfaceList[0].id);
      } else {
        const inter = this.interfaceList.find(d => d.id === this.id);
        if (inter) {
          this.$emit('click', inter);
          this.$utils.jumpTo('#interface_' + inter.id);
        }
      }
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    click(inter) {
      this.$emit('click', inter);
    },
    async searchInterface() {
      await this.$api.pbc.interfaces.getAllInterfaceList(this.needItemCount ? 1 : 0).then(res => {
        if (res.Status == 'OK') {
          this.interfaceList = res.Return;
        }
      });
    },
    async closeEditInterfaceDialog(interfaceId) {
      this.isEditInterfaceDialogShow = false;
      if (interfaceId) {
        await this.searchInterface();
        const inter = this.interfaceList.find(d => d.id === interfaceId);
        if (inter) {
          this.$emit('click', inter);
          this.$utils.jumpTo('#interface_' + inter.id);
        }
      }
    },
    editInterface(row) {
      this.isEditInterfaceDialogShow = true;
      this.currentInterfaceId = row.id;
    },
    deleteInterface(row) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('term.pbc.interfacedeleteconfirm', {target: row.name}),
        'on-ok': vnode => {
          this.$api.pbc.interfaces.deleteInterfaceById(row.id).then(async res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              vnode.isShow = false;
              await this.searchInterface();
              this.$emit('click', this.interfaceList[0]);
              this.$utils.jumpTo('#interface_' + this.interfaceList[0].id);
            }
          });
        }
      });
    }
  },
  computed: {
    filterInterface() {
      if (!this.keyword) {
        return this.interfaceList;
      } else {
        let filterInterfaceList = JSON.parse(JSON.stringify(this.interfaceList));
        filterInterfaceList = filterInterfaceList.filter(d => d.id.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1 || d.name.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1);
        return filterInterfaceList;
      }
    }
  },
  watch: {
    keyword: {
      handler: function(val) {}
    }
  }
};
</script>
<style lang="less" scoped>
.interface-item {
  position: relative;
}
.interface-item:hover .btn-delete,
.interface-item:hover .btn-edit {
  display: inline-block;
}
.item-count {
  position: absolute;
  right: 10px;
  top: 10px;
}
.btn-delete {
  position: absolute;
  display: none;
  right: 0px;
  top: 0px;
}
.btn-edit {
  position: absolute;
  display: none;
  right: 20px;
  top: 0px;
}
.mapping-item {
  position: absolute;
  right: 10px;
  bottom: 10px;
}
</style>
