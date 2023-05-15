<template>
  <div class="formViewHtml">
    <div class="propContainer">
      <TsFormItem
        v-for="(prop,index) in propList"
        :key="index"
        class="prop-col"
        :label="prop.key.text"
        itemWidth="50%"
      >{{ prop.value }}</TsFormItem>
    </div>
    <div ref="formHtml" class="formcontainer" v-html="content"></div>
  </div>
</template>

<script>
import TsFormItem from '@/resources/plugins/TsForm/TsFormItem';
export default {
  name: '',
  components: {TsFormItem},
  filters: {},
  props: {
    processTaskId: String
  },
  data() {
    return {
      content: null,
      lineHeight: 20,
      rowCount: 24,
      itemList: [],
      propList: []
    };
  },
  beforeCreate() {},
  created() {
    window.addEventListener('resize', this.resetWidth);
  },
  beforeMount() {},
  mounted() {    
    let _this = this;
    this.$api.framework.form.getOldFormHtml({processTaskId: this.processTaskId}).then(res => {
      if (res.Status == 'OK') {
        _this.content = res.Return.form;
        _this.propList = res.Return.prop;
        _this.propList && _this.propList.forEach(item => {
          try {
            let strValue = item.value.replace(/'/g, '"');
            item.value = JSON.parse(strValue);
          } catch (err) {
            //
          } finally {
            typeof item.value == 'object' && item.value && (item.value = item.value.text);
          }
        });
        _this.$nextTick(() => {
          _this.initItem();
        });
      }
    });
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() { 
    window.removeEventListener('resize', this.resetWidth); 
  },
  destroyed() {},
  methods: {
    updateFormval() { //更新值
      
    },
    getFormvalNovalid() {
      return [];
    },
    getHidecomponent() {
      return [];
    },
    getReadcomponent() {
      return [];
    },
    getFormval() {
      return true;
    },
    initItem() { //初始化数据
      if (this.$refs.formHtml) {
        let maxRow = 0;
        this.itemList = [];
        let $item = this.$refs.formHtml.querySelectorAll('.jquery-dashboard-portlet');
        let width = this.$el.getBoundingClientRect().width || 700;
        $item && $item.forEach(($i, index) => {
          let sc = Math.floor($i.dataset['sc']);
          let ec = Math.floor($i.dataset['ec']);
          let sr = Math.floor($i.dataset['sr']);
          let er = Math.floor($i.dataset['er']);
          maxRow = maxRow > er ? maxRow : er;
          this.itemList.push({row: er - sr, col: ec - sc, sc, ec, sr, er});
          this.setItemStyle($i, this.itemList[index], width);
        });
        //设置容器的高度
        let $container = this.$refs.formHtml.querySelector('.jquery-dashboard');
        $container && ($container.style.height = this.lineHeight * maxRow + 'px');
      }
    },
    setItemStyle($item, config, width) { //设置样式
      let style = `width:${width / this.rowCount * config.col}px;height:${this.lineHeight * config.row}px;transform: translate(${width / this.rowCount * config.sc}px,${this.lineHeight * config.sr}px);`;
      $item.setAttribute('style', style); 
    },
    resetWidth() { //resize 监听事件
      let width = this.$el.getBoundingClientRect().width || 700;
      let $item = this.$refs.formHtml.querySelectorAll('.jquery-dashboard-portlet');
      $item && $item.forEach(($i, index) => {
        this.setItemStyle($i, this.itemList[index], width);
      });
    }
  },
  computed: {},
  watch: {}
};

</script>
<style lang='less' scoped>
@import (reference) '~@/resources/assets/css/variable.less';
 .formViewHtml{
    .propContainer{
      display: flex;
      flex-wrap: wrap;
       .prop-col{
         width: 50%;
       }
       /deep/.ivu-form-item{
         margin-bottom: 10px;
       }
    }
    /deep/.jquery-dashboard{
      height: auto !important;
    }

    /deep/.formcontainer{

      //table
        .table{
          min-width: 100%;
          text-align: left;
          border-collapse: collapse;
          border-spacing: 0;
          thead {
           
          }
          tr{
            th,td {
              padding: 9px;
              font-weight: normal;
            
            }
          
            td {
              white-space: nowrap;
              word-break: keep-all;
            }
            &:last-child{
              td{
                border:none
              }
            }
          }
         
        }

       //线条
        hr{
          border: none;
        
        }

        //左右布局
        .form-block{
          position: relative;
          padding-bottom: 10px;
          padding-left: 0px;
          margin-bottom: 0px;
          .block-left{
            position:absolute;
            top:0;
            left:0;
            width:150px;
          
            text-align:right;
            padding-right:5px;
            line-height: 32px;
            min-height: 32px;
            .overflow();
            margin:0px;
            &.colon{
                padding-right: 19px !important;
                &:after{
                  content: "：";
                  right: 5px;
                  position: absolute;
                }
                }
                &.unset{
                  overflow: unset;
                }
          }
          .block-right{
            padding-left:150px;
            min-height:24px;
            word-break: break-all;
             line-height: 32px;
            min-height: 32px;
            >.static-text{
              padding-top:5px;
              padding-bottom:10px;
              display:block;
            }
          }
          &.text{
            padding-top:8px;
            padding-bottom: 10px;
            .block-left{
                margin-top:0px;
                top: 8px;
            }
          }
        }

        //栅格布局
        .width(@per){ 
          width: percentage((@per/12));
        }
        .row:after, .container-fluid:after{
            visibility: hidden;
            clear: both;
            display: block;
            content: " ";
            height: 0;
        }
        .row, .container-fluid{
            *zoom:1;
        }
        .col-1, .col-2, .col-3, .col-4, .col-5, .col-6, .col-7, .col-8, .col-9, .col-10, .col-11, .col-12{
            float: left;
        }
        .col-lg-1, .col-lg-2, .col-lg-3, .col-lg-4, .col-lg-5, .col-lg-6, .col-lg-7, .col-lg-8, .col-lg-9, .col-lg-10, .col-lg-11, .col-lg-12{
            float: left;
        }
        .col-md-1, .col-md-2, .col-md-3, .col-md-4, .col-md-5, .col-md-6, .col-md-7, .col-md-8, .col-md-9, .col-md-10, .col-md-11, .col-md-12{
            float: left;
        }
        .col-1,.col-md-1,.col-lg-1,.col-sm-1{
            .width(1);
        }
        .col-2,.col-md-2,.col-lg-2,.col-sm-2{
            .width(2);
        }
        .col-3,.col-md-3,.col-lg-3,.col-sm-3{
            .width(3);
        }
        .col-4,.col-md-4,.col-lg-4,.col-sm-4{
            .width(4);
        }
        .col-5,.col-md-5,.col-lg-5,.col-sm-5{
            .width(5);
        }
        .col-6,.col-md-6,.col-lg-6,.col-sm-6{
            .width(6);
        }
        .col-7,.col-md-7,.col-lg-7,.col-sm-7{
            .width(7);
        }
        .col-8,.col-md-8,.col-lg-8,.col-sm-8{
            .width(8);
        }
        .col-9,.col-md-9,.col-lg-9,.col-sm-9{
            .width(9);
        }
        .col-10,.col-md-10,.col-lg-10,.col-sm-10{
            .width(10);
        }
        .col-11,.col-md-11,.col-lg-11,.col-sm-11{
            .width(11);
        }
        .col-12,.col-md-12,.col-lg-12,.col-sm-12{
            .width(12);
        }

        //左右浮动布局
        .d_f {
          float: left;
        }

        .d_f_r {
          float: right;
        }
        .inline {
          display: inline-block;
        }
        .clear {
          clear: both;
        }
        //dashboard布局

        //预览页面样式
        .spnFilled {
          /* font-weight: 600; */
          /* padding: 7px 2px 0px 2px; */
          display: inline-block;
          line-height: 28px;
        }

        .grid-stack-item {
        
        }

        .checkbox-inline {
          padding: 0px
        }

        .checkbox-inline .spnFilled {
          padding: 0px
        }

        .spnEmpty {
         
          padding: 7px 2px 0px 2px;
          display: inline-block
        }

        .checkbox-inline .spnEmpty {
          padding: 0px
        }

        .radio-inline {
          padding: 0px
        }

        .checkbox-inline {
          padding: 0px
        }

        div.checkbox .spnFilled {
          padding: 0px
        }

        div.checkbox .spnEmpty {
          padding: 0px
        }

        div.checkbox label {
          padding: 0px
        }

        div.radio .spnFilled {
          padding: 0px
        }

        div.radio .spnEmpty {
          padding: 0px
        }

        div.radio label {
          padding: 0px
        }

        .form-checkbox {
          width: 13px;
          height: 13px;
          margin-right: 3px;
        }

        .form-checkbox.spnFilled {
        
          background-position: center;
          background-image:
            url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAK6wAACusBgosNWgAAABZ0RVh0Q3JlYXRpb24gVGltZQAxMS8yMy8xNXUE1QoAAAAcdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3JrcyBDUzVxteM2AAAATUlEQVQokZ2PSQoAMAgDG+n/v5xeenAt2oAg6hgFyTWVjIkhxBttyPzQgTQADdE1SyBzYpFDD0lS9K4G8E6hWdTCeShyo93d/nJq6Qs6yWQOGO3fAGEAAAAASUVORK5CYII=')
        }

        .form-checkbox.spnEmpty {
      
        }

        .form-radio {
          width: 13px;
          height: 13px;
          border-radius: 100%;
          margin-right: 3px;
        }

        .form-radio.spnFilled {
         
          background-position: center;
          background-image:
            url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNXG14zYAAACnSURBVCiRpZKxDcIwEEWfPQLKFojskI5VXFMYMQCKC1q8Cl2GQJkiEiscjRPZh0OQ+M3Z334nnf4ZEWGWiYE1ifPL2f4C6HcjIoWRd6wB4jyGe18aMeyAC7AHRuAqzr9y0CqgAQbgBBxTHUwMTXWmJA+0ymuBc25o6PAxUMXX0LgCPb9Bvf6Q7kUeRU7i/AR0wA14pNqJ89P/Oc1rtLUReUOrjS0A4A39Q0cqir6eWAAAAABJRU5ErkJggg==')
        }

        .form-radio.spnEmpty {
        
        }

        .htmleaf-content {
          min-height: 0px !important;
        }

        .spnFilled {
          word-break: break-all;
        }
        .control-label{
          text-align:right;
            padding-top: 7px;
        }
        .SumoSelect{
          display: inline-block;
          outline: none;
        }

        //dashbord 样式
        .jquery-dashboard {
        position: relative;
      }

      .jquery-dashboard-portlet {
        margin: 0px;
        padding: 5px;
        transition: all .1s ease;
        z-index: 2;
        position: absolute;
        top:0;
        left:0;
        moz-user-select: -moz-none;
        -moz-user-select: none;
        -o-user-select: none;
        -khtml-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }

      .jquery-dashboard-shadow {
        opacity: 0.2;
        position: absolute;
        z-index: 1;
        transition: all .1s ease;
      }

      .jquery-dashboard-container {
        width: 100%;
        height: 100%;
        padding: 40px 4px 4px 4px;
        position: relative;
       
      }
      .jquery-dashboard-container.empty-container{
          padding: 0;
          opacity: .8;
          border-color:transparent;	
      }
      .jquery-dashboard-container.empty-container:hover{
          opacity: 1;	
      }
      .jquery-dashboard-container.empty-container .jquery-dashboard-header{
        border:0 none;
        height:100%;	
      }
      .jquery-dashboard-container.empty-container .jquery-dashboard-header .jquery-dashboard-closer{
        line-height:22px;
        height:22px;
      }
      .jquery-dashboard-header {
        position: absolute;
        padding: 0px 8px;
        width: 100%;
        height: 38px;
        line-height: 40px;
      
        text-align: right;
        top: 0px;
        left: 0px;
      }

      .jquery-dashboard-title {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        padding: 0px 80px 0px 10px;
        position: absolute;
        top: 0px;
        left: 0px;
        width: 100%;
        text-align: left;
        z-index: 1;
      }

      .jquery-dashboard-body {
        overflow: auto;
        width: 100%;
        height: 100%;
        max-height: none;
      }

      .jquery-dashboard-titleinputer {
        padding: 3px;
     
        width: 100%;
        height: 100%;
        border-radius: 3px;
      }

      .view-container .jquery-dashboard-container.empty-container{
          opacity: 0;	
          visibility: hidden;
      }
      .jquery-dashboard-actionicon{
        height:38px;
        line-height:38px;
      }

      #formDiv{
        min-height: 100vh;	
        background-position: center center;
        background-size: cover;
      }

      .theme-dark .jquery-dashboard-body .emptydatatips{
        opacity: .2;
      }
    }
  }
  .theme-form(@border-color,@default-primary-color,@error-color,@gray-color,@title-color){
  .formViewHtml{
      /deep/.formcontainer{

        //table
          .table{
            thead {
              background: @gray-color;
              color: @title-color;
            }
            tr{
              th,td {
                border-bottom: 1px solid @border-color;
              }
            }
          }

        //线条
          hr{
            border-top: 1px solid @border-color;
          }

          //左右布局
          .form-block{
            .block-left{
              color:@title-color;
            }
          }

          .grid-stack-item {
            border-bottom: 1px dotted @border-color;
          }

          .spnEmpty {
            color: @error-color;
          }

          .form-checkbox.spnFilled {
            background-color: @primary-color;
          }

          .form-checkbox.spnEmpty {
            border: 1px solid @border-color;;
          }
          .form-radio.spnFilled {
            border: 1px solid @primary-color;
          }

          .form-radio.spnEmpty {
            border: 1px solid @border-color;
          }

          .jquery-dashboard-container {
            border: 1px solid @border-color;
          }

          .jquery-dashboard-header {
            border-bottom: 1px solid @border-color;
          }

          .jquery-dashboard-titleinputer {
            border: 1px solid @border-color;
          }
      }
    }
  }
  html {
    .theme-form(@default-border,@default-primary-color,@default-error-color,@default-gray,@default-title);
    &.theme-dark {
      .theme-form(@dark-border,@dark-primary-color,@dark-error-color,@dark-gray,@dark-title);
    }
  }
</style>

