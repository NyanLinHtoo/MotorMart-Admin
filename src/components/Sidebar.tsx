import React from "react";
import { Layout, Menu, MenuProps, Tooltip } from "antd";
import {
  UserOutlined,
  CarOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Map paths to menu keys
  const pathToKey: { [key: string]: string } = {
    "/users": "1",
    "/cars": "2",
    "/spareparts": "3",
    "/carorders": "4",
    "/spareorders": "5",
  };

  // Get current selected key based on path
  const getCurrentKey = () => {
    const path = location.pathname;
    return pathToKey[path] || "1";
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "1",
      icon: <UserOutlined />,
      label: (
        <Tooltip placement="right" title="User Management">
          <Link to="/users">User Management</Link>
        </Tooltip>
      ),
      onClick: () => navigate("/users"),
    },
    {
      key: "2",
      icon: <CarOutlined />,
      label: (
        <Tooltip placement="right" title="Car Management">
          <Link to="/cars">Car Management</Link>
        </Tooltip>
      ),
      onClick: () => navigate("/cars"),
    },
    {
      key: "3",
      icon: <BankOutlined />,
      label: (
        <Tooltip placement="right" title="SparePart Management">
          <Link to="/spareparts">SparePart Management</Link>
        </Tooltip>
      ),
      onClick: () => navigate("/spareparts"),
    },
    {
      key: "4",
      icon: <ShoppingOutlined />,
      label: (
        <Tooltip placement="right" title="Car Order Management">
          <Link to="/carorders">Car Order Management</Link>
        </Tooltip>
      ),
      onClick: () => navigate("/carorders"),
    },
    {
      key: "5",
      icon: <ShoppingCartOutlined />,
      label: (
        <Tooltip placement="right" title="SparePart Order Management">
          <Link to="/spareorders">SparePart Order Management</Link>
        </Tooltip>
      ),
      onClick: () => navigate("/spareorders"),
    },
  ];

  return (
    <Sider width={200} theme="light" className="min-h-screen">
      <div className="logo py-4 text-center text-lg font-bold">Admin Panel</div>
      <Menu
        mode="inline"
        defaultSelectedKeys={[getCurrentKey()]}
        items={menuItems}
        className="ant-menu-word-wrap"
      />
    </Sider>
  );
};

export default Sidebar;
