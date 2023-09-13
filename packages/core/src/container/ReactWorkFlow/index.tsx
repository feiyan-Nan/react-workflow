import React, { useMemo, useRef } from "react";
import { ReactWorkFlowProps, ReactWorkFlowRefType } from "../../types";
import cc from "classcat";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ReactFlowProvider from "../../components/ReactFlowProvider";
import { useCanvas } from "../../hooks/useCanvas";
import { useDragScroll } from "../../hooks/useDragScroll";

const ReactWorkFlow = React.forwardRef<ReactWorkFlowRefType, ReactWorkFlowProps>(({ className, style, children }, ref) => {
  const flowRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const canvasContext = useCanvas({
    rootRef: rootRef,
    ref: flowRef,
  });
  // 拖拽滚动
  useDragScroll({
    rootRef,
    size: canvasContext.size,
    scrollBounds: canvasContext.scrollBounds,
    scroll: canvasContext.scroll,
    scrollThreshold: 100,
    maxSpeed: 5,
    scrollBy: canvasContext.scrollBy,
    mouseScroll: true,
    // scrollRate: 20, // 去掉滚动更加流畅
  });
  const flowStyle = useMemo(() => {
    return {
      transform: `translate(${canvasContext.scroll.left}px, ${canvasContext.scroll.top}px) scale(${canvasContext.scale})`,
    };
  }, [canvasContext.scroll.left, canvasContext.scroll.top, canvasContext.scale]);
  const onMainClick = () => {
    console.log('onMainClick')
  };
  const contentStyle = {}
  return (
    <div style={style} className={cc(["react-work_flow", className])}>
      <DndProvider backend={HTML5Backend}>
        <ReactFlowProvider>
          <div ref={rootRef} className="previewBlock" style={contentStyle} onClick={onMainClick}>
            {children}
            <div ref={flowRef} className='previewContent' style={flowStyle}>
              <div style={{height: '2000px'}}></div>
              {/*{useMemo(*/}
              {/*  () => (*/}
              {/*    <FlowEditor Nodes={nodes} />*/}
              {/*  ),*/}
              {/*  [nodes, nodeErrorList, errorList, initNodesData],*/}
              {/*)}*/}
            </div>
            1234567
          </div>
        </ReactFlowProvider>
      </DndProvider>
    </div>
  );
});

ReactWorkFlow.displayName = "FlowWorkFlow";
export default ReactWorkFlow;
