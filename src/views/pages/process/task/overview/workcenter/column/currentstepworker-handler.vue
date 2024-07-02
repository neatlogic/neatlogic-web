<template>
  <div>
    <div v-if="rowData[headerKey] && rowData[headerKey].length > 0">
      <span v-for="(item, index) in sliceFn(rowData[headerKey], true)" :key="index" class="currentstepworkerUser">
        <UserCard
          v-bind="item.workerVo"
          :isInterface="false"
          :name="item.workTypename && (item.workerVo.initType == 'user' || item.workerVo.initType == 'team') ? `${item.workerVo.name}(${item.workTypename})` : item.workerVo.name"
        ></UserCard>
      </span>
      <span v-if="rowData[headerKey].length > 2">
        <Poptip
          transfer
          trigger="hover"
          placement="bottom-start"
          popper-class="workcenterpoper"
          offset="-16"
        >
          <span class="tsfont-option-horizontal text-tip"></span>
          <div slot="content">
            <div v-for="(item, index) in sliceFn(rowData[headerKey], false)" :key="index">
              <UserCard
                style="padding-top: 6px;"
                v-bind="item.workerVo"
                :isInterface="false"
                :name="item.workTypename && (item.workerVo.initType == 'user' || item.workerVo.initType == 'team' ) ? `${item.workerVo.name}(${item.workTypename})` : item.workerVo.name"
              ></UserCard>
            </div>
          </div>
        </Poptip>
      </span>
    </div>
  </div>
  
</template>
<script>
import mixin from './mixin';
export default {
  components: {
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue')
  },
  mixins: [mixin],
  methods: {}
};
</script>
<style lang="less" scoped>
.currentstepworkerUser{
  display: inline-block;
  padding-right:10px;
}
</style>
