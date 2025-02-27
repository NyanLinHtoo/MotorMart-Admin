import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Checkbox, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import UseAuth from "../../auth/UseAuth";
import { LoginPayload } from "../../types/login";
import { useAuthContext } from "../../auth/AuthContext";

const { Text } = Typography;

const Login = () => {
  const { login } = UseAuth();
  const { setUser } = useAuthContext();
  const navigate = useNavigate();

  const onFinish = async (values: LoginPayload) => {
    try {
      const response = await login(values);
      toast.success(response.data.message);
      setUser(response.data); // Set user in context
      const redirectUrl = localStorage.getItem("redirect_url");
      if (redirectUrl) {
        localStorage.removeItem("redirect_url"); // Clear the redirect URL after use
        navigate(redirectUrl);
      } else {
        navigate("/users"); // Default to the home page
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "An error occurred";

      // Log the error or show a toast notification
      toast.error(errorMessage);
    }
  };

  return (
    <div className="py-10 g-gradient-to-br from-gray-100 to-gray-300 flex  justify-center ">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-900 p-8 text-center">
          <h2 className="text-white text-3xl font-bold mb-2">Welcome Back!</h2>
          <Text className="text-gray-100 text-sm">
            Log in to access the full features of our platform.
          </Text>
        </div>

        {/* Form Section */}
        <div className="p-6">
          <Form
            name="login_form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
            className="space-y-4">
            <Form.Item
              name="usernameoremail"
              rules={[
                { required: true, message: "Please input your Username!" },
              ]}>
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="Enter your username or email."
                className="py-2"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your Password!" },
              ]}>
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Enter your password"
                className="py-2"
              />
            </Form.Item>

            <Form.Item>
              <div className="flex justify-between items-center">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox className="text-sm">Remember me</Checkbox>
                </Form.Item>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full py-2  text-md  transition-all">
                Login
              </Button>
              <p className="text-center text-sm mt-4">
                Don’t have an account?{" "}
                <Link to="/register" className="text-blue-600 hover:underline">
                  Register now!
                </Link>
              </p>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
