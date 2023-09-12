import React from "react";
import cc from "classcat";
import { ReactFlowState, useStore } from "@reactflow/core";
import { shallow } from "zustand/shallow";
import { BackgroundProps } from "./types";

const selector = (s: ReactFlowState) => ({ scroll: s.scroll, scale: s.scale });

const id = "line";
type DotPatternProps = {
  radius: number;
  color: string;
};


export function DotPattern({ color, radius }: DotPatternProps) {
  return <circle cx={radius} cy={radius} r={radius} fill={color} />;
}

const Background = React.forwardRef(({ style, className }: BackgroundProps, ref: React.ForwardedRef<SVGSVGElement>) => {
  const { scale, scroll } = useStore(selector, shallow);
  console.log(scale, scroll, '哈哈哈');
  return (
    <svg
      className={cc(["react-flow__background", className])}
      style={{
        ...style
        // zIndex: -1,
      }}
      ref={ref}
      data-testid="rf__background"
    >
      <pattern id={id} x={scroll.left} y={scroll.top} width={20 * scale} height={20 * scale}
               patternUnits="userSpaceOnUse">
        <DotPattern color={"rgba(184,190,204,0.5)"} radius={1.5 * scale} />
      </pattern>
      <rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
});

Background.displayName = "Background";
export default React.memo(Background);
