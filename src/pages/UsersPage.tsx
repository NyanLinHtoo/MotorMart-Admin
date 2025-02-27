import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Tag,
  Input,
  Space,
  Avatar,
  Form,
  Upload,
  Select,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import ApiService from "../api_service/apiService";
import { User } from "../types/user";
import InputDialog from "../components/InputDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import { toast } from "sonner";
const { Option } = Select;

const UsersPage: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [dataSource, setDataSource] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Dialog
  const [isInputDialog, setIsInputDialog] = useState(false);
  const [isDeleteConfirmDialog, setIsDeleteConfirmDialog] = useState(false);
  const [inputTitle, setInputTitle] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [isFormLoading, setIsFormLoading] = useState<boolean>(false);

  const getUserList = async (page: number, size: number) => {
    setLoading(true);
    try {
      const response = await ApiService.getUserList(page, size);
      setDataSource(response.data.data);
      setTotal(response.data.meta.total || 0);
    } catch (error: any) {
      console.error(
        "Error fetching user list:",
        error.response?.data || error.message
      );
      toast.error("Failed to fetch user list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show the "Add User" modal
  const handleAddUser = (user: any) => {
    setInputTitle("Add User");
    setIsInputDialog(true);
    form.setFieldsValue({
      email: user?.email,
      username: user?.username,
      password: user.password,
      user_type: user?.role, // Set the role correctly
    });
  };

  // Submit the "Add User" form
  const CreateNewUser = async (e: any) => {
    e.preventDefault();
    setIsFormLoading(true);
    try {
      const values = await form.validateFields();
      const payload = {
        email: values.email,
        password: values.password,
        name: values.username,
        role: values.user_type,
      };
      try {
        const response = await ApiService.createAdminUser(payload);
        if (response.status === 201 || response.status === 200) {
          toast.success("User registered successfully");
          setIsInputDialog(false);

          // Add the new user to the beginning of the dataSource
          const newUser = response.data;
          setDataSource((prevData) => [newUser, ...prevData]);
          setTotal((prevTotal) => prevTotal + 1);

          form.resetFields();
        }
      } catch (apiError: any) {
        console.error("Error registering user:", apiError);
        const errorMessage =
          apiError.response?.data?.message ||
          "Failed to register user. Please try again.";
        toast.error(errorMessage);
      } finally {
        setIsFormLoading(false);
      }
    } catch (validationError) {
      console.error("Validation failed:", validationError);
      setIsFormLoading(false);
    }
  };

  // Handle edit (placeholder)

  const handleEdit = (user: User) => {
    setInputTitle("Edit User");
    setSelectedUser(user);
    setIsInputDialog(true);
    form.setFieldsValue({
      email: user.email,
      username: user.username,
      phone_number: user.phone_number,
    });
  };

  const UpdateUser = async (e: any) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsFormLoading(true);
    try {
      const values = await form.validateFields();

      const payload = {
        email: values.email,
        name: values.username,
        phonenumber: values.phone_number,
        password: values.password || "", // Keep empty if not updating password
      };

      await ApiService.updateUser(selectedUser.id, payload);
      toast.success("User updated successfully");
      setIsInputDialog(false);
      getUserList(currentPage, pageSize); // Refresh list
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("Failed to update user. Please try again.");
    } finally {
      setIsFormLoading(false); // Set loading to false when request is done
    }
  };

  // Handle delete
  const handleDelete = (userId: number) => {
    setSelectedUserId(userId);
    setIsDeleteConfirmDialog(true);
  };

  const deleteConfirm = async () => {
    if (selectedUserId === null) return;
    setIsFormLoading(true);
    try {
      await ApiService.deleteUser(selectedUserId);
      toast.success("User deleted successfully");
      setIsDeleteConfirmDialog(false);
      setSelectedUserId(null);
      getUserList(currentPage, pageSize); // Refresh the user list
    } catch (error) {
      toast.error("Failed to delete user. Please try again.");
    } finally {
      setIsFormLoading(false); // Set loading to false when request is done
    }
  };

  const onClose = () => {
    setIsInputDialog(false);
    setIsDeleteConfirmDialog(false);
    setSelectedUser(null);
    form.resetFields();
  };

  const columns = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
      },
      {
        title: "Username",
        dataIndex: "username",
        key: "username",
        // sorter: (a: User, b: User) => a.username.localeCompare(b.username),
      },
      {
        title: "Phone Number",
        dataIndex: "phone_number",
        key: "phone_number",
      },
      {
        title: "Profile Image",
        dataIndex: "profile_img_id",
        key: "profile_img_id",
        render: (profile_img_id: string) => (
          <Avatar
            src={profile_img_id || "https://www.gravatar.com/avatar/?d=mp"}
            onError={() => {
              if (profile_img_id) {
                const img = document.querySelector(
                  `img[src="${profile_img_id}"]`
                ) as HTMLImageElement;
                if (img) img.src = "https://www.gravatar.com/avatar/?d=mp";
              }
              return false;
            }}
          />
        ),
      },
      {
        title: "Account Type",
        dataIndex: "acct_type",
        key: "acct_type",
        render: (acct_type: string) => (
          <Tag color={acct_type === "Admin" ? "green" : "blue"}>
            {acct_type}
          </Tag>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        render: (_: any, record: User) => (
          <Space>
            <Button
              icon={<EditOutlined />}
              type="primary"
              onClick={() => handleEdit(record)}>
              Edit
            </Button>
            <Button
              icon={<DeleteOutlined />}
              type="primary"
              danger
              onClick={() => handleDelete(record.id)}>
              Delete
            </Button>
          </Space>
        ),
      },
    ],
    []
  );

  // Client-side filtering based on username
  const filteredData = dataSource.filter((user) =>
    user.username?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Table pagination, sort, filter changes
  const handleTableChange = (pagination: any) => {
    const { current, pageSize } = pagination;
    setCurrentPage(current);
    setPageSize(pageSize);
    // Re-fetch from server if doing server-side pagination
    getUserList(current, pageSize);
  };

  // Fetch initial user list
  useEffect(() => {
    getUserList(currentPage, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: "24px", backgroundColor: "#fff" }}>
      <h2 style={{ marginBottom: "16px" }}>Users Management</h2>
      <Space style={{ marginBottom: "16px" }}>
        <Input
          placeholder="Search by username"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ width: "200px" }}
        />
        <Button type="primary" onClick={handleAddUser}>
          Add User
        </Button>
      </Space>
      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
          showTotal: (total) => `Total ${total} users`,
        }}
        onChange={handleTableChange}
        bordered
        scroll={{ x: "max-content" }}
      />

      <InputDialog
        isOpen={isInputDialog}
        onClose={onClose}
        title={inputTitle}
        onCancel={onClose}
        onSubmit={inputTitle === "Edit User" ? UpdateUser : CreateNewUser}
        isLoading={isFormLoading}
        onChangePasswordClick={() => {}}
        isChangePassword={false}
        isEditing={false}>
        <Form form={form} layout="vertical">
          <Form.Item name="email" label="Email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          {inputTitle !== "Add User" && (
            <Form.Item name="phone_number" label="Phone Number">
              <Input />
            </Form.Item>
          )}

          {inputTitle !== "Edit User" && (
            <Form.Item
              name="user_type"
              label="User Type"
              rules={[{ required: true }]}>
              <Select
                defaultValue={form.getFieldValue("user_type")}
                onChange={(value) => form.setFieldsValue({ user_type: value })}>
                <Option value="Admin">Admin</Option>
                <Option value="User">User</Option>
              </Select>
            </Form.Item>
          )}

          {inputTitle !== "Edit User" && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}>
              <Input />
            </Form.Item>
          )}

          {inputTitle !== "Edit User" && (
            <Form.Item
              name="confirm"
              label="Confirm"
              rules={[
                {
                  required: true,
                  message: "Please confirm your password!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        "The two passwords that you entered do not match!"
                      )
                    );
                  },
                }),
              ]}>
              <Input />
            </Form.Item>
          )}

          <Form.Item name="profile_img_id" label="Profile Image">
            <Upload>
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>
        </Form>
      </InputDialog>

      <ConfirmDialog
        isOpen={isDeleteConfirmDialog}
        onClose={onClose}
        title="Are you sure you want to delete this User?"
        onOk={deleteConfirm}
        onCancel={() => setIsDeleteConfirmDialog(false)}
        isLoading={isFormLoading}></ConfirmDialog>
    </div>
  );
};

export default UsersPage;
