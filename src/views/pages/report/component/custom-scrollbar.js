/* eslint-disable no-inner-declarations */

export function createCustomScrollbar(element) {
  const tableWrapper = element;
  const timeout = 300;
  let scrollTimer = null;
  let isDragging = false;
  let startX;
  let scrollStartX;

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
    requestAnimationFrame(() => {
      const containerWidth = tableWrapper.clientWidth;
      const scrollWidth = tableWrapper.scrollWidth;
      const { bottom } = tableWrapper.getBoundingClientRect() || {};
      const viewportHeight = window.innerHeight;
      const tsmodalFooterHeight = document.querySelector('.tsmodal-footer')?.clientHeight || 0;
      const tssliderFooterHeight = document.querySelector('.tsslider-footer')?.clientHeight || 0;

      // 计算自定义滚动条的宽度
      const scrollbarWidth = containerWidth * (containerWidth / scrollWidth);
      scrollBar.style.width = `${scrollbarWidth}px`;

      if (scrollWidth > containerWidth) {
        customScrollbar.style.display = 'block';
        customScrollbar.style.width = `${scrollWidth}px`;

        // 检查表格容器底部是否在可视区域
        const tableSrcollHeight = bottom;
        const tableHeight = tableSrcollHeight - viewportHeight;
        const tableViewHeight = tableWrapper.clientHeight - tableHeight;
        console.log('高度', tsmodalFooterHeight, tssliderFooterHeight, tableViewHeight);

        if (bottom > viewportHeight && tableSrcollHeight > viewportHeight && tableHeight) {
          // 表格容器底部不在可视区域内，固定滚动条在视口底部
          customScrollbar.style.position = 'absolute';
          customScrollbar.style.top = `${tsmodalFooterHeight ? tableViewHeight - tsmodalFooterHeight - 89 : tssliderFooterHeight > 0 ? tableViewHeight - tssliderFooterHeight - 21 : tableViewHeight - 18}px`;
        } else {
          // 表格容器底部在可视区域内，滚动条在容器底部
          customScrollbar.style.display = 'none';
        }

        // 滚动事件的逻辑
        function onScroll() {
          // 使用 requestAnimationFrame 平滑更新滚动条位置
          requestAnimationFrame(() => {
            const scrollLeft = tableWrapper.scrollLeft; // 水平滚动偏移量
            const maxScrollLeft = scrollWidth - containerWidth; // 滚动条最大滚动距离
            const scrollPercent = maxScrollLeft > 0 ? scrollLeft / maxScrollLeft : 0; // 最大滚动范围的位置
            const scrollbarWidth = containerWidth * (containerWidth / scrollWidth);
            // 更新滚动条位置
            scrollBar.style.transform = `translateX(${scrollPercent * (scrollWidth - scrollbarWidth)}px)`;
          });
        }

        // 添加滚动事件监听
        tableWrapper.addEventListener('scroll', onScroll);

        // 拖动滚动条的逻辑
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
            // 使用 requestAnimationFrame 平滑更新滚动条位置
            requestAnimationFrame(() => {
              const dx = e.pageX - startX;
              const maxScrollLeft = scrollWidth - containerWidth;
              const newScrollLeft = scrollStartX + (dx / (containerWidth - scrollBar.clientWidth)) * maxScrollLeft;
              tableWrapper.scrollLeft = Math.max(0, Math.min(newScrollLeft, maxScrollLeft));
            });
          }
        }

        function onMouseUp() {
          isDragging = false;
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        }
        scrollBar.addEventListener('mousedown', onMouseDown);

        // 清理事件监听器
        tableWrapper.__scrollHandler__ = { onScroll, onMouseDown, onMouseMove, onMouseUp };
      } else {
        // 隐藏自定义滚动条
        customScrollbar.style.display = 'none';
      }
    });
  }

  function hideCustomScrollbar() {
    const elements = [document.querySelector('.ivu-layout-content'), document.querySelector('.tsmodal-content'), document.querySelector('.tsslider-body'), document.querySelector('.tscontain-body')];
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
        element.addEventListener('scroll', handleScroll, false);
      }
    });
  }

  updateCustomScrollbar();
  window.addEventListener('resize', updateCustomScrollbar); // 在窗口调整大小时更新自定义滚动条
  hideCustomScrollbar(); // 拖动滚动条的时候隐藏自定义滚动条，拖放停止后显示

  // 返回销毁函数
  return function destroy() {
    const { onScroll, onMouseDown, onMouseMove, onMouseUp } = tableWrapper.__scrollHandler__ || {};
    if (customScrollbar) {
      tableWrapper.removeChild(customScrollbar);
    }
    if (onScroll) {
      tableWrapper.removeEventListener('scroll', onScroll);
    }
    if (onMouseDown && tableWrapper.querySelector('.scroll-bar')) {
      tableWrapper.querySelector('.scroll-bar').removeEventListener('mousedown', onMouseDown);
    }
    window.removeEventListener('resize', updateCustomScrollbar);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    const elements = [document.querySelector('.ivu-layout-content'), document.querySelector('.tsmodal-content'), document.querySelector('.tsslider-body')];
    elements.forEach(element => {
      if (element) {
        element.removeEventListener('scroll', hideCustomScrollbar, false);
      }
    });
  };
}
