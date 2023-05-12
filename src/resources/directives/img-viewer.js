import Vue from 'vue';
import './img-viewer.less';
import utils from '@/resources/assets/js/util.js';

export default {
  bind(el, binding) {
    //点击事件的function
    !el.imgViewer && (el.imgViewer = function(event) {
      let $target = event.target;
      if ($target.nodeName == 'IMG') {
        let src = $target.getAttribute('src');
        if (src) {
          let imgList = []; //所有图片的路径的综合
          let currentIndex = 0;//当前预览图片的是第几个
          el.querySelectorAll('img').forEach((item, i) => {
            imgList.push({
              src: item.getAttribute('src')
            });
            item == $target ? currentIndex = i : '';
          });
          if (el.vueimgViewer) {
            el.vueimgViewer.imgList = imgList;
            el.vueimgViewer.currentIndex = currentIndex;
            el.vueimgViewer.invisible = true;
          } else {
            el.vueimgViewer = createImgeDiv(imgList, currentIndex);
          }
        }
        event.stopPropagation();//预览指令嵌套使用导致出现两层预览，通过阻止事件传播，
      }
    });
    //滚动放大事件
    !el.scrollFunc && (el.scrollFunc = function(event) {
      if (el.vueimgViewer && el.vueimgViewer.invisible) {
        let $img = el.vueimgViewer.$el.querySelectorAll('img')[el.vueimgViewer.currentIndex];
        let config = {
          maxHeight: $img.naturalHeight,
          maxWidth: $img.naturalWidth,
          height: $img.height,
          width: $img.width,
          minWidth: document.body.clientWidth * 0.9,
          minHeight: document.body.clientHeight
        };
        let dalta = event.wheelDelta !== undefined ? event.wheelDelta : -event.detail; //dalta大于零向上 ，小于零向下
        $img.style.marginTop = 0;
        $img.style.marginLeft = 0;
        if (dalta > 0) { //变大
          if (config.height >= config.maxHeight || config.width >= config.maxWidth) {
            $img.setAttribute('isMax', '1');
            return;
          }
          let styleConfig = {};
          styleConfig.height = config.height * 1.1;
          styleConfig.width = config.width * 1.1;
          styleConfig.height >= config.maxHeight && (styleConfig.height = config.maxHeight);
          styleConfig.width >= config.maxWidth && (styleConfig.width = config.maxWidth);
          $img.style.height = styleConfig.height + 'px';
          $img.style.width = styleConfig.width + 'px';
          $img.style.maxHeight = config.maxHeight + 'px';
          $img.style.maxWidth = config.maxWidth + 'px';
        } else { //变小
          let styleConfig = {};
          styleConfig.height = config.height * 0.9;
          styleConfig.width = config.width * 0.9;
          if ((config.height > config.width ? config.height <= config.minHeight : config.width <= config.minWidth) || (styleConfig.height > styleConfig.width ? styleConfig.height <= config.minHeight : styleConfig.width <= config.minWidth)) {
            setImgmin($img);
            return;
          } else {
            $img.style.height = styleConfig.height + 'px';
            $img.style.width = styleConfig.width + 'px';
            $img.style.maxHeight = config.maxHeight + 'px';
            $img.style.maxWidth = config.maxWidth + 'px';
          }
        }
      }
    });
    utils.toggleClass(el, 'img-viewer', 'add');
    //绑定事件
    el.addEventListener('click', el.imgViewer);
    document.addEventListener('mousewheel', el.scrollFunc);
    document.addEventListener('DOMMouseScroll', el.scrollFunc);

    el.resizeImg = function() { // 当窗口发生变化时需要更新位置
      if (el.vueimgViewer) {
        let $img = el.vueimgViewer.$el.querySelectorAll('img')[el.vueimgViewer.currentIndex];
        setImgmin($img);
      }
    };
    window.addEventListener('resize', el.resizeImg);
  },
  update(el, binding) {
  },
  unbind(el, binding) {
    document.removeEventListener('mousewheel', el.scrollFunc);
    document.removeEventListener('DOMMouseScroll', el.scrollFunc);
    el.imgViewer = null;
    el.vueimgViewer && el.vueimgViewer.$destroy();
    el.vueimgViewer && el.vueimgViewer.$el && el.vueimgViewer.$el.remove();
    el.vueimgViewer = null;
  }
};
function handleGetIndex() {
  let $popList = document.querySelectorAll('body>.ivu-poptip-popper');
  let $pop = $popList[$popList.length - 1];
  return $pop ? $pop.style.zIndex || '1006' : '1006';
}

function setImgmin($img) {
  $img.style.height = 'unset';
  $img.style.width = 'unset';
  $img.style.maxHeight = '100%';
  $img.style.maxWidth = '90%';
  $img.style.marginTop = 'unset';
  $img.style.marginLeft = 'unset';
  $img.setAttribute('isMax', '0');
}

function setImgmax($img) {
  let config = {
    maxHeight: $img.naturalHeight,
    maxWidth: $img.naturalWidth
  };
  $img.style.height = config.maxHeight + 'px';
  $img.style.width = config.maxWidth + 'px';
  $img.style.maxHeight = config.maxHeight + 'px';
  $img.style.maxWidth = config.maxWidth + 'px';
  $img.style.marginTop = 0;
  $img.style.marginLeft = 0;
  $img.setAttribute('isMax', '1');
}

function createImgeDiv(imgList, currentIndex) { //创建轮播的vue对象
  let height = document.body.clientHeight;
  var ItemComponent = Vue.extend({
    data: function() {
      return {
        imgList: imgList,
        currentIndex: currentIndex,
        height: height,
        invisible: true,
        zIndex: handleGetIndex()
      };
    },
    updated() {
      this.zIndex = handleGetIndex();
    },
    mounted() {
      this.$nextTick(() => {
        let extendDom = this.$el.querySelectorAll('.ivu-carousel-arrow,.ivu-carousel-dots,.img-tool');
        extendDom.forEach(item => {
          item.addEventListener('click', function(e) {
            e.stopPropagation();
          });
        });
      });
    },
    methods: {
      handlerClose(event) {
        this.invisible = false;
        this.clearStyle(this.currentIndex);
      },
      onChange(index) {
        this.clearStyle(index);
      },
      clearStyle(index) { //清空当前图片的状态
        let extendDom = this.$el.querySelectorAll('img.main-img');
        let $img = extendDom[index];
        $img.style.height = 'unset';
        $img.style.width = 'unset';
        $img.style.maxHeight = '100%';
        $img.style.maxWidth = '90%';
        $img.style.marginTop = 0;
        $img.style.marginLeft = 0;
      },
      imgHandlerClick() {
        if (!this.mousemove) {
          let extendDom = this.$el.querySelectorAll('img.main-img');
          let $img = extendDom[this.currentIndex];
          if ($img.getAttribute('isMax') == '1') { //变小
            setImgmin($img);
          } else { //变大
            setImgmax($img);
          }
        }
        this.mousemove = false;
      },
      handlermouseMove(event) {
        if (this.mousedown && !this.mouseup) {
          this.mousemove = true;
          event.target.style.cursor = 'grab';
          if (event.screenX) {
            let extendDom = this.$el.querySelectorAll('img.main-img');
            let $img = extendDom[this.currentIndex];
            let marginLeft = event.screenX - this.left;
            let marginTop = event.screenY - this.top;
            this.left = event.screenX;
            this.top = event.screenY;
            marginLeft = this.getMarginNum($img, 'marginLeft') + marginLeft;
            marginTop = this.getMarginNum($img, 'marginTop') + marginTop;
            if (marginLeft > 0 || marginTop > 0 || Math.abs(marginLeft) + document.body.clientWidth >= $img.width) { //左上超出的情况
              //return;
            } else {
              $img.style.marginLeft = marginLeft + 'px';
            }
            if (marginLeft > 0 || marginTop > 0 || Math.abs(marginLeft) + document.body.clientWidth >= $img.width || Math.abs(marginTop) + document.body.clientHeight >= $img.height) { //左上超出的情况
              // return;
            } else {
              $img.style.marginTop = marginTop + 'px';
            }
          }
        }
      },
      handlermouseDown(event) {
        this.mousedown = true;
        this.mouseup = false;
        this.mousemove = false;
        this.left = null;
        this.top = null;
      },
      handlermouseUp(event) {
        this.mousedown = false;
        this.mouseup = true;
        this.left = event.screenX;
        this.top = event.screenY;
        event.target.style.removeProperty('cursor');
      },
      handlerStart(event) {
        event.stopPropagation();
        event.preventDefault();
      },
      getMarginNum($img, name) {
        let value = $img.style[name] || 0;
        if (typeof value == 'string') {
          value = value.replace('px', '');
          value = value ? Math.floor(value) : 0;
        }
        return value;
      }
    },
    template: `<div v-show="invisible"  ref="caroselImg" class="carosel-img bg-mongolia" style="padding-top: 55px;" :style="{'z-index':zIndex}"  @click="handlerClose">
                 <div class="text-op img-tool" @click.stop><div class="img-btn" @click="handlerClose"><span class="tsfont-close" ></span></div></div>
                <Carousel v-model="currentIndex"  :height="height-55" easing="none" dots="none" @on-change="onChange">
                    <CarouselItem v-for="(img,index) in imgList" :key="index">
                        <div class="demo-carousel">
                        <img :src="img.src" class="main-img" @click.stop="imgHandlerClick" @mousemove="handlermouseMove" @mousedown="handlermouseDown" @mouseup="handlermouseUp"  @dragstart="handlerStart" />
                        </div>
                    </CarouselItem>
                </Carousel>
              </div>`
  });
  let $newDom = document.createElement('div');
  document.body.appendChild($newDom);
  return new ItemComponent().$mount($newDom);
}

