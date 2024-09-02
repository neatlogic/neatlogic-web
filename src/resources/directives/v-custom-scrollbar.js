/* eslint-disable no-inner-declarations */
/*
  表格自定义水平滚动条指令，列宽大于表格宽度时显示，在底部浮现水平滚动条，否则不出现
*/
export default {
  // 当指令绑定到元素上时调用
  inserted(el) {
    const tableWrapper = el;
    const timeout = 300;
    let scrollTimer = null;

    // 创建自定义滚动条容器和滚动条
    const customScrollbar = document.createElement('div');
    customScrollbar.className = 'custom-scrollbar-box';
    const scrollBar = document.createElement('div');
    scrollBar.className = 'scroll-bar';
    customScrollbar.appendChild(scrollBar);
    tableWrapper.style.position = 'relative';
    tableWrapper.appendChild(customScrollbar);

    // 更新自定义滚动条的显示状态和位置
    function updateCustomScrollbar() {
      // 等待DOM渲染完成后再计算自定义滚动条的宽度
      requestAnimationFrame(() => {
        const containerWidth = tableWrapper.clientWidth;
        const scrollWidth = tableWrapper.scrollWidth;
        const { top, height, bottom } = tableWrapper.getBoundingClientRect() || {};
        const viewportHeight = window.innerHeight;
        const tsmodalFooterHeight = document.querySelector('.tsmodal-footer') ? document.querySelector('.tsmodal-footer').clientHeight : 0;
        const tssliderFooterHeight = document.querySelector('.tsslider-footer') ? document.querySelector('.tsslider-footer').clientHeight : 0;

        // 计算自定义滚动条的宽度
        const scrollbarWidth = containerWidth * (containerWidth / scrollWidth);
        scrollBar.style.width = `${scrollbarWidth}px`;
        let tableSrcollHeight = Number((top + height).toFixed(2));
        let tableHeight = Number((tableSrcollHeight - viewportHeight).toFixed(2)); // 隐藏的高度
        let tableViewHeight = Number((height - tableHeight).toFixed(2)); // 视口的高度

        if (scrollWidth > containerWidth) {
          customScrollbar.style.display = 'block';
          customScrollbar.style.width = `${scrollWidth}px`;
          // 检查表格容器底部是否在可视区域
          if (bottom > viewportHeight && tableSrcollHeight > viewportHeight && tableHeight) {
            // 表格容器底部不在可视区域内，固定滚动条在视口底部
            customScrollbar.style.position = 'absolute';
            customScrollbar.style.top = `${tsmodalFooterHeight ? tableViewHeight - tsmodalFooterHeight - 89 : tssliderFooterHeight > 0 ? tableViewHeight - tssliderFooterHeight - 21 : tableViewHeight - 22}px`;
          } else {
            // 表格容器底部在可视区域内，滚动条在容器底部
            customScrollbar.style.display = 'none';
          }
          // 滚动事件的逻辑
          function onScroll(e) {
            const scrollLeft = tableWrapper.scrollLeft; // 水平滚动偏移量
            const maxScrollLeft = scrollWidth - containerWidth; // 滚动条最大滚动距离
            const scrollPercent = scrollLeft / maxScrollLeft; // 最大滚动范围的位置
            scrollBar.style.transform = `translateX(${scrollPercent * (scrollWidth - scrollbarWidth)}px)`; // 拖动滚动条的位置
          }
          tableWrapper.addEventListener('scroll', onScroll);

          // 拖动滚动条的逻辑
          let isDragging = false;
          let startX;
          let scrollStartX;

          function onMouseDown(e) {
            e.preventDefault(); // 阻止文本选中
            isDragging = true;
            startX = e.pageX;
            scrollStartX = tableWrapper.scrollLeft;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          }

          function onMouseMove(e) {
            if (isDragging) {
              const dx = e.pageX - startX;
              const maxScrollLeft = scrollWidth - containerWidth;
              const newScrollLeft = scrollStartX + (dx / (containerWidth - scrollBar.clientWidth)) * maxScrollLeft;
              tableWrapper.scrollLeft = Math.max(0, Math.min(newScrollLeft, maxScrollLeft));
            }
          }

          function onMouseUp() {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
          }
          scrollBar.addEventListener('mousedown', onMouseDown);
          // 清理事件监听器
          el.__scrollHandler__ = { onScroll, onMouseDown, onMouseMove, onMouseUp };
        } else {
          // 隐藏自定义滚动条
          customScrollbar.style.display = 'none';
        }
      });
    }
    function hideCustomScrollbar() {
      const elements = [document.querySelector('.ivu-layout-content'), document.querySelector('.tsmodal-content'), document.querySelector('.tsslider-body')];
      const handleScroll = e => {
        e.preventDefault();
        e.stopPropagation();
        customScrollbar.style.display = 'none';
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(updateCustomScrollbar, timeout);
      };
      // 为每个存在的元素添加 scroll 事件监听器
      elements.forEach(element => {
        if (element) {
          element.addEventListener('scroll', e => handleScroll(e), false);
        }
      });
    }
    updateCustomScrollbar();
    window.addEventListener('resize', updateCustomScrollbar); // 在窗口调整大小时更新自定义滚动条
    hideCustomScrollbar(); // 拖动滚动条的时候隐藏自定义滚动条，拖放停止后显示
    // 保存指令实例数据
    el.__customScrollbar__ = { customScrollbar, updateCustomScrollbar, hideCustomScrollbar };
  },
  update(el) {
    // 更新自定义滚动条，确保数据回来之后，自定义滚动条的位置正确显示
    if (el.__customScrollbar__) {
      el.__customScrollbar__.updateCustomScrollbar();
      el.__customScrollbar__.hideCustomScrollbar();
    }
  },
  // 当指令解绑时调用
  unbind(el) {
    const { customScrollbar, updateCustomScrollbar } = (el && el.__customScrollbar__) || {};
    const { onScroll, onMouseDown, onMouseMove, onMouseUp } = (el && el.__scrollHandler__) || {};
    if (customScrollbar) {
      el.removeChild(customScrollbar);
    }
    if (onScroll) {
      el.removeEventListener('scroll', onScroll);
    }
    if (onMouseDown && el.querySelector('.scroll-bar')) {
      el.querySelector('.scroll-bar').removeEventListener('mousedown', onMouseDown);
    }
    window.removeEventListener('resize', updateCustomScrollbar);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    window.removeEventListener('scroll', el.__customScrollbar__.hideCustomScrollbar, true);
  }
};
