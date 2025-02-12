import { ChecklistViewer } from "@/components/Checklist/ChecklistViewer";

// app/checklists/[id]/page.tsx
export default function ChecklistPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6 space-y-6">
      <ChecklistViewer id={params.id} />
    </div>
  );
}
