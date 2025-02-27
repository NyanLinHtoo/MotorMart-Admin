import React, { ReactNode, ReactElement } from "react";
import { CloseOutlined } from "@ant-design/icons";

type InputDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onCancel: () => void;
  error?: string;
  btnLabel?: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  isLoading: boolean;
  onChangePasswordClick: () => void;
  isChangePassword: boolean;
  isEditing: boolean;
};

const InputDialog: React.FC<InputDialogProps> = ({
  isOpen,
  onClose,
  title,
  onCancel,
  error,
  btnLabel = "Save",
  onSubmit,
  children,
  isLoading,
  onChangePasswordClick,
  isChangePassword,
}) => {
  if (!isOpen) return null;

  // Clone children and add `disabled` prop if they are input fields
  const modifiedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as ReactElement<any>, {
        disabled: isLoading,
      });
    }
    return child;
  });

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-[100]">
      <div className="w-1/3 bg-white p-6 rounded-lg shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          disabled={isLoading}>
          <CloseOutlined />
        </button>
        <h3 className="text-lg font-semibold mb-4">{title}</h3>

        <form onSubmit={onSubmit}>
          {error && (
            <h6 className="bg-red-100 text-red-500 rounded-md px-4 py-4 mb-5">
              {error}
            </h6>
          )}
          {modifiedChildren}

          {title === "Profile" && !isChangePassword ? (
            <div className="flex justify-between">
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={onChangePasswordClick}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-md flex items-center justify-center"
                  disabled={isLoading}>
                  Change Password
                </button>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  className={`px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-md flex items-center justify-center ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  disabled={isLoading}>
                  {isLoading ? "Saving..." : btnLabel}
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-200 rounded-md"
                  disabled={isLoading}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                className={`px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-md flex items-center justify-center ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}>
                {isLoading ? "Saving..." : btnLabel}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-200 rounded-md"
                disabled={isLoading}>
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default InputDialog;
