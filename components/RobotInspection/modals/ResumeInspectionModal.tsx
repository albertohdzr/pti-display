// components/RobotInspection/modals/ResumeInspectionModal.tsx
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";

import { InspectionSession } from "@/types/inspection";

interface ResumeInspectionModalProps {
  inspection: InspectionSession;
  isOpen: boolean;
  onClose: () => void;
  onResume: (inspection: InspectionSession) => void;
  onDiscard: () => void;
}

export function ResumeInspectionModal({
  inspection,
  isOpen,
  onClose,
  onResume,
  onDiscard,
}: ResumeInspectionModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Resume Inspection?</ModalHeader>
            <ModalBody>
              <p>
                You have an unfinished inspection. Would you like to resume it?
              </p>
              <div className="mt-2 bg-default-100 p-3 rounded">
                <p>
                  Started: {new Date(inspection.startTime).toLocaleString()}
                </p>
                {inspection.matchKey && <p>Match: {inspection.matchKey}</p>}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="light"
                onPress={() => {
                  onDiscard();
                  onClose();
                }}
              >
                Start New
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  onResume(inspection);
                  onClose();
                }}
              >
                Resume
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
