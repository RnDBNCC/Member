import {
  Layout,
  Card,
  Tag,
  Typography,
  Row,
  Col,
  Space,
  Avatar,
  Dropdown,
  Pagination,
  Button,
  Modal,
  Form,
  Input,
  message,
  type MenuProps
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  BookOutlined,
  LogoutOutlined,
  LockOutlined,
  NotificationOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

// Extended interface for dashboard display
interface DashboardSession {
  id: number;
  session_id: number;
  class_id: number;
  schedule: Date;
  recording_url: string;
  session_documentation_url: string;
  title: string;
  status: 'Active' | 'Upcoming' | 'Absent' | 'Attended' | 'Rescheduled';
  period: string;
  date: string;
  week: number;
  time: string;
  description?: string;
}

const getStatusColor = (status: DashboardSession['status']) => {
  switch (status) {
    case 'Active':
      return 'green';
    case 'Upcoming':
      return 'blue';
    case 'Absent':
      return 'red';
    case 'Attended':
      return 'green';
    case 'Rescheduled':
      return 'orange';
    default:
      return 'default';
  }
};

import Cookies from 'js-cookie';
import dayjs from 'dayjs';
import { getMyClass, getMySessions } from '../lib/learningApi';
import { getAnnouncements } from '../lib/announcementApi';
import { authAPI } from '../lib/authAPI';
import { useEffect, useState } from 'react';

interface Class {
    id: number;
    name: string;
    dayOfWeek: string;
    time: string;
    period: string;
}

interface Absence {
    id: number;
    status: string;
}

interface ClassSession {
    id: number;
    sessionId: number;
    schedule: string;
    class: Class;
    absences: Absence[];
}

interface ChangePasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [enrolledClass, setEnrolledClass] = useState<Class | null>(null);
  const [sessions, setSessions] = useState<DashboardSession[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [announcementPage, setAnnouncementPage] = useState(1);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const announcementPageSize = 4;

  // --- Ubah Password state ---
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordForm] = Form.useForm<ChangePasswordFormValues>();

  const fetchDashboardData = async () => {
    try {
      const classData = await getMyClass();
      const sessionData = await getMySessions();
      const announcementData = await getAnnouncements(classData?.name);

      setEnrolledClass(classData || null);
      setAnnouncements(announcementData);

      const sessionList = Array.isArray(sessionData) ? sessionData : [];
      const mappedSessions: DashboardSession[] = sessionList.map((s: ClassSession) => {
        const schedule = dayjs(s.schedule);
        const userAbsence = s.absences?.[0];
        
        const isToday = schedule.isSame(dayjs(), 'day');
        
        let status: DashboardSession['status'] = 'Upcoming';
        if (userAbsence) {
            status = userAbsence.status === 'present' ? 'Attended' : 'Absent';
        } else if (isToday) {
            status = 'Active';
        } else if (schedule.isBefore(dayjs())) {
            status = 'Upcoming'; // Or maybe 'Pending' if not yet marked
        }

        return {
          id: s.id,
          session_id: s.sessionId,
          class_id: s.class.id,
          schedule: new Date(s.schedule),
          recording_url: '',
          session_documentation_url: '',
          title: s.class.name,
          status: status,
          period: s.class.period,
          date: schedule.format('dddd, MMMM D'),
          week: s.sessionId,
          time: schedule.format('HH:mm'),
          description: `Session ${s.sessionId}`
        };
      });

      setSessions(mappedSessions);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const currentSession = sessions.find(s => s.status === 'Active') || sessions.find(s => s.status === 'Upcoming');

  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : { username: 'Guest', email: '' };

  const handleOpenChangePassword = () => {
    changePasswordForm.resetFields();
    setIsChangePasswordOpen(true);
  };

  const handleCloseChangePassword = () => {
    setIsChangePasswordOpen(false);
    changePasswordForm.resetFields();
  };

  const handleChangePasswordSubmit = async () => {
    try {
      const values = await changePasswordForm.validateFields();
      setChangePasswordLoading(true);

      await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });

      message.success('Password berhasil diubah.');
      handleCloseChangePassword();
    } catch (error: any) {
      // Validation error dari antd form (belum submit ke server)
      if (error?.errorFields) return;

      const apiMessage =
        error?.response?.data?.message ||
        'Gagal mengubah password. Silakan coba lagi.';
      message.error(apiMessage);
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div className="flex flex-col py-1">
          <Text strong className="text-sm border-0 bg-transparent text-gray-800">{user.username}</Text>
          <Text className="text-xs text-gray-500 border-0 bg-transparent">{user.email || 'No email'}</Text>
        </div>
      ),
      disabled: true,
      className: '!cursor-default',
    },
    { type: 'divider' },
    {
      key: 'change-password',
      icon: <LockOutlined />,
      label: 'Ubah Password',
      onClick: handleOpenChangePassword,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: () => {
        Cookies.remove('token');
        Cookies.remove('refreshToken');
        localStorage.removeItem('user');
        navigate('/');
      },
    },
  ];

  const stats = {
    upcoming: sessions.filter(s => s.status === 'Upcoming').length,
    absences: sessions.filter(s => s.status === 'Absent').length
  };
  
  const sortedAnnouncements = [...announcements].sort((a, b) => 
    dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
  );

  const startIndex = (announcementPage - 1) * announcementPageSize;
  const paginatedAnnouncements = sortedAnnouncements.slice(startIndex, startIndex + announcementPageSize);

  return (
    <Layout className="min-h-screen">
      <div className="pt-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <Title level={3} className="!mb-0 !text-gray-800">
              Welcome back, {user.username}!
            </Title>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <Avatar size="large" icon={<UserOutlined />} className="bg-blue-500 cursor-pointer hover:opacity-80 transition-opacity" />
            </Dropdown>
          </div>
        </div>
      </div>

      <Content className="p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="mb-6 border-0 shadow-sm" loading={loading}>
            <Text className="text-gray-600 text-sm">
              {enrolledClass 
                ? `You are currently enrolled in ${enrolledClass.name}` 
                : "You are not currently enrolled in any class"}
            </Text>
          </Card>

          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12}>
              <Card className="text-center border-0 shadow-sm">
                <Title level={2} className="!mb-1 !text-blue-600">
                  {stats.upcoming}
                </Title>
                <Text className="text-gray-600">Upcoming Sessions</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card className="text-center border-0 shadow-sm">
                <Title level={2} className="!mb-1 !text-red-500">
                  {stats.absences}
                </Title>
                <Text className="text-gray-600">Absences</Text>
              </Card>
            </Col>
          </Row>

          {currentSession && (
            <Card className="mb-6 border-l-4 border-l-green-500 shadow-sm bg-green-50">
              <div className="flex items-center gap-3 mb-3">
                <Tag color="green" className="!m-0">
                  Current Week
                </Tag>
              </div>
              <Title level={4} className="!mb-2">
                {currentSession.title}
              </Title>
              <Text className="text-gray-600">
                {currentSession.date} @{currentSession.time} - {currentSession.title}
              </Text>
              <br />
              <Text className="text-sm text-gray-500">
                Week {currentSession.week} of 12
              </Text>
            </Card>
          )}

          {/* Announcements Section */}
          {sortedAnnouncements.length > 0 && (
            <div className="mb-6">
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <NotificationOutlined className="text-amber-500 animate-pulse" />
                    <span className="text-gray-800 font-bold">Announcements</span>
                  </div>
                }
                className="border-0 shadow-sm"
              >
                <div className="divide-y divide-gray-100">
                  {paginatedAnnouncements.map((announcement) => (
                    <div
                      key={announcement.id}
                      onClick={() => setSelectedAnnouncement(announcement)}
                      className="py-4 first:pt-0 last:pb-0 cursor-pointer group flex flex-col md:flex-row md:items-center md:justify-between transition-all duration-200"
                    >
                      <div className="flex-1 pr-4">
                        <Text strong className="text-base text-gray-800 group-hover:text-blue-600 transition-colors duration-200 block">
                          {announcement.name}
                        </Text>
                        <Space className="text-xs text-gray-500 mt-1">
                          <CalendarOutlined className="text-gray-400" />
                          <span>{dayjs(announcement.createdAt).format("dddd, MMMM D, YYYY [at] h:mm A")}</span>
                        </Space>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <Button 
                          type="link" 
                          className="p-0 text-blue-500 group-hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                        >
                          View Details →
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {sortedAnnouncements.length > announcementPageSize && (
                  <div className="flex justify-center pt-6 border-t border-gray-100 mt-4">
                    <Pagination
                      current={announcementPage}
                      pageSize={announcementPageSize}
                      total={sortedAnnouncements.length}
                      onChange={(page) => setAnnouncementPage(page)}
                      showSizeChanger={false}
                    />
                  </div>
                )}
              </Card>

              {/* Announcement Details Modal */}
              <Modal
                title={
                  <div className="pr-6">
                    <Title level={4} className="!m-0 text-gray-800">
                      {selectedAnnouncement?.name}
                    </Title>
                    {selectedAnnouncement?.createdAt && (
                      <Space className="text-xs text-gray-500 mt-2 font-normal">
                        <CalendarOutlined className="text-gray-400" />
                        <span>
                          {dayjs(selectedAnnouncement.createdAt).format("dddd, MMMM D, YYYY [at] h:mm A")}
                        </span>
                      </Space>
                    )}
                  </div>
                }
                open={!!selectedAnnouncement}
                onCancel={() => setSelectedAnnouncement(null)}
                footer={[
                  <Button 
                    key="close" 
                    type="primary" 
                    onClick={() => setSelectedAnnouncement(null)}
                    className="bg-blue-600 hover:bg-blue-700 border-none"
                  >
                    Close
                  </Button>
                ]}
                width={600}
                centered
                destroyOnClose
              >
                <div className="py-4">
                  {selectedAnnouncement?.image && (
                    <div className="mb-4 rounded-xl overflow-hidden max-h-80 flex justify-center bg-gray-50 border border-gray-100 p-2 shadow-inner">
                      <img 
                        src={selectedAnnouncement.image} 
                        alt={selectedAnnouncement.name} 
                        className="w-full h-full object-contain rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <Paragraph className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap mb-0">
                    {selectedAnnouncement?.content}
                  </Paragraph>
                </div>
              </Modal>
            </div>
          )}

          {/* Sessions List */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <BookOutlined />
                <span>Sessions</span>
              </div>
            }
            className="border-0 shadow-sm"
          >
            <div className="space-y-3">
              {sessions.map((session) => (
                <Card
                  key={session.id}
                  onClick={() => navigate(`/session/${session.id}`)}
                  className={`cursor-pointer transition-all hover:shadow-md ${session.status === 'Active'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-blue-300'
                    }`}
                  styles={{ body: { padding: '16px' } }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Text strong className="text-base">
                          {session.description} - {session.title}
                        </Text>
                        <Tag color={getStatusColor(session.status)}>
                          {session.status}
                        </Tag>
                      </div>
                      <Space className="text-sm text-gray-600">
                        <CalendarOutlined />
                        <span>{session.date} @{session.time}</span>
                      </Space>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      </Content>

      {/* Ubah Password Modal */}
      <Modal
        title="Ubah Password"
        open={isChangePasswordOpen}
        onCancel={handleCloseChangePassword}
        centered
        destroyOnClose
        footer={[
          <Button key="batal" onClick={handleCloseChangePassword}>
            Batal
          </Button>,
          <Button
            key="simpan"
            type="primary"
            loading={changePasswordLoading}
            onClick={handleChangePasswordSubmit}
            className="bg-blue-600 hover:bg-blue-700 border-none"
          >
            Simpan
          </Button>,
        ]}
      >
        <Form
          form={changePasswordForm}
          layout="vertical"
          requiredMark="optional"
          className="mt-2"
        >
          <Form.Item
            label="Password Lama"
            name="oldPassword"
            rules={[{ required: true, message: 'Password lama wajib diisi' }]}
          >
            <Input.Password placeholder="Masukkan password lama" />
          </Form.Item>

          <Form.Item
            label="Password Baru"
            name="newPassword"
            rules={[
              { required: true, message: 'Password baru wajib diisi' },
              { min: 8, message: 'Password baru minimal 8 karakter' },
            ]}
          >
            <Input.Password placeholder="Masukkan password baru" />
          </Form.Item>

          <Form.Item
            label="Konfirmasi Password Baru"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Konfirmasi password wajib diisi' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Konfirmasi password baru tidak cocok'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Ulangi password baru" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}