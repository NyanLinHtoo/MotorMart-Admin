import { useEffect, useState } from "react";
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Form, Input, Select, Space, Table } from "antd";
import ApiService from "../api_service/apiService";
import InputDialog from "../components/InputDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import { CarType, CreateCarPayload } from "../types/cartype";
import { CarModel } from "../types/carmodel";
import { CarBrand } from "../types/carbrands";
import { toast } from "sonner";

const CarsManagement = () => {
  const [searchText, setSearchText] = useState("");
  const [dataSource, setDataSource] = useState<CarType[]>([]);
  const [form] = Form.useForm();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Dialog
  const [isInputDialog, setIsInputDialog] = useState(false);
  const [isDeleteConfirmDialog, setIsDeleteConfirmDialog] = useState(false);
  const [inputTitle, setInputTitle] = useState("");

  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);

  const [isFormLoading, setIsFormLoading] = useState<boolean>(false);

  const [selectedCar, setSelectedCar] = useState<CarType | null>(null);

  const [brand, setBrand] = useState<string | null>(null);
  const [brandsList, setBrandsList] = useState<
    { label: string; value: number }[]
  >([]);
  const [modelsList, setModelsList] = useState<
    { label: string; value: number }[]
  >([]);

  const getCarBrands = async () => {
    try {
      const response = await ApiService.getAllCarBrands();
      const options = response.data.carbrands.map((brand: CarBrand) => ({
        label: brand.name,
        value: brand.id,
      }));
      setBrandsList(options);
    } catch (error) {
      console.error("Error fetching car brands:", error);
    }
  };

  const getCarModels = async (brand_id: number) => {
    try {
      setModelsList([]);
      const response = await ApiService.getCarModel(brand_id);

      if (response.data && Array.isArray(response.data)) {
        const options = response.data.map((model: CarModel) => ({
          label: model.title,
          value: model.id,
        }));
        setModelsList(options);
      } else {
        console.error("Unexpected response format:", response.data);
        toast.error("Failed to load car models. Unexpected data format.");
      }
    } catch (error) {
      console.error("Error fetching car models:", error);
      toast.error("Failed to load car models. Please try again.");
      setModelsList([]);
    }
  };

  useEffect(() => {
    if (selectedCar && brand) {
      getCarModels(Number(brand)).then(() => {
        const modelOption = modelsList.find(
          (model) => model.label === selectedCar.carmodel_title
        );

        if (modelOption) {
          form.setFieldsValue({
            carmodel_title: modelOption.value,
          });
        }
      });
    }
  }, [selectedCar, brand, form]);

  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  const isCacheExpired = () => {
    return Date.now() - lastRefreshTime > CACHE_DURATION;
  };

  const getCarList = async (forceRefresh = false) => {
    if (!forceRefresh && !isCacheExpired()) {
      console.log(
        "Using cached data, cache expires in",
        Math.floor((CACHE_DURATION - (Date.now() - lastRefreshTime)) / 1000),
        "seconds"
      );
      return;
    }
    setLoading(true);
    try {
      const filters = searchText ? { keyword: searchText } : undefined;
      const response = await ApiService.getCarWithPagin(
        currentPage,
        pageSize,
        filters
      );
      setDataSource(response.data.cars);
      setTotal(response.data.total);
      setLastRefreshTime(Date.now());
    } catch (error: any) {
      console.error(
        "Error fetching car list:",
        error.response?.data || error.message
      );
      toast.error("Failed to fetch car list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCarBrands();
  }, []);

  useEffect(() => {
    getCarList(true);

    // Set up periodic background refresh
    const timer = setInterval(() => {
      if (isCacheExpired()) {
        console.log("Cache expired, refreshing data");
        getCarList(true);
      }
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const carAddHandler = () => {
    setInputTitle("Add New Car");
    setSelectedCar(null);
    form.resetFields();
    setIsInputDialog(true);
  };

  const carEditHandler = async (id: number) => {
    setIsFormLoading(true);
    try {
      const response = await ApiService.getCarDetail(id);
      const car = response.data;
      setSelectedCar(car);
      setSelectedCarId(id);

      const brandOption = brandsList.find(
        (brand) => brand.label === car.carbrand_name
      );

      if (brandOption) {
        setBrand(brandOption.value.toString());
        await getCarModels(brandOption.value);
      }

      form.setFieldsValue({
        plate_no: car.plate_no,
        total_seats: car.total_seats,
        price: car.price,
        carbrand_name: brandOption?.value,
        cargallery_image_path: car.cargallery_image_path,
      });

      setInputTitle("Edit Car");
      setIsInputDialog(true);
    } catch (error) {
      console.error("Error fetching car details:", error);
      toast.error("Failed to fetch car details. Please try again.");
    } finally {
      setIsFormLoading(false);
    }
  };

  const carDeleteHandler = (id: number) => {
    setSelectedCarId(id);
    setIsDeleteConfirmDialog(true);
  };

  const tableChangeHandler = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const validatePayload = (values: any): boolean => {
    if (!values.carmodel_title) {
      toast.error("Please select a car model");
      return false;
    }

    if (!values.carbrand_name) {
      toast.error("Please select a car brand");
      return false;
    }

    return true;
  };

  const createNewCarHandler = async (e: any) => {
    e.preventDefault();
    try {
      setIsFormLoading(true);
      const values = await form.validateFields();

      if (!validatePayload(values)) {
        setIsFormLoading(false);
        return;
      }

      console.log("Values===>", values);

      const payload: CreateCarPayload = {
        carmodel_id: values.carmodel_title,
        image_path: values.cargallery_image_path,
        plate_no: values.plate_no,
        price: parseInt(values.price),
        total_seats: parseInt(values.total_seats),
      };

      const response = await ApiService.createNewCar(payload);
      let newCar: CarType;

      if (response.data && response.data.id) {
        newCar = response.data;
      } else {
        const tempId = Math.max(...dataSource.map((car) => car.id), 0) + 1;
        newCar = {
          id: tempId,
          plate_no: values.plate_no,
          total_seats: parseInt(values.total_seats),
          price: parseInt(values.price),
          cargallery_image_path: values.cargallery_image_path,
          carbrand_name:
            brandsList.find((b) => b.value === values.carbrand_name)?.label ||
            "",
          carmodel_title:
            modelsList.find((m) => m.value === values.carmodel_title)?.label ||
            "",
        };
      }

      setDataSource((prevData) => [newCar, ...prevData]);
      setTotal((prev) => prev + 1);

      toast.success("Car created successfully!");
      setIsInputDialog(false);
    } catch (error: any) {
      if (error.errorFields) {
        // This is a form validation error, don't show toast
        console.log("Form validation error:", error.errorFields);
      } else {
        // This is an API or other error
        console.error(
          "Error creating car:",
          error.response?.data || error.message
        );
        toast.error("Failed to create car. Please try again.");
      }
    } finally {
      setIsFormLoading(false);
    }
  };

  const updateCarHandler = async (e: any) => {
    e.preventDefault();
    if (!selectedCarId) return;

    try {
      setIsFormLoading(true);
      const values = await form.validateFields();

      const payload: CreateCarPayload = {
        carmodel_id: values.carmodel_title,
        image_path: values.cargallery_image_path,
        plate_no: values.plate_no,
        price: parseInt(values.price),
        total_seats: parseInt(values.total_seats),
      };

      await ApiService.updateCar(selectedCarId, payload);
      const updatedCar: CarType = {
        ...selectedCar!,
        id: selectedCarId,
        plate_no: values.plate_no,
        total_seats: parseInt(values.total_seats),
        price: parseInt(values.price),
        cargallery_image_path: values.cargallery_image_path,
        carbrand_name:
          brandsList.find((b) => b.value === values.carbrand_name)?.label || "",
        carmodel_title:
          modelsList.find((m) => m.value === values.carmodel_title)?.label ||
          "",
      };

      setDataSource((prevData) =>
        prevData.map((car) => (car.id === selectedCarId ? updatedCar : car))
      );
      toast.success("Car updated successfully!");
      setIsInputDialog(false);
    } catch (error: any) {
      if (error.errorFields) {
        console.log("Form validation error:", error.errorFields);
      } else {
        console.error(
          "Error updating car:",
          error.response?.data || error.message
        );
        toast.error("Failed to update car. Please try again.");
      }
    } finally {
      setIsFormLoading(false);
    }
  };

  const onClose = () => {
    setIsInputDialog(false);
    setIsDeleteConfirmDialog(false);
    form.resetFields();
  };

  const deleteConfirmHandler = async () => {
    if (!selectedCarId) return;

    try {
      setIsFormLoading(true);
      await ApiService.deleteCar(selectedCarId);
      setDataSource((prevData) =>
        prevData.filter((car) => car.id !== selectedCarId)
      );
      setTotal((prev) => prev - 1);

      toast.success("Car deleted successfully!");
      setIsDeleteConfirmDialog(false);
    } catch (error: any) {
      console.error(
        "Error deleting car:",
        error.response?.data || error.message
      );
      toast.error("Failed to delete car. Please try again.");
    } finally {
      setIsFormLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getCarList(true);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [currentPage, pageSize, searchText]);

  const handleSearch = () => {
    setCurrentPage(1);
    getCarList();
  };

  const handleBrandChange = async (value: number) => {
    setBrand(value.toString());
    form.setFieldValue("carmodel_title", undefined);

    try {
      await getCarModels(value);
    } catch (error) {
      console.error("Error loading car models:", error);
      toast.error("Failed to load car models. Please try again.");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Brand Name",
      dataIndex: "carbrand_name",
      key: "brandname",
    },
    {
      title: "Car Model",
      dataIndex: "carmodel_title",
      key: "carmodelname",
    },
    {
      title: "Price ($)",
      dataIndex: "price",
      key: "price",
      sorter: (a: CarType, b: CarType) => a.price - b.price,
    },
    {
      title: "Plate No",
      dataIndex: "plate_no",
      key: "plate_no",
      sorter: (a: CarType, b: CarType) =>
        String(a.plate_no).localeCompare(String(b.plate_no)),
    },
    {
      title: "Total Seats",
      dataIndex: "total_seats",
      key: "total_seats",
      sorter: (a: CarType, b: CarType) => a.total_seats - b.total_seats,
    },
    {
      title: "Car Image",
      dataIndex: "cargallery_image_path",
      key: "cargallery_image_path",
      render: (cargallery_image_path: string) => (
        <Avatar src={cargallery_image_path} />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: React.ReactNode, record: { id: number }) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="primary"
            onClick={() => carEditHandler(record.id)}>
            Edit
          </Button>

          <Button
            icon={<DeleteOutlined />}
            type="primary"
            danger
            onClick={() => carDeleteHandler(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white">
      <h2 className="mb-4">Car Management</h2>

      <Space style={{ marginBottom: "16px" }}>
        <Input
          placeholder="Search by Brand"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={handleSearch}
          prefix={<SearchOutlined />}
          style={{ width: "300px" }}
          allowClear
        />
        <Button type="primary" onClick={carAddHandler}>
          Add Car
        </Button>
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
          showTotal: (total) => `Total ${total} cars`,
        }}
        onChange={tableChangeHandler}
        loading={loading}
        bordered
        scroll={{ x: "max-content" }}
      />

      <InputDialog
        isOpen={isInputDialog}
        onClose={onClose}
        title={inputTitle}
        onCancel={onClose}
        onSubmit={
          inputTitle === "Edit Car" ? updateCarHandler : createNewCarHandler
        }
        isLoading={isFormLoading}
        onChangePasswordClick={() => {}}
        isChangePassword={false}
        isEditing={false}>
        <Form form={form} layout="vertical">
          <Form.Item
            name="plate_no"
            label="Plate No"
            rules={[
              { required: true, message: "Please input the plate number!" },
            ]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="total_seats"
            label="Total Seats"
            rules={[
              { required: true, message: "Please input the total seats!" },
            ]}>
            <Input type="number" min={1} />
          </Form.Item>
          <Form.Item
            name="price"
            label="Price ($)"
            rules={[{ required: true, message: "Please input the price!" }]}>
            <Input type="number" min={0} />
          </Form.Item>

          <Form.Item
            name="carbrand_name"
            label="Brand Name"
            rules={[{ required: true }]}>
            <Select
              allowClear
              showSearch
              placeholder="Select car brands"
              options={brandsList}
              onChange={handleBrandChange}
              className="w-full"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              filterSort={(optionA, optionB) =>
                (optionA?.label ?? "")
                  .toLowerCase()
                  .localeCompare((optionB?.label ?? "").toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            name="carmodel_title"
            label="Car Model Title"
            rules={[
              { required: true, message: "Please select the car model!" },
            ]}>
            <Select
              allowClear
              showSearch
              placeholder={
                modelsList.length === 0 && brand
                  ? "Loading models..."
                  : "Select car model"
              }
              options={modelsList}
              className="w-full"
              loading={modelsList.length === 0 && brand !== null}
              disabled={!brand || modelsList.length === 0}
            />
          </Form.Item>

          <Form.Item
            name="cargallery_image_path"
            label="Car Image URL"
            rules={[
              { required: true, message: "Please input the car image URL!" },
            ]}>
            <Input />
          </Form.Item>
        </Form>
      </InputDialog>

      <ConfirmDialog
        isOpen={isDeleteConfirmDialog}
        onClose={onClose}
        title="Are you sure you want to delete this Car?"
        onOk={deleteConfirmHandler}
        onCancel={() => setIsDeleteConfirmDialog(false)}
        isLoading={isFormLoading}></ConfirmDialog>
    </div>
  );
};

export default CarsManagement;
