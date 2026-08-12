import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import {
  Layout,
  Card,
  Typography,
  Form,
  Input,
  Button,
  message,
  Space,
} from "antd";
import { useState } from "react";
import { useNavigate } from "react-router";
import { authAPI } from "../lib/authAPI";

const { Header, Content } = Layout;

type ForgotPasswordForm = {
  email: string;
};

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: ForgotPasswordForm) => {
    try {
      setLoading(true);

      await authAPI.forgotPassword(values.email);

      message.success(
        "If the email is registered, a password reset link has been sent."
      );

      setTimeout(() => {
        navigate("/login");
      }, 500);
    } catch (error) {
      const err = error as any;
      message.error(
        err?.response?.data?.message ??
          "Failed to send reset password email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1890ff",
          color: "#fff",
          fontSize: "20px",
          fontWeight: "bold",
          letterSpacing: 2,
        }}
      >
        BNCC MEMBER APP
      </Header>

      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          background:
            "linear-gradient(180deg,#f5f5f5 0%,#ececec 100%)",
        }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: 430,
            boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <Typography.Title
              level={3}
              style={{ marginBottom: 8, color: "#1890ff" }}
            >
              Forgot Password
            </Typography.Title>

            <Typography.Text type="secondary">
              Enter your email address.
              <br />
              We'll send you a link to reset your password.
            </Typography.Text>
          </div>

          <Form
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
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
                size="large"
                prefix={<MailOutlined />}
                placeholder="example@bncc.net"
              />
            </Form.Item>

            <Space
              direction="vertical"
              style={{ width: "100%" }}
              size="middle"
            >
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
              >
                Send Reset Link
              </Button>

              <Button
                icon={<ArrowLeftOutlined />}
                block
                onClick={() => navigate("/login")}
              >
                Back to Login
              </Button>
            </Space>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default ForgotPassword;
