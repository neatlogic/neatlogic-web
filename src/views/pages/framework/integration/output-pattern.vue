<template>
  <div>
    <table>
      <tr>
        <td v-for="(item, index) in paramList" :key="index" style="border:0px;padding:0px">
          <Dropdown v-if="item == '[]'" trigger="custom" :visible="visibleMap[index]">
            <a href="javascript:void(0)" @click="openMenu(index)">
              <Tag color="orange">
                请选择
                <Icon type="ios-arrow-down"></Icon>
              </Tag>
            </a>
            <DropdownMenu slot="list">
              <DropdownItem>驴打滚</DropdownItem>
              <DropdownItem>炸酱面</DropdownItem>
              <DropdownItem>豆汁儿</DropdownItem>
              <DropdownItem>冰糖葫芦</DropdownItem>
              <DropdownItem>北京烤鸭</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Tag v-if="item != '[]'">{{ item }}</Tag>
        </td>
      </tr>
    </table>
  </div>
</template>
<script>
export default {
  components: {},
  props: { paramName: { type: String } },
  data() {
    return { visibleMap: {} };
  },
  beforeCreate() {},
  created() {
    this.paramList.forEach((element, index) => {
      this.visibleMap[index] = false;
    });
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
    openMenu: function(index) {
      alert('a');
      console.log(index);
      console.log(JSON.stringify(this.visibleMap, null, 2));
      this.visibleMap[index] = true;
    }
  },
  filter: {},
  computed: {
    paramList: function() {
      return this.paramName.split('.');
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
