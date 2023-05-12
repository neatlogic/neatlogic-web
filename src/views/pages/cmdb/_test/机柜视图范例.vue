<!--机柜视图范例-->
<template>
  <div>
    <Row :gutter="16">
      <Col
        v-for="(cabinet, index) of cabinetList"
        :key="index"
        :xs="6"
        :sm="6"
        :md="6"
        :lg="4"
        :xl="4"
        :xxl="4"
      >
        <div class="border-base padding-xs radius-sm bg-op" style="height:200px;overflow:auto">
          <div
            v-for="(unit, uindex) of cabinet.unitList"
            :key="uindex"
            class="bg-grey padding-xs radius-xs"
            style="margin:3px 0px"
            :class="{ 'bg-info-grey': !!unit.equipment }"
            :style="{ 'min-height': unit.unit ? unit.unit * 20 + 'px' : '20px' }"
          >
            <span v-if="unit.equipment">{{ unit.equipment.name }}</span>
          </div>
        </div>
        <div>{{ cabinet.name }}</div>
      </Col>
    </Row>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {},
  data() {
    return {
      dataList: [
        { equipmentPosition: '2-4', cabinetName: '机柜一号', equipmentName: '交换机1', id: 771661273145344, equipmentId: 573868590555136, capacity: '20' },
        { equipmentPosition: '12-14', cabinetName: '机柜一号', equipmentName: '对象存储1', id: 771661273145344, equipmentId: 573863976820737, capacity: '20' },
        { equipmentPosition: '26', cabinetName: '测试机柜', equipmentName: 'DC-PD-DIS-SW-02', id: 573865763594241, equipmentSn: '12345567', equipmentId: 767892154130436, capacity: '30' },
        { equipmentPosition: '24', cabinetName: '测试机柜', equipmentName: 'DC-OM-ACC-SW-27', id: 573865763594241, equipmentSn: 'FOC1613V0NF', equipmentId: 767892154130437, capacity: '30' }
      ]
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
  methods: {},
  computed: {
    cabinetList() {
      const cabinetList = [];
      this.dataList.forEach(d => {
        let cabinet = cabinetList.find(c => c.id === d.id);
        if (!cabinet) {
          cabinet = { id: d.id, name: d.cabinetName, capacity: parseInt(d.capacity), unitList: [] };
          for (let i = 1; i <= parseInt(d.capacity); i++) {
            const unit = { index: i };
            cabinet.unitList.push(unit);
          }
          cabinetList.push(cabinet);
        }
        if (d.equipmentPosition && d.equipmentPosition.includes('-')) {
          const pos = d.equipmentPosition.split('-');
          if (pos.length === 2) {
            const unitIndex = cabinet.unitList.findIndex(u => u.index == pos[0]);
            const unit = cabinet.unitList[unitIndex];
            unit.equipment = { id: d.equipmentId, name: d.equipmentName, position: d.equipmentPosition };
            unit.unit = pos[1] - pos[0] + 1;
            cabinet.unitList.splice(unitIndex + 1, pos[1] - pos[0]);
          }
        } else {
          const unit = cabinet.unitList.find(u => u.index == d.equipmentPosition);
          unit.equipment = { id: d.equipmentId, name: d.equipmentName, position: d.equipmentPosition };
          unit.unit = 1;
        }
      });
      return cabinetList;
    }
  }
};
</script>
<style lang="less"></style>
