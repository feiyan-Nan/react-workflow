import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEventListener, useMemoizedFn, useSize } from 'ahooks';
import { shallow } from 'zustand/shallow';
import { useStore } from './useStore';
import { ReactFlowState } from '../types';

interface Position {
  x: number;
  y: number;
}

export interface Delta {
  left: number;
  top: number;
}

export interface CanvasContext {
  size?: Size;
  scroll: Delta;
  scrollBounds: Delta;
  scrollBy: (delta: Delta) => void;
}

export interface Size {
  width?: number;
  height?: number;
}

interface IProps {
  rootRef: React.RefObject<HTMLDivElement>;
  ref: React.RefObject<HTMLDivElement>;
}

const selector = (s: ReactFlowState) => ({ scale: s.scale, scroll: s.scroll, setScroll: s.setScroll });

/**
 * 画布缩放拖拽逻辑
 * @param ref 缩放拖拽目标
 * @returns
 */

export function useCanvas({ rootRef, ref }: IProps): CanvasContext {
  const { scale, scroll, setScroll } = useStore(selector, shallow);
  // 当前滚动状态
  const size = useSize(rootRef);
  const nodesSize = useSize(ref);
  // 滚动边界（向上及向左滚动的最大范围）
  const [scrollBounds, setScrollBounds] = useState({ left: 0, top: 0 });

  // 拖拽事件
  const [isDrag, setIsDrag] = useState(false);

  const scrollBy = useMemoizedFn((delta: Delta) => {
    setScroll((oldValue) => {
      const hMeetBounds = oldValue.left >= 0 || oldValue.left <= scrollBounds.left;
      const vMeetBounds = oldValue.top >= 0 || oldValue.top <= scrollBounds.top;

      const newLeft = oldValue.left + delta.left;
      const newTop = oldValue.top + delta.top;
      const hMeetBoundsNew = newLeft >= 0 || newLeft <= scrollBounds.left;
      const vMeetBoundsNew = newTop >= 0 || newTop <= scrollBounds.top;
      if (hMeetBounds && vMeetBounds && hMeetBoundsNew && vMeetBoundsNew) {
        return oldValue;
      }
      const left = Math.max(Math.min(oldValue.left + delta.left, 0), scrollBounds.left);
      const top = Math.max(Math.min(oldValue.top + delta.top, 0), scrollBounds.top);
      if (oldValue.top === top && oldValue.left === left) {
        return oldValue;
      }

      return {
        left,
        top,
      };
    });
  });

  /* ========= 滚轮滚动 START ========= */
  // 滚轮事件
  // 用来标记横向滚动
  const [shiftKey, setShitKey] = useState(false);
  // fix: windows系统shift+鼠标滚轮=横向滚动
  const onKeydown = useCallback((e: KeyboardEvent) => {
    if (e.key != 'Shift') return;
    setShitKey(true);
  }, []);

  const onKeyup = useCallback((e: KeyboardEvent) => {
    if (e.key != 'Shift') return;
    setShitKey(false);
  }, []);
  const onWheelHandle = useCallback(
    (e: WheelEvent) => {
      // fix: 禁止触发浏览器双指swipe页面逻辑
      e.preventDefault();
      // 滚轮向上/向左是正值，需要反向转换
      let deltaX = -e.deltaX;
      let deltaY = -e.deltaY;
      // fix: windows系统下shift无法激活deltaX
      if (shiftKey && !e.deltaX) {
        deltaX = -e.deltaY;
        deltaY = 0;
      }
      scrollBy({ left: deltaX, top: deltaY });
    },
    [shiftKey, scrollBy]
  );
  useEventListener('keydown', onKeydown, {
    passive: true,
  });
  useEventListener('keyup', onKeyup, {
    passive: true,
  });
  useEventListener('wheel', onWheelHandle, {
    target: rootRef,
    passive: false,
    capture: false,
  });
  /* ========== 滚轮滚动 END ========== */

  /* ========= 拖拽移动 START ========= */
  const onMouseDown = useCallback(
    (e: MouseEvent) => {
      // fix: 禁止鼠标非左键触发拖拽
      if (e.target !== rootRef.current || e.buttons != 1) return;
      setIsDrag(true);
    },
    [rootRef]
  );
  const onMouseUp = useCallback(() => {
    setIsDrag(false);
  }, []);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDrag) return;

      scrollBy({ left: e.movementX, top: e.movementY });
    },
    [isDrag, scrollBy]
  );
  useEventListener('mousedown', onMouseDown, {
    target: rootRef,
    passive: true,
  });
  useEventListener('mousemove', onMouseMove, {
    target: document,
    passive: true,
  });
  useEventListener('mouseup', onMouseUp, {
    target: document,
    passive: true,
  });
  /* ========== 拖拽移动 END ========== */

  /* ========= 监听画布缩放和内容区域变化 START ========= */
  useEffect(() => {
    if (!ref.current) return;
    const nodesScrollWidth = ref.current.scrollWidth;
    const nodesScrollHeight = ref.current.scrollHeight;
    const visibleWidth = nodesScrollWidth * scale;
    const visibleHeight = nodesScrollHeight * scale;

    const newScrollBounds = {
      left: Math.min(-(visibleWidth - ((size?.width || 0) * 2) / 3), 0),
      top: Math.min(-(visibleHeight - ((size?.height || 0) * 2) / 3), 0),
    };
    setScrollBounds(newScrollBounds);
    const left = Math.max(Math.min(scroll.left, 0), newScrollBounds.left);
    const top = Math.max(Math.min(scroll.top, 0), newScrollBounds.top);

    // // 滚动边界变更后，修正当前滚动状态以免超出边界
    // const newScroll = {
    //   left: Math.max(Math.min(scroll.left, 0), newScrollBounds.left),
    //   top: Math.max(Math.min(scroll.top, 0), newScrollBounds.top),
    // };
    setScroll((prev) => {
      if (prev.top === top && prev.left === left) {
        return prev;
      }
      return { left, top };
    });
  }, [scale, nodesSize]);
  /* ========== 监听画布缩放和内容区域变化 END ========== */

  return useMemo(
    () => ({
      size,
      scroll,
      scrollBounds,
      scrollBy,
    }),
    [size, scroll, scrollBounds, scrollBy]
  );
}
