import { ChecklistEditor } from "@/components/Checklist/ChecklistEditor";

// app/checklists/new/page.tsx
export default function NewChecklistPage() {
  return (
    <div className="p-6 space-y-6">
      <ChecklistEditor />
    </div>
  );
}
