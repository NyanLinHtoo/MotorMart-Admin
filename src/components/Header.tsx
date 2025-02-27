import React from "react";
import { Avatar, Dropdown, MenuProps } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import UseAuth from "../auth/UseAuth";

import { toast } from "sonner";
const Header: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = UseAuth();

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "logout") {
      logout();
      toast.error("logout");
      navigate("/login");
    }
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
    },
  ];

  return (
    <div className="flex justify-between items-center bg-white shadow px-6 py-2">
      <div className="flex-grow text-center text-lg font-bold">Admin Page</div>
      <Dropdown
        menu={{ items: menuItems, onClick: handleMenuClick }}
        placement="bottomRight"
        trigger={["click"]}>
        <Avatar
          size="large"
          icon={<UserOutlined />}
          className="cursor-pointer"
        />
      </Dropdown>
    </div>
  );
};

export default Header;
