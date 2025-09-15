// File: app/components/SortableItem.tsx
"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableItem(props: { id: string, rank: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="p-4 bg-gray-50 border rounded-lg shadow-sm flex items-center space-x-4 touch-none">
      <span className="text-lg font-bold text-indigo-600 w-6 text-center">{props.rank}</span>
      <span className="font-medium text-gray-800">{props.id}</span>
    </div>
  );
}