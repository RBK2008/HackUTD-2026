import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCustomerList } from "@/data/api";
import { cn } from "@/lib/utils";

export function CustomerCombobox({ value, onChange, id }: { value: string; onChange: (id: string) => void; id?: string }) {
  const customers = useCustomerList();
  const [open, setOpen] = useState(false);
  const selected = customers.find((customer) => customer.id === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button id={id} variant="outline" role="combobox" aria-expanded={open} className="h-auto min-h-10 w-full justify-between whitespace-normal text-left">
          <span>{selected?.name ?? "Choose a demo customer"}</span><ChevronsUpDown className="ml-2 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search customers…" />
          <CommandList><CommandEmpty>No customer found.</CommandEmpty><CommandGroup>
            {customers.map((customer) => (
              <CommandItem key={customer.id} value={`${customer.id} ${customer.name}`} onSelect={() => { onChange(customer.id); setOpen(false); }} className="items-start py-2.5">
                <Check className={cn("mt-0.5", value === customer.id ? "opacity-100" : "opacity-0")} />
                <span className="min-w-0 flex-1"><span className="block font-medium">{customer.name}</span><span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-good" />{customer.health.good} good</span><span>·</span>
                  <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-watch" />{customer.health.watch} watch</span><span>·</span>
                  <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-risk" />{customer.health.risk} risk</span>
                </span></span>
              </CommandItem>
            ))}
          </CommandGroup></CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
