import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Users } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/Table";
import {
  getCustomersFromStorage,
  type LocalCustomer,
} from "../lib/local-storage";

/**
 * Customers List Page
 *
 * Loads customer data from localStorage and supports client-side filtering.
 */
export default function IndexPage(): ReactElement {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [customers, setCustomers] = useState<LocalCustomer[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect((): void => {
    // Load persisted customers after mount to avoid hydration mismatch.
    setCustomers(getCustomersFromStorage());
    setIsReady(true);
  }, []);

  const filteredCustomers = useMemo((): LocalCustomer[] => {
    return customers.filter((customer) => {
      const matchesSearch =
        !searchQuery ||
        customer.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchQuery, statusFilter]);

  if (!isReady) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        {[
          "placeholder-1",
          "placeholder-2",
          "placeholder-3",
          "placeholder-4",
        ].map((key) => (
          <Skeleton key={key} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row">
        <div className="max-w-sm flex-1">
          <Input
            type="search"
            placeholder="Filter customers..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
        <div className="w-full sm:w-40">
          <Select
            options={[
              { label: "All Status", value: "all" },
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Status"
          />
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <Users className="h-16 w-16 text-muted-foreground" />
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">No customers found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters to find what you're looking for."
                : "Get started by creating your first customer record."}
            </p>
          </div>
          {!searchQuery && statusFilter === "all" && (
            <Button variant="default" onClick={() => navigate("/customers/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Customer
            </Button>
          )}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="font-semibold text-foreground">
                    {customer.company_name}
                  </div>
                </TableCell>
                <TableCell>
                  {customer.email ? (
                    <span className="font-mono text-xs">{customer.email}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {customer.phone ? (
                    <span className="font-mono text-xs">{customer.phone}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={customer.status === "active" ? "success" : "secondary"}
                    className="gap-1.5"
                  >
                    <span
                      className={
                        customer.status === "active"
                          ? "size-1.5 rounded-full bg-green-600"
                          : "size-1.5 rounded-full bg-gray-400"
                      }
                    />
                    {customer.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {filteredCustomers.length > 0 && (
        <div className="mt-2 text-sm text-muted-foreground">
          {filteredCustomers.length} of {customers.length} customer(s)
        </div>
      )}
    </>
  );
}
