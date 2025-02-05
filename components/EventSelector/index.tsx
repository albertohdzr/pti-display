// components/EventSelector/index.tsx
"use client";

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";
import { CalendarDays } from "lucide-react";

import { useEvent } from "@/contexts/EventContext";

export function EventSelector() {
  const { currentEvent, teamEvents, setCurrentEvent, loading } = useEvent();

  if (loading) return <Button isLoading>Loading events...</Button>;

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          startContent={<CalendarDays className="h-4 w-4" />}
          variant="bordered"
        >
          {currentEvent
            ? currentEvent.short_name || currentEvent.name
            : "Select Event"}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Event Selection"
        selectedKeys={currentEvent ? [currentEvent.key] : []}
        onAction={(key) => setCurrentEvent(key.toString())}
      >
        {teamEvents.map((event) => (
          <DropdownItem
            key={event.key}
            description={`${event.city}, ${event.state_prov}`}
            startContent={
              <div
                className={`w-2 h-2 rounded-full ${
                  event.status === "ongoing"
                    ? "bg-success"
                    : event.status === "completed"
                      ? "bg-default-400"
                      : "bg-warning"
                }`}
              />
            }
          >
            {event.short_name || event.name}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
