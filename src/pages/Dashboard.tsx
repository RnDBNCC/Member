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
  type MenuProps
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  BookOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { NotificationOutlined } from '@ant-design/icons';

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

export default function Dashboard() {
  const navigate = useNavigate();
  const [enrolledClass, setEnrolledClass] = useState<Class | null>(null);
  const [sessions, setSessions] = useState<DashboardSession[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const classData = await getMyClass();
      const sessionData = await getMySessions();
      const announcementData = await getAnnouncements();

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
          {announcements.length > 0 && (
            <div className="mb-6">
              <Title level={4} className="!mb-4 !text-gray-800 flex items-center">
                <NotificationOutlined className="mr-2 text-yellow-500" />
                Latest Announcements
              </Title>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <Card key={announcement.id} className="border-0 border-l-4 border-l-yellow-400 bg-yellow-50 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <Title level={5} className="!mb-0 text-blue-800">
                        {announcement.name}
                      </Title>
                      {announcement.createdAt && (
                        <Text className="text-xs text-gray-500">
                          {dayjs(announcement.createdAt).format("DD MMM YYYY, HH:mm")}
                        </Text>
                      )}
                    </div>
                    {announcement.image && (
                      <div className="mb-4 rounded-xl overflow-hidden max-h-64 flex justify-center">
                        <img 
                          src={announcement.image} 
                          alt={announcement.name} 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <Paragraph className="text-gray-700 mb-0 whitespace-pre-wrap">
                      {announcement.content}
                    </Paragraph>
                  </Card>
                ))}
              </div>
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
    </Layout>
  );
}