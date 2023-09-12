import React, { useRef } from "react";
import { ReactWorkFlowProps, ReactWorkFlowRefType } from "../../types";
import cc from "classcat";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ReactFlowProvider from "../../components/ReactFlowProvider";
import { useCanvas } from "../../hooks/useCanvas";
const flowStyle = {}

const ReactWorkFlow = React.forwardRef<ReactWorkFlowRefType, ReactWorkFlowProps>(({ className, style, children }, ref) => {
  const flowRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const canvasContext = useCanvas({
    rootRef: rootRef,
    ref: flowRef,
  });
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
