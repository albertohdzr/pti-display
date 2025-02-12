import { ChecklistEditor } from "@/components/Checklist/ChecklistEditor";

// app/checklists/[id]/edit/page.tsx
export default function EditChecklistPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="p-6 space-y-6">
      <ChecklistEditor id={params.id} />
    </div>
  );
}
