import { validateParentSession } from "@/lib/parentAuth";
import { createClient } from "@supabase/supabase-js";
import { CreditCard } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParentAppShell } from "@/components/parent/ParentAppShell";

export default async function ParentFeesPage() {
  const { student, hasMultipleChildren } = await validateParentSession();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const classNameStr = student.classes?.name
    ? `${student.classes.name}${student.classes.division ? ` (${student.classes.division})` : ""}`
    : "Unassigned Class";

  // Fetch all fee records for this child only
  const { data: feeRecords } = await supabase
    .from("fees")
    .select("*")
    .eq("student_id", student.id)
    .order("due_date", { ascending: true });

  const feesList = feeRecords || [];

  const totalAmount = feesList.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  const totalPaid = feesList.reduce((sum, f) => sum + (Number(f.paid_amount) || 0), 0);
  const balanceDue = totalAmount - totalPaid;

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return <Badge variant="success">Paid in Full</Badge>;
      case "partial":
        return <Badge variant="warning">Partially Paid</Badge>;
      case "overdue":
        return <Badge variant="danger">Overdue</Badge>;
      default:
        return <Badge variant="neutral">Pending Payment</Badge>;
    }
  };

  return (
    <ParentAppShell
      childName={student.full_name}
      classNameStr={classNameStr}
      hasMultipleChildren={hasMultipleChildren}
    >
      <div className="space-y-6">
        {/* Header Title Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <CreditCard className="w-4.5 h-4.5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Fee Statements & Invoices
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Financial statement for <span className="font-bold text-slate-900">{student.full_name}</span> • Adm #: <span className="font-bold text-slate-900">{student.admission_number || "N/A"}</span>
            </p>
          </div>

          <Badge variant={balanceDue > 0 ? "danger" : "success"} size="md">
            {balanceDue > 0 ? `₹${balanceDue.toLocaleString("en-IN")} Outstanding` : "All Fees Cleared"}
          </Badge>
        </div>

        {/* Financial Summary Metric Cards (3 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Total Billed
            </span>
            <p className="text-3xl font-extrabold text-slate-900">
              ₹{totalAmount.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">Total across all fee categories</p>
          </div>

          <div className="bg-white rounded-2xl border border-emerald-200 bg-emerald-50/20 p-5 shadow-2xs">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">
              Total Paid
            </span>
            <p className="text-3xl font-extrabold text-emerald-900">
              ₹{totalPaid.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-emerald-700 font-medium mt-1">Cleared transactions to date</p>
          </div>

          <div className={`bg-white rounded-2xl border p-5 shadow-2xs ${
            balanceDue > 0 ? "border-rose-200 bg-rose-50/20" : "border-slate-200"
          }`}>
            <span className={`text-xs font-bold uppercase tracking-wider block mb-1 ${
              balanceDue > 0 ? "text-rose-800" : "text-slate-500"
            }`}>
              Balance Due
            </span>
            <p className={`text-3xl font-extrabold ${balanceDue > 0 ? "text-rose-900" : "text-slate-900"}`}>
              ₹{balanceDue.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {balanceDue > 0 ? "Outstanding balance pending" : "No pending balance"}
            </p>
          </div>
        </div>

        {/* Detailed Fee Invoices Table */}
        <Card>
          <CardHeader
            title="Detailed Fee Statement"
            subtitle="Breakdown of tuition, transportation, and school fee records"
          />

          {feesList.length > 0 ? (
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                    <th className="py-3 px-4">Fee Category</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Paid Amount</th>
                    <th className="py-3 px-4">Paid Date</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                  {feesList.map((fee) => {
                    const amount = Number(fee.amount) || 0;
                    const paidAmount = Number(fee.paid_amount) || 0;

                    return (
                      <tr key={fee.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 capitalize">{fee.fee_type}</p>
                          {fee.remarks && (
                            <p className="text-[11px] text-slate-500 mt-0.5">{fee.remarks}</p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900">
                          ₹{amount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {fee.due_date
                            ? new Date(fee.due_date).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "N/A"}
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-emerald-800">
                          ₹{paidAmount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {fee.paid_date
                            ? new Date(fee.paid_date).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-center">{getStatusBadge(fee.status)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs font-medium space-y-2">
              <CreditCard className="w-8 h-8 mx-auto text-slate-300" />
              <p>No fee statements recorded for this student.</p>
            </div>
          )}
        </Card>
      </div>
    </ParentAppShell>
  );
}
