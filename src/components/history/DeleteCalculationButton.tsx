"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteCalculation } from "@/app/actions";
import { Tooltip } from "@/components/Tooltip";

interface DeleteCalculationButtonProps {
  id: string;
}

export default function DeleteCalculationButton({ id }: DeleteCalculationButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this calculation?")) return;
    setIsDeleting(true);
    try {
      await deleteCalculation(id);
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Failed to delete calculation");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Tooltip content="Delete Record" position="top">
      <button 
        onClick={handleDelete}
        disabled={isDeleting}
        className="btn-danger cursor-pointer disabled:opacity-50"
      >
        {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
      </button>
    </Tooltip>
  );
}
