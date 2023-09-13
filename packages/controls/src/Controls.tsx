import { type FC, memo, type PropsWithChildren, useEffect, useMemo, useState } from 'react';
import cc from 'classcat';
import { shallow } from 'zustand/shallow';
import { Panel, type ReactFlowState, useStore } from '@reactflow/core';

import PlusIcon from './Icons/Plus';
import MinusIcon from './Icons/Minus';
import FitviewIcon from './Icons/FitView';
import ControlButton from './ControlButton';

import type { ControlProps } from './types';

const selector = (s: ReactFlowState) => ({
  isInteractive: s.nodesDraggable || s.nodesConnectable || s.elementsSelectable,
  minZoomReached: s.transform[2] <= s.minZoom,
  maxZoomReached: s.transform[2] >= s.maxZoom,
  setScale: s.setScale,
  scale: s.scale,
  setScroll: s.setScroll,
});

const Controls: FC<PropsWithChildren<ControlProps>> = ({
  style,
  showZoom = true,
  showFitView = true,
  onZoomIn,
  onZoomOut,
  onFitView,
  className,
  children,
  position = 'bottom-right',
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const { setScale, scale, setScroll } = useStore(selector, shallow);
  const minZoomReached = useMemo(() => {
    return scale <= 0.25;
  }, [scale]);

  const maxZoomReached = useMemo(() => {
    return scale >= 1.25;
  }, [scale]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (!isVisible) {
    return null;
  }

  const onZoomInHandler = () => {
    setScale(Math.min(scale + 0.25, 1.25));
    onZoomIn?.();
  };

  const onZoomOutHandler = () => {
    setScale(Math.max(scale - 0.25, 0.25));
    onZoomOut?.();
  };

  const onFitViewHandler = () => {
    setScale(1);
    setScroll({ left: 0, top: 0 });
    onFitView?.();
  };

  return (
    <Panel
      className={cc(['react-flow__controls', className])}
      position={position}
      style={style}
      data-testid="rf__controls"
    >
      {showFitView && (
        <ControlButton
          className="react-flow__controls-fitview"
          onClick={onFitViewHandler}
          title="fit view"
          aria-label="fit view"
        >
          <FitviewIcon />
        </ControlButton>
      )}
      {showZoom && (
        <>
          <ControlButton
            onClick={onZoomOutHandler}
            className="react-flow__controls-zoomout"
            title="zoom out"
            aria-label="zoom out"
            disabled={minZoomReached}
          >
            <MinusIcon />
          </ControlButton>
          <span className="react-flow__controls-number">{scale * 100}%</span>
          <ControlButton
            onClick={onZoomInHandler}
            className="react-flow__controls-zoomin"
            title="zoom in"
            aria-label="zoom in"
            disabled={maxZoomReached}
          >
            <PlusIcon />
          </ControlButton>
        </>
      )}
      {children}
    </Panel>
  );
};

Controls.displayName = 'Controls';

export default memo(Controls);
