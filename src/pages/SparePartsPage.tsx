import React, { useEffect, useState } from "react";
import { Table, Button, Tag, Input, Space, Form, Select } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import ApiService from "../api_service/apiService";
import InputDialog from "../components/InputDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import { Sparepart } from "../types/Sparepart";
import { toast } from "sonner";

const SparePartsPage: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [dataSource, setDataSource] = useState<Sparepart[]>([]);
  const [selectedSparePart, setSelectedSparePart] = useState<Sparepart | null>(
    null
  );
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
  const [selectedSparePartId, setSelectedSparePartId] = useState<number | null>(
    null
  );

  const [isFormLoading, setIsFormLoading] = useState<boolean>(false);

  const [sparepartCategory, setSparepartCategory] = useState<any[]>([]);

  // Fetch the spare part list from the server with pagination
  const getSparePart = async (page: number, size: number) => {
    setLoading(true);
    try {
      const response = await ApiService.getSparepartList(page, size);
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

  const getSparepartCategory = async () => {
    const response = await ApiService.getSparepartCategory();
    setSparepartCategory(response.data);
  };

  const handleAddSpareParts = () => {
    setInputTitle("Add SparePart");
    setIsInputDialog(true);
    form.resetFields();
  };

  const CreateNewSparePart = async (e: any) => {
    e.preventDefault();
    setIsFormLoading(true);

    try {
      const values = await form.validateFields();
      const category = sparepartCategory.find(
        (cat) => cat.name === values.category_name
      );

      if (!category) {
        throw new Error("Category not found");
      }

      const response = await ApiService.createSparepart({
        name: values.name,
        description: values.description || "", // Handle optional field
        price: parseFloat(values.price),
        spare_part_category_id: category.id,
      });

      if (response.status === 201 || response.status === 200) {
        toast.success("Spare part created successfully");

        // Add the new spare part to the beginning of the table
        const newSparePart = response.data;
        setDataSource((prevData) => [newSparePart, ...prevData]);
        setTotal((prevTotal) => prevTotal + 1);

        onClose();
      }
    } catch (error: any) {
      console.error(
        "Error creating spare part:",
        error.response?.data || error.message
      );
      const errorMessage =
        error.response?.data?.error ||
        "Failed to create spare part. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleEdit = (sparepart: Sparepart) => {
    setInputTitle("Edit Spare Part");
    setSelectedSparePart(sparepart);
    setIsInputDialog(true);
    form.setFieldsValue({
      name: sparepart.name,
      description: sparepart.description,
      price: sparepart.price,
      category_name: sparepart.category.name,
    });
  };

  const UpdateSparePart = async (e: any) => {
    e.preventDefault();
    if (!selectedSparePart) return;
    setIsFormLoading(true);
    try {
      const values = await form.validateFields();
      const category = sparepartCategory.find(
        (cat) => cat.name === values.category_name
      );

      if (!category) {
        throw new Error("Category not found");
      }

      const response = await ApiService.updateSparepart(selectedSparePart.id, {
        name: values.name,
        description: values.description || "",
        price: parseFloat(values.price),
        spare_part_category_id: category.id,
      });

      if (response.data) {
        toast.success("Spare part updated successfully");
        getSparePart(currentPage, pageSize);
        onClose();
      }
    } catch (error: any) {
      console.error(
        "Error updating spare part:",
        error.response?.data || error.message
      );
      toast.error("Failed to update spare part. Please try again.");
    } finally {
      setIsFormLoading(false);
    }
  };

  const onClose = () => {
    setIsInputDialog(false);
    setIsDeleteConfirmDialog(false);
    setSelectedSparePart(null);
    form.resetFields();
  };

  const handleDelete = (sparepartId: number) => {
    setSelectedSparePartId(sparepartId);
    setIsDeleteConfirmDialog(true);
  };

  const deleteConfirm = async () => {
    if (!selectedSparePartId) return;
    setIsFormLoading(true);
    try {
      await ApiService.deleteSparepart(selectedSparePartId);
      toast.success("Spare part deleted successfully");
      getSparePart(currentPage, pageSize);
      onClose();
    } catch (error: any) {
      console.error(
        "Error deleting spare part:",
        error.response?.data || error.message
      );
      toast.error("Failed to delete spare part. Please try again.");
    } finally {
      setIsFormLoading(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },

    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Price ($)",
      dataIndex: "price",
      key: "price",
      sorter: (a: Sparepart, b: Sparepart) => a.price - b.price,
      render: (price: number) => <Tag color="blue">${price}</Tag>,

      width: 120,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category: any) => category?.name || "-",
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
          <Button
            icon={<DeleteOutlined />}
            type="primary"
            danger
            onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),

      width: 120,
    },
  ];

  // Client-side filtering based on name
  const filteredData = dataSource.filter((sparepart) =>
    sparepart.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Table pagination, sort, filter changes
  const handleTableChange = (pagination: any) => {
    const { current, pageSize } = pagination;
    setCurrentPage(current);
    setPageSize(pageSize);
    // Re-fetch from server if doing server-side pagination
    getSparePart(current, pageSize);
  };

  useEffect(() => {
    getSparePart(currentPage, pageSize);
    getSparepartCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: "24px", backgroundColor: "#fff" }}>
      <h2 style={{ marginBottom: "16px" }}>SparePart Management</h2>
      <Space style={{ marginBottom: "16px" }}>
        <Input
          placeholder="Search by spare parts name"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ width: "200px" }}
        />
        <Button type="primary" onClick={handleAddSpareParts}>
          Add SpareParts
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
          showTotal: (total) => `Total ${total} spare parts`,
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
        onSubmit={
          inputTitle === "Edit Spare Part"
            ? UpdateSparePart
            : CreateNewSparePart
        }
        isLoading={isFormLoading}
        onChangePasswordClick={() => {}}
        isChangePassword={false}
        isEditing={false}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true }]}>
            <Input type="number" min={0} step={0.01} />
          </Form.Item>
          <Form.Item
            name="category_name"
            label="Category Name"
            rules={[{ required: true }]}>
            <Select>
              {sparepartCategory?.map((category) => (
                <Select.Option key={category.id} value={category.name}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </InputDialog>

      <ConfirmDialog
        isOpen={isDeleteConfirmDialog}
        onClose={onClose}
        title="Are you sure you want to delete this spare part?"
        onOk={deleteConfirm}
        onCancel={() => setIsDeleteConfirmDialog(false)}
        isLoading={isFormLoading}></ConfirmDialog>
    </div>
  );
};

export default SparePartsPage;
