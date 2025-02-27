import React, { useEffect, useState } from "react";
import { Table, Button, Space, Tag, Input, Select, Form } from "antd";
import { SearchOutlined, EditOutlined } from "@ant-design/icons";
import ApiService from "../api_service/apiService";
import { OrderCar } from "../types/car_orders";
import dayjs from "dayjs";
import InputDialog from "../components/InputDialog";
import { toast } from "sonner";

const { Option } = Select;

const CarOrderManagementPage: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );
  const [dataSource, setDataSource] = useState<OrderCar[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const [allData, setAllData] = useState<OrderCar[]>([]);

  // Dialog
  const [isInputDialog, setIsInputDialog] = useState(false);
  const [inputTitle, setInputTitle] = useState("");
  const [selectedOrderCar, setSelectedOrderCar] = useState<OrderCar | null>(
    null
  );

  const [form] = Form.useForm();
  const [isFormLoading, setIsFormLoading] = useState<boolean>(false);

  // Fetch the car order list from the server with pagination and search
  const getCarOrderList = async (page: number, size: number) => {
    setLoading(true);
    try {
      const response = await ApiService.getCarOrderList(page, size);
      setAllData(response.data.data); // Store all data
      applyFilters(response.data.data); // Apply filters to the data
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

  // Apply filters and pagination to the data
  const applyFilters = (data: OrderCar[]) => {
    // Apply status filter if selected
    let filteredData = data;
    if (statusFilter) {
      filteredData = data.filter((order) => order.status === statusFilter);
    }

    // Apply search filter
    filteredData = filteredData.filter((order) =>
      order.username?.toLowerCase().includes(searchText.toLowerCase())
    );

    // Update total count
    setTotal(filteredData.length);

    // Apply pagination
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

    setDataSource(paginatedData);
  };

  // Handle status filter change
  const handleStatusChange = (value: string | undefined) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when changing filters
  };

  // Handle search text change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle edit
  const handleEdit = (order: OrderCar) => {
    setInputTitle("Edit Status");
    setSelectedOrderCar(order);
    form.setFieldsValue({ status: order.status }); // Set form value
    setIsInputDialog(true);
  };

  const handleStatusSubmit = async (e: any): Promise<void> => {
    e.preventDefault();
    try {
      const values = await form.validateFields();
      setIsFormLoading(true);

      if (!selectedOrderCar?.id) {
        throw new Error("No order selected");
      }

      await ApiService.changeCarOrderStatus(selectedOrderCar.id, values.status);

      toast.success("Order status updated successfully");
      setIsInputDialog(false);
      getCarOrderList(currentPage, pageSize); // Refresh the list
    } catch (error: any) {
      console.error(
        "Error updating order status:",
        error.response?.data || error.message
      );
      toast.error("Failed to update order status");
    } finally {
      setIsFormLoading(false);
    }
  };

  const onClose = () => {
    setIsInputDialog(false);
    setSelectedOrderCar(null);
    form.resetFields();
  };

  // Define table columns
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a: OrderCar, b: OrderCar) => a.id - b.id,
      onHeaderCell: () => ({
        style: { zIndex: 0, position: "relative" } as React.CSSProperties,
      }),
      width: 60,
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      sorter: (a: OrderCar, b: OrderCar) =>
        a.username.localeCompare(b.username),

      width: 100,
    },
    {
      title: "Car Brand",
      dataIndex: "carbrand_name",
      key: "carbrand_name",
      sorter: (a: OrderCar, b: OrderCar) =>
        a.carbrand_name.localeCompare(b.carbrand_name),

      width: 120,
    },
    {
      title: "Car Model",
      dataIndex: "carmodel_title",
      key: "car_model",
      sorter: (a: OrderCar, b: OrderCar) =>
        a.carmodel_title.localeCompare(b.carmodel_title),

      width: 120,
    },
    {
      title: "Price ($)",
      dataIndex: "price",
      key: "price",
      sorter: (a: OrderCar, b: OrderCar) => a.price - b.price,
      render: (price: number) => <Tag color="blue">${price}</Tag>,

      width: 120,
    },
    {
      title: "Order Date",
      dataIndex: "created_at",
      key: "created_at",
      sorter: (a: OrderCar, b: OrderCar) =>
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

  // Handle table change (pagination, filters, sorter)
  const handleTableChange = (pagination: any, _: any, __: any) => {
    const { current, pageSize: newPageSize } = pagination;
    setCurrentPage(current);
    setPageSize(newPageSize);

    // Re-apply filters with new pagination
    applyFilters(allData);
  };

  useEffect(() => {
    if (allData.length > 0) {
      applyFilters(allData);
    }
  }, [statusFilter, searchText, currentPage, pageSize]);

  useEffect(() => {
    getCarOrderList(currentPage, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: "24px", backgroundColor: "#fff" }}>
      <h2 style={{ marginBottom: "16px" }}>Car Order Management</h2>
      <Space style={{ marginBottom: "16px" }}>
        <Input
          placeholder="Search by username"
          value={searchText}
          onChange={handleSearchChange}
          prefix={<SearchOutlined />}
          style={{ width: "200px" }}
          allowClear
        />
        <Select
          placeholder="Filter by status"
          value={statusFilter}
          onChange={handleStatusChange}
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
        dataSource={dataSource}
        columns={columns}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
          showTotal: (total) => `Total ${total} orders`,
        }}
        onChange={handleTableChange}
        loading={loading}
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
        <Form form={form} layout="vertical">
          <Form.Item
            name="status"
            label="Order Status"
            rules={[{ required: true, message: "Please select a status!" }]}>
            <Select
              style={{ width: 120 }}
              onChange={(value) =>
                setSelectedOrderCar((prev) =>
                  prev ? { ...prev, status: value } : null
                )
              }>
              <Option
                value="PENDING"
                defaultValue
                disabled={selectedOrderCar?.status === "PENDING"}>
                Pending
              </Option>
              <Option
                value="PROCESSING"
                disabled={selectedOrderCar?.status === "PROCESSING"}>
                Processing
              </Option>
              <Option
                value="SHIPPED"
                disabled={selectedOrderCar?.status === "SHIPPED"}>
                Shipped
              </Option>
              <Option
                value="DELIVERED"
                disabled={selectedOrderCar?.status === "DELIVERED"}>
                Delivered
              </Option>
              <Option
                value="CANCELLED"
                disabled={selectedOrderCar?.status === "CANCELLED"}>
                Cancelled
              </Option>
            </Select>
          </Form.Item>
        </Form>
      </InputDialog>
    </div>
  );
};

export default CarOrderManagementPage;
