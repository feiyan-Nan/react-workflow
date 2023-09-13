import { useCallback, useRef, useState } from 'react';
import { useEventListener } from 'ahooks';
import { delay, sortBy } from 'lodash';
import { Delta, Size } from './useCanvas';

interface Position {
  x: number;
  y: number;
}

interface RelativeInTarget {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type Direction = 'left' | 'top' | 'right' | 'bottom';
type ScrollBoundaryState = {
  [key in Direction]: boolean;
};

interface IProps {
  // 响应拖拽事件的目标
  size?: Size;
  scroll: Delta;
  scrollBounds: Delta;
  rootRef: React.RefObject<HTMLElement>;
  // 触发滚动时，边缘距离至少为xx
  scrollThreshold?: number;
  // 单次滚动的最大像素数
  maxSpeed?: number;
  // 单次滚动的最小像素数
  minSpeed?: number;
  // 每隔xx 毫秒滚动1次
  scrollRate?: number;
  // 是否以鼠标位置为判断依据，默认以当前拖拽节点边界为判断依据
  mouseScroll?: boolean;
  scrollBy: (delta: Delta) => void;
}

/**
 * 元素拖拽到边缘触发滚动的逻辑
 * @param rootRef: React.RefObject<HTMLElement>;响应拖拽事件的目标
 * @param size  根容器尺寸;
 * @param scroll  滚动距离;
 * @param scrollBounds  滚动边界;
 * @param scrollThreshold?: number; 触发滚动时，边缘距离至少为xx
 * @param maxSpeed?: number; 单次滚动的最大像素数
 * @param minSpeed?: number; 单次滚动的最小像素数
 * @param scrollRate?: number; 每隔xx 毫秒滚动1次
 * @param mouseScroll?: boolean; 是否以鼠标位置为判断依据，默认以当前拖拽节点边界为判断依据
 */
export function useDragScroll({
  rootRef,
  // scrollRef,
  size,
  scroll,
  scrollBounds,
  scrollBy,

  scrollThreshold = 150,
  maxSpeed = 4,
  minSpeed = 1,
  scrollRate = 5,
  mouseScroll = false,
}: IProps) {
  // 单词滚动距离上下限
  const [timers, setTimers] = useState<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.forEach(id => clearTimeout(id));
  }, [timers]);

  // 当前滚动状态
  // const scroll = useScroll(scrollRef);
  // 容器的尺寸
  // const size = useSize(scrollRef);

  // 鼠标在拖拽目标中的相对位置
  const [mouseInTarget, setMouseInTarget] = useState<RelativeInTarget>({ left: 0, top: 0, right: 0, bottom: 0 });
  // 容器相对视窗的位置
  const [rootInfo, setRootInfo] = useState<Rect>();
  const lastTimeRef = useRef(0);

  // 计算需要滚动的距离
  const calcScrollDelta = useCallback(
    (position: Position, size: Size, boundaryState: ScrollBoundaryState) => {
      // 距离边缘150时即可触发滚动
      if (!size.width || !size.height) return;
      const threshold = Math.min(scrollThreshold, size.width / 2);
      let distanceArr: { value: number; direction: Direction }[] = [
        { value: position.x - mouseInTarget.left - threshold, direction: 'left' },
        { value: position.y - mouseInTarget.top - threshold, direction: 'top' },
        { value: size.width - mouseInTarget.right - position.x - threshold, direction: 'right' },
        { value: size.height - mouseInTarget.bottom - position.y - threshold, direction: 'bottom' },
      ];
      // 考虑是否触达边界
      distanceArr = distanceArr.map(item => {
        return {
          value: item.value *= +!boundaryState[item.direction],
          direction: item.direction,
        };
      });
      // 排序
      distanceArr = sortBy(distanceArr, ['value']);

      const { value, direction } = distanceArr[0];
      // 不在可滚动范围内
      if (value >= 0) return;
      // scrollRate 间隔内滚动的距离范围
      const maxSpeedValue = 30 - scrollThreshold; // 距离边界小于30即时最大速度
      const speed =
        value < maxSpeedValue ? maxSpeed : Math.min(maxSpeed, Math.round(minSpeed + ((maxSpeed - minSpeed) * value) / maxSpeedValue));

      let deltaX = 0;
      let deltaY = 0;
      switch (direction) {
        case 'left':
          deltaX = speed;
          break;
        case 'right':
          deltaX = -speed;
          break;
        case 'top':
          deltaY = speed;
          break;
        case 'bottom':
          deltaY = -speed;
          break;
      }

      return {
        x: deltaX,
        y: deltaY,
      };
    },
    [mouseInTarget],
  );

  const onDragStart = useCallback(
    (e: DragEvent) => {
      // 获取容器离文档的距离
      const rect = rootRef.current?.getBoundingClientRect();

      // EventTarget类型没有继承HTMLElement的属性，需要做类型断言
      const target = e.target as HTMLElement;
      const bounding = target?.getBoundingClientRect();

      const rootInfo = {
        x: rect?.left || 0,
        y: rect?.top || 0,
        width: rect?.width || 0,
        height: rect?.height || 0,
      };
      // 获取
      setRootInfo(rootInfo);

      if (!mouseScroll) {
        setMouseInTarget({
          left: e.clientX - bounding.left,
          top: e.clientY - bounding.top,
          right: bounding.right - e.clientX,
          bottom: bounding.bottom - e.clientY,
        });
      }
    },
    [rootRef, mouseScroll],
  );

  const onDrag = useCallback(
    (e: DragEvent) => {
      if (!rootInfo) return;
      const now = new Date().getTime();
      if (!lastTimeRef.current) {
        lastTimeRef.current = now;
        return;
      }

      const dur = now - lastTimeRef.current;
      lastTimeRef.current = now;
      // 鼠标位置相对于根容器
      const position = {
        x: e.clientX - (rootInfo?.x || 0),
        y: e.clientY - (rootInfo?.y || 0),
      };
      // 间隔太短不予处理以免视觉抖动
      if (dur < scrollRate) return;
      // 检测是否到达滚动边界
      const boundaryState: ScrollBoundaryState = {
        left: scroll.left == 0,
        top: scroll.top == 0,
        right: scroll.left <= scrollBounds.left,
        bottom: scroll.top <= scrollBounds.top,
      };
      const delta = calcScrollDelta(position, size!, boundaryState);
      if (!delta) {
        return;
      }
      // 清除旧的定时器
      clearTimers();
      // 间隔越长，执行次数越多
      let count = Math.round(dur / scrollRate);
      const timeid = [];
      while (count-- > 0) {
        timeid.push(delay(scrollBy, scrollRate * count, { left: delta.x, top: delta.y }));
      }
      setTimers(timeid);
      // 保存timeid历史
    },
    [lastTimeRef, size, scrollBounds, scroll, rootInfo, calcScrollDelta, scrollBy, clearTimers],
  );

  useEventListener('dragstart', onDragStart, {
    target: rootRef,
  });
  useEventListener('dragover', onDrag, {
    target: rootRef,
  });
}
