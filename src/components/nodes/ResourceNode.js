"use client";

import React, { memo, useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import { Link2 } from "lucide-react";
import ThreeDimensionalCard from "./ThreeDimensionalCard";

function ResourceNode({ id, data, selected }) {
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
      type="resource"
      label={data?.label || ""}
      typeLabel="Resource"
      icon={Link2}
      accentColor="amber"
      elevation={data?.elevation ?? 70}
      isEditing={Boolean(data?.isEditing)}
      selected={selected}
      onLabelChange={onChange}
      onLabelBlur={onBlur}
      onLabelKeyDown={handleKeyDown}
    />
  );
}

export default memo(ResourceNode);
