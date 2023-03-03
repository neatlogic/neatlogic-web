<template>
  <div class="batch-data-contianer" contenteditable="true"></div>
</template>
<script>
export default {
  name: 'BatchData',
  components: {},
  props: {
    jsonList: {
      //{value text}
      type: Array
    },
    level: {
      type: [Number, String],
      default: 1
    }
  },
  data() {
    return {};
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.initValue();
    // this.$el.addEventListener('paste', (event) => {
    //   let paste = (event.clipboardData || window.clipboardData).getData('text');
    //   let pasteArray = [];
    //   paste.split('\n').forEach(str => {
    //     str.trim() && pasteArray.push(str);
    //   })
    //   console.log(pasteArray);

    //   event.preventDefault();
    // });
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getValue() {
      let validMessage = '';
      let valueString = this.$el.innerText;
      let strArray = [];
      let ary = valueString.split('\n');
      for (let i = 0; i < ary.length; i++) {
        let str = ary[i].trim();
        if (str) {
          //当不为空时
          let index = str.indexOf(',');
          if (index == 0) {
            if (str.replace(',', '').trim() == '') {
              continue;
            } else {
              validMessage = '值不能为空';
              break;
            }
          } else {
            let level = 1;
            if (/^-{1}[^-]/.test(str) && this.level >= 2) {
              //二级
              str = str.replace(/^-{1}/, '');
              level = 2;
              !strArray[strArray.length - 1].hasOwnProperty('children') && (strArray[strArray.length - 1].children = []);
            } else if (/^-{2}[^-]/.test(str) && this.level >= 3) {
              //三级
              str = str.replace(/^-{2}/, '');
              level = 3;
              if (!(strArray[strArray.length - 1].hasOwnProperty('children') && strArray[strArray.length - 1].children.length > 0)) {
                validMessage = '第三层没有父节点';
                break;
              } else {
                let levelJson = strArray[strArray.length - 1].children;
                !levelJson.hasOwnProperty('children') && (levelJson[levelJson.length - 1].children = []);
              }
            } else if (/^-{1,}/.test(str)) {
              validMessage = '值不可以以-开头';
            }
            //校验数据
            index = str.indexOf(',');
            if (str.trim('') == '' || (index === 0 && str.replace(',', '').trim() == '')) {
              continue;
            } else if (index === 0) {
              validMessage = '值不能为空';
              break;
            }

            let json = null;
            if (index < 0) {
              json = { value: str, text: str };
            } else {
              json = { value: str.slice(0, index), text: str.slice(index + 1) };
            }

            level == 1 ? strArray.push(json) : level == 2 ? strArray[strArray.length - 1].children.push(json) : level == 3 ? strArray[strArray.length - 1].children[strArray[strArray.length - 1].children.length - 1].children.push(json) : '';

            level == 1 && strArray.length > 500 && (validMessage = '数组长度不可大于500');
            level == 2 && !validMessage && strArray[strArray.length - 1].children.length > 500 && (validMessage = strArray[strArray.length - 1].value + '数组的子集长度不可大于500');
            level == 3 && !validMessage && strArray[strArray.length - 1].children[strArray[strArray.length - 1].children.length - 1].children.length > 500 && (validMessage = strArray[strArray.length - 1].children[strArray[strArray.length - 1].children.length - 1].value + '数组长度不可大于500');
            if (validMessage) {
              break;
            }
          }
          if (!getDefaultValue(strArray, strArray[strArray.length - 1].value, strArray.length - 1)) {
            validMessage = '每行对应的值不可相同';
            break;
          }
        }
      }

      if (!validMessage) {
        strArray.length > 500 && (validMessage = '数组长度不可大于500');
      }

      if (validMessage) {
        this.$Message.error(validMessage);
        return false;
      }
      return strArray;
    },
    initValue() {
      let str = '';
      this.jsonList.forEach(json => {
        str = str ? str + '\n' + json.value + ',' + json.text : json.value + ',' + json.text;
        if (json.hasOwnProperty('children') && json.children instanceof Array) {
          json.children.forEach(item1 => {
            str = str ? str + '\n-' + item1.value + ',' + item1.text : item1.value + ',' + item1.text;
            if (item1.hasOwnProperty('children') && item1.children instanceof Array) {
              item1.children.forEach(item2 => {
                str = str ? str + '\n--' + item2.value + ',' + item2.text : item2.value + ',' + item2.text;
              });
            }
          });
        }
      });
      this.$el.innerText = str;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};

function getDefaultValue(list, value, index) {
  //判断是否有重复数据
  let isDefaultValue = true;
  for (let i = 0; i < list.length; i++) {
    if (typeof index != 'undefined' && index != i && list[i].value == value) {
      isDefaultValue = false;
      break;
    } else if (typeof index == 'undefined' && list[i].value == value) {
      isDefaultValue = false;
      break;
    }
  }
  return isDefaultValue;
}
</script>
<style lang="less">
.batch-data-contianer {
  border: 1px solid #ddd;
  padding: 12px;
  line-height: 2;
  outline: none;
  min-height: 300px;
  &:empty:before {
    content: '值,显示文案';
  }
}
</style>
