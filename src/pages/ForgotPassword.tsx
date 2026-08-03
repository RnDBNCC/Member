import { useState } from "react";
import { Card, Form, Input, Button, Typography, App } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { Link } from "react-router";

import { authAPI } from "../lib/authAPI";

const { Title, Text } = Typography;

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const onFinish = async (values: { email: string }) => {
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword(values.email);

      message.success(
        response.data?.message ||
          "If that email address is registered, you will receive a reset link shortly."
      );
    } catch (error: any) {
      console.error(error);

      message.error(
        error?.response?.data?.message ||
          "Failed to send reset password email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#f5f5f5]"
      style={{ padding: 24 }}
    >
      <Card
        style={{
          width: 450,
          borderRadius: 16,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={3}>Forgot Password</Title>

          <Text type="secondary">
            Enter your email address and we will send you a password reset link.
          </Text>
        </div>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: "Please enter your email",
              },
              {
                type: "email",
                message: "Invalid email format",
              },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="example@bncc.net"
              size="large"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
          >
            Send Reset Link
          </Button>
        </Form>

        <div
          style={{
            marginTop: 20,
            textAlign: "center",
          }}
        >
          <Link to="/login">
            Back to Login
          </Link>
        </div>
      </Card>
    </div>
  );
}