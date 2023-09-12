import React from "react";
import { ReactWorkFlowProps, ReactWorkFlowRefType } from "../../types";
import cc from "classcat";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";


const ReactWorkFlow = React.forwardRef<ReactWorkFlowRefType, ReactWorkFlowProps>(({ className, style }, ref) => {
  return (
    <div style={style} className={cc(["react-work_flow", className])}>
      <DndProvider backend={HTML5Backend}>
        123
      </DndProvider>
    </div>
  );
});

ReactWorkFlow.displayName = "FlowWorkFlow";
export default ReactWorkFlow;
