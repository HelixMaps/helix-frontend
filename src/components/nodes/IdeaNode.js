"use client";

import React from "react";
import { useReactFlow } from "@xyflow/react";
import { Lightbulb } from "lucide-react";
import ThreeDimensionalCard from "./ThreeDimensionalCard";

export default function IdeaNode({ id, data, selected }) {
  const { setNodes } = useReactFlow();

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
    <ThreeDimensionalCard
      id={id}
      type="idea"
      label={data?.label || ""}
      typeLabel="Idea"
      icon={Lightbulb}
      accentColor="blue"
      elevation={data?.elevation ?? 55}
      isEditing={Boolean(data?.isEditing)}
      selected={selected}
      onLabelChange={onChange}
      onLabelBlur={onBlur}
      onLabelKeyDown={handleKeyDown}
    />
  );
}
