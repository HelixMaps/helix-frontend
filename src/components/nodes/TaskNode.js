import React from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { CheckSquare } from "lucide-react";
import { useMapConfig } from "@/context/MapConfigContext";

export default function TaskNode({ id, data, selected }) {
  const { setNodes } = useReactFlow();
  const { nodeShape } = useMapConfig();

  const shapeClasses = {
    rounded: "rounded-xl px-4",
    pill: "rounded-full px-6 py-2.5",
    sharp: "rounded-none px-4",
    leaf: "rounded-[20px_4px_20px_4px] px-4",
    asymmetric: "rounded-[4px_20px_4px_20px] px-4",
  };

  const activeShapeClass = shapeClasses[nodeShape] || "rounded-xl px-4";

  const onChange = (e) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            data: {
              ...n.data,
              label: e.target.value,
            },
          };
        }
        return n;
      })
    );
  };

  const onBlur = () => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            data: {
              ...n.data,
              isEditing: false,
            },
          };
        }
        return n;
      })
    );
  };

  const handleKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      onBlur();
    }
  };

  return (
    <div className={`py-3 border-2 bg-zinc-950/95 text-zinc-100 flex items-center gap-3 min-w-[160px] shadow-lg transition-all duration-200 ${activeShapeClass} ${
      selected ? "border-emerald-500 shadow-emerald-500/30 scale-[1.02]" : "border-zinc-800 hover:border-zinc-700"
    }`}>
      {/* Target Handles */}
      <Handle type="target" position={Position.Left} id="target-left" className="!bg-emerald-400/80 !w-2.5 !h-2.5 !border-zinc-950" />
      <Handle type="target" position={Position.Top} id="target-top" className="!bg-emerald-400/80 !w-2.5 !h-2.5 !border-zinc-950" />
      
      {/* Icon */}
      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckSquare size={18} />
      </div>
      
      {/* Content */}
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider select-none">Task</span>
        {data.isEditing ? (
          <input
            type="text"
            value={data.label || ""}
            onChange={onChange}
            onBlur={onBlur}
            onKeyDown={handleKeyDown}
            className="nodrag bg-transparent border-none outline-none text-sm font-semibold text-zinc-200 focus:ring-0 p-0 m-0 w-full"
            placeholder="New Task"
            autoFocus
          />
        ) : (
          <span className="text-sm font-semibold text-zinc-200 truncate select-none">
            {data.label || "New Task"}
          </span>
        )}
      </div>

      {/* Source Handles */}
      <Handle type="source" position={Position.Right} id="source-right" className="!bg-emerald-400/80 !w-2.5 !h-2.5 !border-zinc-950" />
      <Handle type="source" position={Position.Bottom} id="source-bottom" className="!bg-emerald-400/80 !w-2.5 !h-2.5 !border-zinc-950" />
    </div>
  );
}
