import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';
import type { PanelPosition } from '@reactflow/core';

export type ControlProps = HTMLAttributes<HTMLDivElement> & {
  showZoom?: boolean;
  showFitView?: boolean;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
  position?: PanelPosition;
};

export type ControlButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
