import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function BankConnectionDialog({ trigger }: {
  trigger?: ReactNode;
  bankSignIn?: boolean;
  onDone?: () => void;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="outline"><Plus />Connect a bank</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bank connection unavailable</DialogTitle>
          <DialogDescription>Choose a PNC demo customer to explore the accounts loaded in SpacetimeDB.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
