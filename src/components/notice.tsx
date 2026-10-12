export function Notice({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "error" | "success" }) {
  const style = {
    info: "border-blue-200 bg-blue-50 text-blue-900",
    error: "border-red-200 bg-red-50 text-red-900",
    success: "border-green-200 bg-green-50 text-green-900",
  }[tone];
  return <div role={tone === "error" ? "alert" : "status"} className={`rounded-xl border p-4 text-sm leading-6 ${style}`}>{children}</div>;
}
