// contexts/EventContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

import { useTeam } from "./TeamContext";

import { TBAEvent, TeamEvent } from "@/types/event";

interface EventContextType {
  currentEvent: TeamEvent | null;
  teamEvents: TeamEvent[];
  setCurrentEvent: (eventKey: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  refreshEvents: () => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const { currentTeam } = useTeam();
  const [currentEvent, setCurrentEvent] = useState<TeamEvent | null>(null);
  const [teamEvents, setTeamEvents] = useState<TeamEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processEvents = (
    events: TBAEvent[],
    currentEventKey?: string,
  ): TeamEvent[] => {
    const now = new Date();

    return events
      .map((event) => {
        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);

        let status: TeamEvent["status"] = "upcoming";

        if (now > endDate) status = "completed";
        else if (now >= startDate && now <= endDate) status = "ongoing";

        return {
          ...event,
          isCurrentEvent: event.key === currentEventKey,
          status,
        };
      })
      .sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
      );
  };

  const updateCurrentEvent = async (eventKey: string) => {
    if (!currentTeam?.id) return;

    try {
      const response = await fetch(
        `/api/teams/${currentTeam.id}/current-event`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventKey }),
        },
      );

      if (!response.ok) throw new Error("Failed to update current event");

      setTeamEvents((prev) =>
        prev.map((event) => ({
          ...event,
          isCurrentEvent: event.key === eventKey,
        })),
      );

      const newCurrentEvent =
        teamEvents.find((e) => e.key === eventKey) || null;

      setCurrentEvent(newCurrentEvent);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update current event",
      );
    }
  };

  const fetchEvents = async () => {
    if (!currentTeam?.number) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch current event key from Firebase
      const currentEventResponse = await fetch(
        `/api/teams/${currentTeam.id}/current-event`,
      );
      const { eventKey: currentEventKey } = await currentEventResponse.json();

      // Fetch team events from our API endpoint
      const eventsResponse = await fetch(
        `/api/tba/events/${currentTeam.number}`,
      );

      if (!eventsResponse.ok) {
        throw new Error("Failed to fetch events");
      }

      const events = await eventsResponse.json();
      const processedEvents = processEvents(events, currentEventKey);

      setTeamEvents(processedEvents);

      const newCurrentEvent =
        processedEvents.find((e) => e.key === currentEventKey) || null;

      setCurrentEvent(newCurrentEvent);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to fetch events",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentTeam]);

  return (
    <EventContext.Provider
      value={{
        currentEvent,
        teamEvents,
        setCurrentEvent: updateCurrentEvent,
        loading,
        error,
        refreshEvents: fetchEvents,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const context = useContext(EventContext);

  if (context === undefined) {
    throw new Error("useEvent must be used within a EventProvider");
  }

  return context;
}
