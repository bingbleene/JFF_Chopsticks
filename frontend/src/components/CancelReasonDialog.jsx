import { CircleFadingPlusIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import React, { useState } from "react";

export default function CancelImportDialog({ onConfirm, open, onOpenChange, type = "import" }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("Bạn phải nhập lý do huỷ!");
      return;
    }
    setError("");
    onConfirm(reason);
    setReason("");
  };

  // Tùy theo loại, đổi tiêu đề và mô tả
  const title = type === "invoice" ? "Huỷ hóa đơn này?" : "Huỷ phiếu nhập này?";
  const description = type === "invoice"
    ? "Vui lòng nhập lý do huỷ hóa đơn này."
    : "Vui lòng nhập lý do huỷ phiếu nhập này.";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea
          placeholder="Nhập lý do huỷ..."
          value={reason}
          onChange={e => setReason(e.target.value)}
          className="mt-2"
        />
        {error && <div className="text-xs text-destructive mt-1">{error}</div>}
        <AlertDialogFooter>
          <AlertDialogAction asChild>
            <Button onClick={handleConfirm} variant="destructive">Xác nhận huỷ</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 rounded-md p-1 text-muted-foreground hover:bg-accent focus:outline-none"
          aria-label="Đóng"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </AlertDialogContent>
    </AlertDialog>
  );
}
