import React, { useEffect, useState } from "react";
import { Table, Button, Tag, Input, Space, Form, Select } from "antd";
import { SearchOutlined, EditOutlined } from "@ant-design/icons";
import ApiService from "../api_service/apiService";
import InputDialog from "../components/InputDialog";
import { OrderSparepart } from "../types/sparepart_order";
import dayjs from "dayjs";
import { toast } from "sonner";

const SparepartOrderPage: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [dataSource, setDataSource] = useState<OrderSparepart[]>([]);
  const [selectedOrderSparePart, setSelectedOrderSparePart] =
    useState<OrderSparepart | null>(null);
  const [form] = Form.useForm();

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Dialog
  const [isInputDialog, setIsInputDialog] = useState(false);
  const [inputTitle, setInputTitle] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );

  const [isFormLoading, setIsFormLoading] = useState<boolean>(false);
  const { Option } = Select;

  // Add valid status transitions map
  const validTransitions: { [key: string]: string[] } = {
    PENDING: ["PROCESSING", "CANCELLED"],
    PROCESSING: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["DELIVERED", "CANCELLED"],
    DELIVERED: [],
    CANCELLED: [],
  };

  // Fetch the spare part order list from the server with pagination
  const getSparePartOrder = async (page: number, size: number) => {
    setLoading(true);
    try {
      const response = await ApiService.getSparepartOrderList(page, size, {
        status: statusFilter,
      });
      setDataSource(response.data.data);
      setTotal(response.data.meta.total);
    } catch (error: any) {
      console.error(
        "Error fetching order list:",
        error.response?.data || error.message
      );
      toast.error("Failed to fetch order list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit (placeholder)

  const handleEdit = (sparepart: OrderSparepart) => {
    setInputTitle("Edit Spare Part");
    setSelectedOrderSparePart(sparepart);
    setIsInputDialog(true);
    form.setFieldsValue({
      status: sparepart.status,
    });
  };

  // Update handleStatusSubmit with validation
  const handleStatusSubmit = async (e: any): Promise<void> => {
    e.preventDefault();
    try {
      const values = await form.validateFields();
      setIsFormLoading(true);

      if (!selectedOrderSparePart?.id) {
        throw new Error("No order selected");
      }

      // Validate status transition
      const currentStatus = selectedOrderSparePart.status;
      const newStatus = values.status;

      if (!validTransitions[currentStatus]?.includes(newStatus)) {
        throw new Error(
          `Cannot change status from ${currentStatus} to ${newStatus}`
        );
      }

      await ApiService.changeSparePartOrderStatus(
        selectedOrderSparePart.id,
        values.status
      );

      toast.success("Order status updated successfully");
      setIsInputDialog(false);
      getSparePartOrder(currentPage, pageSize);
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast.error(error.message || "Failed to update order status");
    } finally {
      setIsFormLoading(false);
    }
  };

  const onClose = () => {
    setIsInputDialog(false);
    setSelectedOrderSparePart(null);
    form.resetFields();
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "User",
      dataIndex: ["user", "username"],
      key: "user.username",
    },
    {
      title: "Spare Part",
      dataIndex: ["spare_part", "name"],
      key: "spare_part.name",
    },
    {
      title: "Price ($)",
      dataIndex: "price_per_unit",
      key: "price_per_unit",
      sorter: (a: OrderSparepart, b: OrderSparepart) =>
        a.price_per_unit - b.price_per_unit,
      render: (price: number) => <Tag color="blue">${price}</Tag>,
      width: 120,
    },
    {
      title: "Order Date",
      dataIndex: "created_at",
      key: "created_at",
      sorter: (a: OrderSparepart, b: OrderSparepart) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      render: (date: string) => dayjs(date).format("YYYY/MM/DD HH:mm"),
      width: 180,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="primary"
            onClick={() => handleEdit(record)}>
            Edit
          </Button>
        </Space>
      ),
      width: 120,
    },
  ];

  // Update the filter to use the correct path
  const filteredData = dataSource.filter(
    (order) =>
      order.user?.username?.toLowerCase().includes(searchText.toLowerCase()) &&
      (statusFilter ? order.status === statusFilter : true)
  );

  // Table pagination, sort, filter changes
  const handleTableChange = (pagination: any) => {
    const { current, pageSize } = pagination;
    setCurrentPage(current);
    setPageSize(pageSize);
    // Re-fetch from server if doing server-side pagination
    getSparePartOrder(current, pageSize);
  };

  useEffect(() => {
    getSparePartOrder(currentPage, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  return (
    <div style={{ padding: "24px", backgroundColor: "#fff" }}>
      <h2 style={{ marginBottom: "16px" }}>Spare part Order Management</h2>
      <Space style={{ marginBottom: "16px" }}>
        <Input
          placeholder="Search by spare parts name"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ width: "200px" }}
        />
        <Select
          placeholder="Filter by status"
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
          style={{ width: 150 }}
          defaultValue="All">
          <Option value={undefined}>All</Option>
          <Option value="PENDING">Pending</Option>
          <Option value="PROCESSING">Processing</Option>
          <Option value="SHIPPED">Shipped</Option>
          <Option value="DELIVERED">Delivered</Option>
          <Option value="CANCELLED">Cancelled</Option>
        </Select>
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
        onSubmit={handleStatusSubmit}
        isLoading={isFormLoading}
        onChangePasswordClick={() => {}}
        isChangePassword={false}
        isEditing={false}>
        <Form form={form} layout="vertical" onFinish={handleStatusSubmit}>
          <Form.Item
            name="status"
            label="Order Status"
            rules={[{ required: true }]}>
            <Select style={{ width: 200 }}>
              {selectedOrderSparePart &&
                validTransitions[selectedOrderSparePart.status]?.map(
                  (status) => (
                    <Option key={status} value={status}>
                      {status}
                    </Option>
                  )
                )}
            </Select>
          </Form.Item>
        </Form>
      </InputDialog>
    </div>
  );
};

export default SparepartOrderPage;
