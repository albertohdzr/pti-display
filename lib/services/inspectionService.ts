import { admindb } from "../firebaseAdmin";

import {
  CreateInspectionDTO,
  InspectionSession,
  StepResult,
} from "@/types/inspection";

interface UpdateResultsOptions {
  batteryNumber?: string;
  notes?: string;
}

// lib/services/inspectionService.ts
export class InspectionService {
  static async getActiveInspection(
    teamId: string,
  ): Promise<InspectionSession | null> {
    const activeInspection = await admindb
      .collection("teams")
      .doc(teamId)
      .collection("inspections")
      .where("status", "==", "in-progress")
      .orderBy("startTime", "desc")
      .limit(1)
      .get();

    if (activeInspection.empty) return null;

    const doc = activeInspection.docs[0];

    return {
      id: doc.id,
      ...doc.data(),
    } as InspectionSession;
  }

  static async getActiveMatchInspection(
    teamId: string,
    matchKey: string,
  ): Promise<InspectionSession | null> {
    const activeInspection = await admindb
      .collection("teams")
      .doc(teamId)
      .collection("inspections")
      .where("matchKey", "==", matchKey)
      .where("status", "==", "in-progress")
      .limit(1)
      .get();

    if (activeInspection.empty) return null;

    const doc = activeInspection.docs[0];

    return {
      id: doc.id,
      ...doc.data(),
    } as InspectionSession;
  }

  static async getInspections(
    teamId: string,
    options: {
      page: number;
      limit: number;
      status?: InspectionSession["status"];
      matchKey?: string;
    },
  ): Promise<{ inspections: InspectionSession[]; total: number }> {
    let query = admindb
      .collection("teams")
      .doc(teamId)
      .collection("inspections")
      .orderBy("startTime", "desc");

    if (options.status) {
      query = query.where("status", "==", options.status);
    }

    if (options.matchKey) {
      query = query.where("matchKey", "==", options.matchKey);
    }

    // Obtener el total
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    // Aplicar paginación
    query = query
      .limit(options.limit)
      .offset((options.page - 1) * options.limit);

    const snapshot = await query.get();

    const inspections = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as InspectionSession[];

    return { inspections, total };
  }

  static async getMatchInspections(
    teamId: string,
    matchKey: string,
  ): Promise<InspectionSession[]> {
    const inspections = await admindb
      .collection("teams")
      .doc(teamId)
      .collection("inspections")
      .where("matchKey", "==", matchKey)
      .orderBy("startTime", "desc")
      .get();

    return inspections.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as InspectionSession[]; // Forzamos el tipo aquí
  }

  static async getPreviousBatteries(teamId: string, limit: number = 5) {
    const recentInspections = await admindb
      .collection("teams")
      .doc(teamId)
      .collection("inspections")
      .where("batteryNumber", "!=", null)
      .orderBy("batteryNumber")
      .orderBy("startTime", "desc")
      .limit(limit)
      .get();

    return recentInspections.docs
      .map((doc) => doc.data().batteryNumber)
      .filter(Boolean);
  }

  static async createInspection(
    teamId: string,
    data: CreateInspectionDTO,
  ): Promise<string> {
    // Verificar si hay una inspección activa
    const activeInspection = await this.getActiveInspection(teamId);

    if (activeInspection) {
      // Marcar la inspección anterior como abandonada
      await this.updateInspectionStatus(
        teamId,
        activeInspection.id,
        "abandoned",
      );
    }

    // Si es para un match, verificar inspecciones anteriores
    if (data.matchKey) {
      const matchInspections = await this.getMatchInspections(
        teamId,
        data.matchKey,
      );

      // Si hay inspecciones anteriores, verificar que la última no esté en progreso
      if (matchInspections.length > 0) {
        const latestInspection = matchInspections[0];

        if (latestInspection.status === "in-progress") {
          throw new Error(
            "There is already an active inspection for this match",
          );
        }

        // Verificar que la batería no se haya usado antes
        if (data.batteryNumber) {
          const previousBatteries = await this.getPreviousBatteries(teamId);

          if (previousBatteries.includes(data.batteryNumber)) {
            throw new Error(
              "This battery has been used in a previous inspection",
            );
          }
        }
      }

      // Actualizar isLatest en inspecciones anteriores
      await Promise.all(
        matchInspections.map((inspection) =>
          this.updateInspection(teamId, inspection.id, { isLatest: false }),
        ),
      );
    }

    const session = {
      teamId,
      matchKey: data.matchKey || null,
      batteryNumber: data.batteryNumber || null,
      inspector: data.inspector,
      notes: data.notes || null,
      startTime: new Date(),
      status: "in-progress",
      results: [],
      isLatest: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      previousBatteryNumbers: await this.getPreviousBatteries(teamId),
    };

    const docRef = await admindb
      .collection("teams")
      .doc(teamId)
      .collection("inspections")
      .add(session);

    return docRef.id;
  }

  static async updateInspectionStatus(
    teamId: string,
    inspectionId: string,
    status: InspectionSession["status"],
  ) {
    await this.updateInspection(teamId, inspectionId, {
      status,
      updatedAt: new Date(),
    });
  }

  static async updateInspection(
    teamId: string,
    inspectionId: string,
    data: Partial<InspectionSession>,
  ) {
    await admindb
      .collection("teams")
      .doc(teamId)
      .collection("inspections")
      .doc(inspectionId)
      .update({
        ...data,
        updatedAt: new Date(),
      });
  }

  static async getInspection(
    teamId: string,
    inspectionId: string,
  ): Promise<InspectionSession | null> {
    const doc = await admindb
      .collection("teams")
      .doc(teamId)
      .collection("inspections")
      .doc(inspectionId)
      .get();

    if (!doc.exists) return null;

    return {
      id: doc.id,
      ...doc.data(),
    } as InspectionSession;
  }

  static async getInspectionResults(
    teamId: string,
    inspectionId: string,
  ): Promise<StepResult[]> {
    const doc = await admindb
      .collection("teams")
      .doc(teamId)
      .collection("inspections")
      .doc(inspectionId)
      .get();

    if (!doc.exists) {
      throw new Error("Inspection not found");
    }

    const data = doc.data();

    return data?.results || [];
  }

  static async updateInspectionResults(
    teamId: string,
    inspectionId: string,
    results: StepResult[],
    options?: UpdateResultsOptions,
  ) {
    const failed = results.some((result) => !result.passed);
    const updateData: any = {
      results,
      status: failed ? "failed" : "completed",
      endTime: new Date(),
      updatedAt: new Date(),
    };

    if (options?.batteryNumber) {
      updateData.batteryNumber = options.batteryNumber;
    }

    if (options?.notes) {
      updateData.notes = options.notes;
    }

    // Obtener la inspección actual para verificar si es para un match
    const inspection = await this.getInspection(teamId, inspectionId);

    if (!inspection) {
      throw new Error("Inspection not found");
    }

    await admindb
      .collection("teams")
      .doc(teamId)
      .collection("inspections")
      .doc(inspectionId)
      .update(updateData);

    // Si es una inspección para un match, actualizar el estado de preparación
    if (inspection.matchKey) {
      await admindb
        .collection("teams")
        .doc(teamId)
        .collection("matchPreparations")
        .doc(inspection.matchKey)
        .set(
          {
            inspectionCompleted: !failed,
            inspectionId,
            batteryNumber: options?.batteryNumber,
            lastUpdated: new Date(),
          },
          { merge: true },
        );
    }

    return updateData;
  }
}
