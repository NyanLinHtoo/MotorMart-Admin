import React from "react";
import { Modal, Button } from "antd";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onOk: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  title,
  onOk,
  onCancel,
  isLoading,
}) => {
  return (
    <Modal
      title={title}
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={isLoading}>
          No
        </Button>,
        <Button
          key="ok"
          type="primary"
          danger
          onClick={onOk}
          loading={isLoading}>
          {isLoading ? "deleting" : "Yes"}
        </Button>,
      ]}></Modal>
  );
};

export default ConfirmDialog;
