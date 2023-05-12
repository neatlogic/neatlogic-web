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
  <TsDialog v-bind="validDialog" :isShow="visible" @on-close="close()">
    <div class="valid-title"><span class="tsfont-info-o text-warning"></span>{{ $t('term.autoexec.issaveexecutetarget') }}</div>
    <div v-for="(item,index) in resultList" :key="index" class="valid-box">
      <template v-if="item.type == 'resourceIsEmpty'">
        <span>{{ $t('term.autoexec.notmatchexecutetarget') }}</span>
      </template>
      <template v-if="item.type == 'executeUserIsNotFoundInProtocol'">
        <span>
          {{ $t('term.autoexec.nousertoaccountpagesetting', {protocol: item.protocol, executeuser: item.executeUser }) }}
        </span>
        <span class="text-href" @click="gotoAccountManage()">{{ $t('term.autoexec.addaccount') }}</span>
      </template>
      <template v-if="item.type == 'resourceListWithoutAccountByExecuteUserAndProtocol'">
        <div class="title-tip">{{ $t('term.autoexec.thefollowingobjectives') }}</div>
        <template v-if="item.list.length > 0">
          <div class="text-tip">{{ $t('term.autoexec.executetarget') }}：</div>
          <ul>
            <li v-for="(i,iindex) in item.list" :key="iindex" class="text-tip valid-list">
              {{ i.ip }}<template v-if="i.port">:{{ i.port }}</template>
            </li>
          </ul>
        </template>
        <template v-if="item.whitelist && item.whitelist.length > 0">
          <div class="text-tip">{{ $t('page.whitelist') }}：</div>
          <ul>
            <li v-for="(i,iindex) in item.whitelist" :key="iindex" class="text-tip valid-list">
              {{ i.ip }}<template v-if="i.port">:{{ i.port }}</template>
            </li>
          </ul>
        </template>
        <span>
          {{ $t('term.autoexec.noexecuteusertoassetmanage', {protocol: item.protocol , executeUser: item.executeUser }) }}
        </span>
        <span class="text-href" @click="gotoAssetManage('addAccount', item.list)">{{ $t('term.autoexec.addbindaccount') }}</span>
      </template>
      <template v-if="item.type == 'resourceListWithoutAccountByProtocol'">
        <div class="title-tip">{{ $t('term.autoexec.thefollowingobjectives') }}</div>
        <template v-if="item.list.length > 0">
          <div class="text-tip">{{ $t('term.autoexec.executetarget') }}：</div>
          <ul>
            <li v-for="(i,iindex) in item.list" :key="iindex" class="text-tip valid-list">
              {{ i.ip }}<template v-if="i.port">:{{ i.port }}</template>
            </li>
          </ul>
        </template>
        <template v-if="item.whitelist && item.whitelist.length > 0">
          <div class="text-tip">{{ $t('page.whitelist') }}：</div>
          <ul>
            <li v-for="(i,iindex) in item.whitelist" :key="iindex" class="text-tip valid-list">
              {{ i.ip }}<template v-if="i.port">:{{ i.port }}</template>
            </li>
          </ul>
        </template>
        <span>{{ $t('term.autoexec.noexecuteusertoassetmanage', {protocol: item.protocol , executeUser: item.executeUser||"null" }) }}</span>
        <span class="text-href" @click="gotoAssetManage('addAccount', item.list)">{{ $t('term.autoexec.addbindaccount') }}</span>
      </template>
      <template v-if="item.type == 'resourceIsNotFound'">
        <div class="title-tip">{{ $t('term.autoexec.thefollowingobjectives') }}</div>
        <template v-if="item.list.length > 0">
          <div class="text-tip">{{ $t('term.autoexec.executetarget') }}：</div>
          <ul>
            <li v-for="(i,iindex) in item.list" :key="iindex" class="text-tip valid-list">
              {{ i.ip }}<template v-if="i.port">:{{ i.port }}</template>
            </li>
          </ul>
        </template>
        <template v-if="item.whitelist && item.whitelist.length > 0">
          <div class="text-tip">{{ $t('page.whitelist') }}：</div>
          <ul>
            <li v-for="(i,iindex) in item.whitelist" :key="iindex" class="text-tip valid-list">
              {{ i.ip }}<template v-if="i.port">:{{ i.port }}</template>
            </li>
          </ul>
        </template>
        <span>{{ $t('term.autoexec.notfoundassetstip') }}</span>
      </template>
    </div>
    <template v-slot:footer>
      <Button type="primary" ghost @click="close()">{{ $t('page.back') }}</Button>
      <Button type="primary" @click="save()">{{ $t('page.save') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
  },
  filters: {
  },
  props: {
    visible: {//是否显示
      type: Boolean,
      default: false
    },
    resultList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      validDialog: {
        hasHeader: false,
        showCloseIcon: false,
        height: '300px'
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    save() {
      this.$emit('save');
    },
    close() {
      this.$emit('close');
    },
    gotoAccountManage() { //添加帐号
      window.open(HOME + '/cmdb.html#/account-manage?isNewAccountShow=true', '_blank');
    },
    gotoAssetManage(type, list) { //资产绑定帐号
      let assetIpList = JSON.stringify(list);
      list.length > 1 && sessionStorage.setItem('assetIpList', assetIpList);
      if (type == 'addAccount' && list.length == 1) {
        window.open(HOME + '/cmdb.html#/asset-manage?isAddAccountShow=true', '_blank');
      } else {
        window.open(HOME + '/cmdb.html#/asset-manage', '_blank'); //添加资产,待定（功能还没有）
      }
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.title-tip{
  padding: 16px 0 10px;
}
</style>
