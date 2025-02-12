// app/checklists/page.tsx
"use client";

import { Button, Card, CardBody } from "@nextui-org/react";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

import { ChecklistsTable } from "@/components/Checklist/ChecklistsTable";
import { ActiveChecklist } from "@/components/Checklist/ActiveChecklist";

export default function ChecklistsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Checklists</h1>
        <Link href="/checklists/new">
          <Button color="primary" startContent={<PlusIcon />}>
            New Checklist
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Checklist Activo */}
        <Card>
          <CardBody>
            <h2 className="text-xl font-bold mb-4">Active Checklist</h2>
            <ActiveChecklist />
          </CardBody>
        </Card>

        {/* Estadísticas */}
        <Card>
          <CardBody>
            <h2 className="text-xl font-bold mb-4">Statistics</h2>
            {/*<ChecklistStats />*/}
          </CardBody>
        </Card>
      </div>

      {/* Tabla de Checklists */}
      <Card>
        <CardBody>
          <ChecklistsTable />
        </CardBody>
      </Card>
    </div>
  );
}
