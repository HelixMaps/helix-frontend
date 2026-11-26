"use client";

import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { useReactFlow, Handle, Position, NodeResizer } from "@xyflow/react";
import { StickyNote, GripHorizontal } from "lucide-react";

function NoteNode({ id, data, selected, width, height }) {
  const { setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(Boolean(data?.isEditing));
  const [text, setText] = useState(data?.label ?? data?.text ?? "");
  const textareaRef = useRef(null);

  const isReadOnly = Boolean(data?.isReadOnly);

  // Sync external label changes
  useEffect(() => {
    setText(data?.label ?? data?.text ?? "");
  }, [data?.label, data?.text]);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Place cursor at end of text
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  const commitChange = useCallback(
    (newText) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === id) {
            return {
              ...n,
              data: {
                ...n.data,
                label: newText,
                text: newText,
                isEditing: false,
              },
            };
          }
          return n;
        })
      );
    },
    [id, setNodes]
  );

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    commitChange(text);
  }, [commitChange, text]);

  const handleChange = useCallback((e) => {
    setText(e.target.value);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      // Prevent React Flow canvas from capturing Backspace, Delete, Space, etc.
      e.stopPropagation();

      if (e.key === "Escape") {
        setIsEditing(false);
        commitChange(text);
      }
    },
    [commitChange, text]
  );

  const handleDoubleClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (!isReadOnly) {
        setIsEditing(true);
      }
    },
    [isReadOnly]
  );

  const handleResizeEnd = useCallback(
    (_, params) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === id) {
            return {
              ...n,
              style: {
                ...n.style,
                width: params.width,
                height: params.height,
              },
            };
          }
          return n;
        })
      );
    },
    [id, setNodes]
  );

  return (
    <div
      className={`group relative w-full h-full min-w-[140px] min-h-[60px] select-none transition-all duration-150 ${
        selected
          ? "border border-dashed border-white/40 rounded-xl"
          : "border border-transparent hover:border-dashed hover:border-white/15 rounded-xl"
      }`}
      style={{
        background: "transparent",
        backgroundColor: "transparent",
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Interactive Region Resizer */}
      <NodeResizer
        isVisible={selected && !isReadOnly}
        minWidth={120}
        minHeight={50}
        handleClassName="!w-2.5 !h-2.5 !bg-white !border-2 !border-zinc-900 !rounded-full shadow-lg hover:!scale-150 transition-transform"
        lineClassName="!border-white/30 !border-dashed"
        onResizeEnd={handleResizeEnd}
      />

      {/* Optional subtle drag grip on hover/selection */}
      {selected && !isReadOnly && (
        <div
          className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-900/90 border border-white/10 text-white/50 text-[10px] font-mono cursor-grab active:cursor-grabbing select-none pointer-events-auto"
          title="Drag to reposition note"
        >
          <GripHorizontal size={11} className="text-white/60" />
          <span>Note Region</span>
        </div>
      )}

      {/* Main Content Area: Pure transparent background with stylish white handwriting */}
      <div className="w-full h-full p-2.5 flex flex-col justify-start overflow-hidden">
        {isEditing && !isReadOnly ? (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Type your note here..."
            className="nodrag nowheel w-full h-full bg-transparent text-white font-note text-2xl leading-relaxed outline-none resize-none border-none p-0 m-0 placeholder:text-white/30 selection:bg-white/25 select-text canvas-note-shadow overflow-y-auto scrollbar-none"
            style={{
              background: "transparent",
              color: "#ffffff",
            }}
          />
        ) : (
          <div
            onClick={() => !isReadOnly && setIsEditing(true)}
            className="w-full h-full cursor-text select-text overflow-hidden"
          >
            {text && text.trim().length > 0 ? (
              <p className="font-note text-2xl text-white whitespace-pre-wrap leading-relaxed break-words canvas-note-shadow select-text m-0">
                {text}
              </p>
            ) : (
              <p className="font-note text-2xl text-white/35 italic select-none m-0">
                {isReadOnly ? "" : "Click to type note..."}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Discreet connection handles on all 4 borders */}
      <Handle
        type="target"
        position={Position.Top}
        id="target-top"
        isConnectable={!isReadOnly}
        className="!w-2 !h-2 !bg-white/60 !border-none !rounded-full !opacity-0 group-hover:!opacity-70 hover:!opacity-100 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="source-bottom"
        isConnectable={!isReadOnly}
        className="!w-2 !h-2 !bg-white/60 !border-none !rounded-full !opacity-0 group-hover:!opacity-70 hover:!opacity-100 transition-opacity"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="target-left"
        isConnectable={!isReadOnly}
        className="!w-2 !h-2 !bg-white/60 !border-none !rounded-full !opacity-0 group-hover:!opacity-70 hover:!opacity-100 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="source-right"
        isConnectable={!isReadOnly}
        className="!w-2 !h-2 !bg-white/60 !border-none !rounded-full !opacity-0 group-hover:!opacity-70 hover:!opacity-100 transition-opacity"
      />
    </div>
  );
}

export default memo(NoteNode);
