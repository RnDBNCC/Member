import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, Form, Input, Button, Typography, App } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import bnccWhiteLogo from '../assets/bncc-white.png';
import bnccBlackLogo from '../assets/bncc-black.png';
import smileImg from '../assets/Smile.png';

const { Title, Text } = Typography;

import { authService, decodeJWT } from '../lib/api';
import Cookies from 'js-cookie';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await authService.login(values.username, values.password);
      // Axios response data
      const responseData = response.data;
      const token = responseData.data?.token || responseData.token;
      const refreshToken = responseData.data?.refreshToken || responseData.refreshToken;

      if (token) {
        // Use Cookies for token as per user's interceptor request
        Cookies.set('token', token, { expires: 7 }); // 7 days
        if (refreshToken) {
          Cookies.set('refreshToken', refreshToken, { expires: 7 });
        }

        const decoded = decodeJWT(token);
        if (decoded) {
          localStorage.setItem('user', JSON.stringify(decoded));
        }

        message.success('Login successful!');
        navigate('/dashboard');
      } else {
        message.error('Invalid response from server');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.msg || error.response?.data?.message || error.message || 'Invalid username or password';
      message.error(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center p-4 relative"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <Card
        className="w-full max-w-4xl shadow-xl border-0 rounded-3xl overflow-hidden bg-white z-10"
        bodyStyle={{ padding: 0 }}
      >
        <div className="flex flex-col md:flex-row">
          {/* Left Side - Blue Branding */}
          <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-8 md:p-10 flex flex-col items-center justify-center text-white relative overflow-hidden hidden md:flex py-12">
            {/* Top Left Logo - Fixed to prevent shifting */}
            <div className="absolute top-10 left-10 z-20">
              <img src={bnccWhiteLogo} alt="BNCC" className="h-6 object-contain opacity-90" />
            </div>

            <div className="relative z-10 flex flex-col items-center max-w-sm mt-8">
              <img
                src={smileImg}
                alt="Welcome"
                className="w-[260px] h-auto object-contain drop-shadow-2xl mb-4"
              />
              <div className="flex flex-col items-center text-center mt-2">
                <Title level={3} className="!text-white !text-2xl !mb-2 drop-shadow-md tracking-wide">
                  Welcome to the <br /> Member Portal
                </Title>
                <Text className="text-blue-100 text-sm md:text-base drop-shadow-sm opacity-90 transition-all font-light tracking-wide">
                  Your journey into learning and training <br /> course starts here.
                </Text>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full md:w-1/2 p-8 sm:p-10 flex flex-col justify-center relative min-h-[440px] md:min-h-[460px]">
            {/* Mobile-only branding: Using Black Logo per request */}
            <div className="md:hidden flex flex-col items-center mb-6">
              <img src={bnccBlackLogo} alt="BNCC Logo" className="h-10 object-contain" />
            </div>

            <div className="mb-4 text-center md:text-left">
              <Title level={3} className="!mb-1 text-gray-800 font-bold tracking-tight">
                Sign In
              </Title>
              <Text className="text-gray-500">
                Access your learning sessions
              </Text>
            </div>

            <Form
              name="login_form"
              layout="vertical"
              initialValues={{ remember: true }}
              onFinish={onFinish}
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Please input your Username or Email!' }]}
                className="mb-4"
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Username or Email"
                  className="rounded-xl hover:border-blue-400 focus:border-blue-500 px-4 py-2"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please input your Password!' }]}
                className="mb-4"
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Password"
                  className="rounded-xl hover:border-blue-400 focus:border-blue-500 px-4 py-2"
                />
              </Form.Item>

              <Form.Item className="mt-4 mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full rounded-xl h-11 text-base font-semibold bg-blue-600 hover:bg-blue-500 shadow-md hover:shadow-lg transition-all"
                  loading={loading}
                >
                  Sign in
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Card>
    </div>
  );
}
