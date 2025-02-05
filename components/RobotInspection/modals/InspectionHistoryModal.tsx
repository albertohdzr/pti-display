// components/RobotInspection/modals/InspectionHistoryModal.tsx
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Chip,
} from "@nextui-org/react";

import { InspectionSession } from "@/types/inspection";

interface InspectionHistoryModalProps {
  inspections: InspectionSession[];
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export function InspectionHistoryModal({
  inspections,
  isOpen,
  onClose,
  onContinue,
}: InspectionHistoryModalProps) {
  return (
    <Modal isOpen={isOpen} size="2xl" onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Previous Inspections</ModalHeader>
            <ModalBody>
              <div className="space-y-3">
                {inspections.map((inspection) => (
                  <Card key={inspection.id}>
                    <CardBody>
                      <div className="flex justify-between items-center">
                        <div>
                          <p>Status: {inspection.status}</p>
                          <p className="text-small text-default-500">
                            {new Date(inspection.startTime).toLocaleString()}
                          </p>
                        </div>
                        <Chip
                          color={
                            inspection.status === "completed"
                              ? "success"
                              : inspection.status === "failed"
                                ? "danger"
                                : "warning"
                          }
                        >
                          {inspection.status}
                        </Chip>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                onPress={() => {
                  onContinue();
                  onClose();
                }}
              >
                Start New Inspection
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
