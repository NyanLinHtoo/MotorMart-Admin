import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button } from "antd";
import {
  UserOutlined,
  LockOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import ApiService from "../../api_service/apiService";
import { AddAdminUserPayload } from "../../types/login";

const Register = () => {
  const navigate = useNavigate();
  const onFinish = async (values: AddAdminUserPayload) => {
    try {
      const response = await ApiService.createAdminUser(values);
      toast.success(response.data.message);
      navigate("/login");
    } catch (err: any) {
      toast.error(err.response.data.error);
    }
  };

  return (
    <div className="py-10 g-gradient-to-br from-gray-100 to-gray-300 flex  justify-center ">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Split Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Section */}
          <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white p-8 flex flex-col justify-center text-center">
            <h2 className="text-3xl font-bold mb-4">Welcome!</h2>
            <p className="text-lg">
              Join us today and gain access to all our amazing features.
            </p>
            <img
              src="/images/login.jpg"
              alt="Register Illustration"
              className="mt-8 hidden md:block mx-auto w-3/4 rounded-xl"
            />
          </div>

          {/* Right Section */}
          <div className="p-6 sm:p-12">
            <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
            <Form name="register" onFinish={onFinish} scrollToFirstError>
              {/* Username Field */}
              <Form.Item
                name="username"
                rules={[
                  {
                    required: true,
                    message: "Please input your username!",
                  },
                ]}>
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Username"
                />
              </Form.Item>

              {/* Email Field */}
              <Form.Item
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Please input your email!",
                  },
                ]}>
                <Input
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="Email"
                />
              </Form.Item>

              {/* PhoneNumber Field */}
              <Form.Item
                name="phonenumber"
                rules={[
                  {
                    required: true,
                    message: "Please input your phonenumber!",
                  },
                ]}>
                <Input
                  prefix={<PhoneOutlined className="text-gray-400" />}
                  placeholder="Phone"
                />
              </Form.Item>

              {/* Password Field */}
              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please input your password!",
                  },
                ]}
                hasFeedback>
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Password"
                />
              </Form.Item>

              {/* Confirm Password */}
              <Form.Item
                name="confirm"
                dependencies={["password"]}
                hasFeedback
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
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Confirm Password"
                />
              </Form.Item>

              {/* Register Button */}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full py-2 text-whit transition-all">
                  Register
                </Button>
              </Form.Item>

              {/* Back to Login */}
              <Form.Item className="text-center">
                <p className="text-sm">
                  Already have an account?{" "}
                  <Link to="/login" className="text-blue-500 hover:underline">
                    Back to login
                  </Link>
                </p>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
