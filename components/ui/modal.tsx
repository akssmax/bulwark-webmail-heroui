"use client";

import type { ReactNode } from "react";
import { Modal } from "@heroui/react";
import { cn } from "@/lib/utils";

type ModalSize = "sm" | "md" | "lg" | "full";

export interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Simple string title, or a full custom header row. */
  title?: ReactNode;
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  className?: string;
  bodyClassName?: string;
  /** Anchor to a pane instead of the viewport (Pro split view). */
  paneScoped?: boolean;
}

export function AppModal({
  isOpen,
  onClose,
  title,
  header,
  children,
  footer,
  size = "md",
  className,
  bodyClassName,
  paneScoped = false,
}: AppModalProps) {
  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      className={cn(paneScoped && "absolute inset-0")}
    >
      <Modal.Container size={size} className={className}>
        <Modal.Dialog>
          {header ?? (title ? (
            <Modal.Header>
              <Modal.Heading>{title}</Modal.Heading>
            </Modal.Header>
          ) : null)}
          <Modal.Body className={bodyClassName}>{children}</Modal.Body>
          {footer ? <Modal.Footer>{footer}</Modal.Footer> : null}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
