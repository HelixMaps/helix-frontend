"use client";

import React, { memo, useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import { Lightbulb } from "lucide-react";
import ThreeDimensionalCard from "./ThreeDimensionalCard";

function IdeaNode({ id, data, selected }) {
  const { setNodes } = useReactFlow();

  const onChange = useCallback(
    (e) => {
      const newLabel = e.target.value;
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === id) {
            return {
              ...n,
              data: {
                ...n.data,
                label: newLabel,
              },
            };
          }
          return n;
        })
      );
    },
    [id, setNodes]
  );

  const onBlur = useCallback(() => {
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
  }, [id, setNodes]);

  const handleKeyDown = useCallback(
    (e) => {
      e.stopPropagation();
      if (e.key === "Enter") {
        onBlur();
      }
    },
    [onBlur]
  );

  return (
    <ThreeDimensionalCard
      id={id}
      type="idea"
      label={data?.label || ""}
      typeLabel="Idea"
      icon={Lightbulb}
      accentColor="blue"
      elevation={data?.elevation ?? 55}
      isEditing={Boolean(data?.isEditing)}
      isReadOnly={Boolean(data?.isReadOnly)}
      selected={selected}
      onLabelChange={onChange}
      onLabelBlur={onBlur}
      onLabelKeyDown={handleKeyDown}
    />
  );
}

export default memo(IdeaNode);
