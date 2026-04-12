import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { DbTransaction } from "@/hooks/useTransactions";
import { useUpdateTransaction, useDeleteTransaction } from "@/hooks/useTransactions";
import { useIsAdmin } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";

const CATEGORIES = ["Retail", "Food & Dining", "Gas & Transport", "Entertainment", "ATM Withdrawal", "Wire Transfer", "Online Purchase", "Cryptocurrency"];

interface TransactionActionsProps {
  txn: DbTransaction;
}

export function TransactionActions({ txn }: TransactionActionsProps) {
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const updateTxn = useUpdateTransaction();
  const deleteTxn = useDeleteTransaction();

  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit form state
  const [editAmount, setEditAmount] = useState("");
  const [editMerchant, setEditMerchant] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("");

  const isOwner = user?.id === txn.user_id;
  const canModify = isOwner || isAdmin;

  const openEdit = () => {
    setEditAmount(String(txn.amount));
    setEditMerchant(txn.merchant);
    setEditLocation(txn.location);
    setEditCategory(txn.category);
    setEditDescription(txn.description || "");
    setEditStatus(txn.status);
    setShowEdit(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Amount must be a positive number");
      return;
    }
    if (!editMerchant.trim()) {
      toast.error("Merchant is required");
      return;
    }
    try {
      await updateTxn.mutateAsync({
        id: txn.id,
        amount,
        merchant: editMerchant.trim(),
        location: editLocation.trim(),
        category: editCategory,
        description: editDescription.trim(),
        status: editStatus,
      });
      toast.success("Transaction updated successfully");
      setShowEdit(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update transaction");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTxn.mutateAsync(txn.id);
      toast.success("Transaction deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete transaction");
    }
  };

  if (!canModify) return null;

  return (
    <>
      <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={openEdit}
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
          title="Edit transaction"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
          title="Delete transaction"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Transaction</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Merchant</Label>
                <Input
                  required
                  value={editMerchant}
                  onChange={(e) => setEditMerchant(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="safe">Safe</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                    <SelectItem value="fraud">Fraud</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>
            <Button type="submit" className="w-full" disabled={updateTxn.isPending}>
              {updateTxn.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the transaction for <strong>{txn.merchant}</strong> ({new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(txn.amount)}). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
