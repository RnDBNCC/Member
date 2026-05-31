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
  type MenuProps
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  BookOutlined,
  LogoutOutlined,
  NotificationOutlined,
  DownOutlined,
  UpOutlined
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
  const [showHistory, setShowHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const pageSize = 2;

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
  
  const sortedAnnouncements = [...announcements].sort((a, b) => 
    dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
  );

  const latestAnnouncement = sortedAnnouncements[0];
  const olderAnnouncements = sortedAnnouncements.slice(1);

  const startIndex = (historyPage - 1) * pageSize;
  const paginatedOlder = olderAnnouncements.slice(startIndex, startIndex + pageSize);

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
              <Title level={4} className="!mb-4 !text-gray-800 flex items-center">
                <NotificationOutlined className="mr-2 text-amber-500 animate-pulse" />
                Announcements
              </Title>
              
              {latestAnnouncement && (
                <Card 
                  className="border-0 border-l-4 border-l-amber-500 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #fffbeb 0%, #fff7ed 100%)',
                    borderRadius: '12px'
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <Space align="center" size="small">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-600"></span>
                      </span>
                      <Tag color="warning" className="font-semibold text-amber-700 bg-amber-100 border-amber-200">
                        LATEST
                      </Tag>
                      <Title level={5} className="!mb-0 text-amber-950 font-bold">
                        {latestAnnouncement.name}
                      </Title>
                    </Space>
                    {latestAnnouncement.createdAt && (
                      <Text className="text-xs text-amber-700/80 font-medium">
                        {dayjs(latestAnnouncement.createdAt).format("DD MMM YYYY, HH:mm")}
                      </Text>
                    )}
                  </div>
                  
                  {latestAnnouncement.image && (
                    <div className="mb-4 rounded-xl overflow-hidden max-h-72 flex justify-center bg-white/50 backdrop-blur-sm p-2 border border-amber-100 shadow-inner">
                      <img 
                        src={latestAnnouncement.image} 
                        alt={latestAnnouncement.name} 
                        className="w-full h-full object-contain rounded-lg hover:scale-[1.01] transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <Paragraph className="text-gray-700 mb-0 whitespace-pre-wrap leading-relaxed">
                    {latestAnnouncement.content}
                  </Paragraph>

                  {/* Toggle past announcements trigger inside the card or under it */}
                  {olderAnnouncements.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-amber-200/50 flex justify-between items-center">
                      <Text className="text-xs text-amber-700/70">
                        There are {olderAnnouncements.length} older announcement{olderAnnouncements.length > 1 ? 's' : ''} available.
                      </Text>
                      <Button 
                        type="primary"
                        ghost
                        size="small"
                        onClick={() => {
                          setShowHistory(!showHistory);
                          setHistoryPage(1); // Reset to page 1 on toggle
                        }}
                        className="flex items-center text-xs font-semibold border-amber-500 text-amber-600 hover:text-amber-700 hover:border-amber-600 hover:bg-amber-50"
                      >
                        <span className="mr-1">{showHistory ? 'Hide History' : 'View Past Announcements'}</span>
                        {showHistory ? <UpOutlined style={{ fontSize: '10px' }} /> : <DownOutlined style={{ fontSize: '10px' }} />}
                      </Button>
                    </div>
                  )}
                </Card>
              )}

              {/* Collapsible Section for Older Announcements */}
              {showHistory && olderAnnouncements.length > 0 && (
                <div className="mt-4 space-y-4 transition-all duration-300">
                  <div className="flex items-center gap-2 px-1 py-1">
                    <div className="h-[1px] bg-gray-200 flex-grow" />
                    <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Past Announcements</Text>
                    <div className="h-[1px] bg-gray-200 flex-grow" />
                  </div>
                  
                  <div className="space-y-3">
                    {paginatedOlder.map((announcement) => (
                      <Card 
                        key={announcement.id} 
                        className="border-0 border-l-4 border-l-slate-400 bg-white shadow-sm hover:shadow-md transition-all duration-200"
                        styles={{ body: { padding: '16px' } }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <Title level={5} className="!mb-0 text-slate-800 font-semibold text-sm">
                            {announcement.name}
                          </Title>
                          {announcement.createdAt && (
                            <Text className="text-xs text-gray-400">
                              {dayjs(announcement.createdAt).format("DD MMM YYYY, HH:mm")}
                            </Text>
                          )}
                        </div>
                        {announcement.image && (
                          <div className="mb-3 rounded-lg overflow-hidden max-h-48 flex justify-center bg-gray-50 border border-gray-100 p-1">
                            <img 
                              src={announcement.image} 
                              alt={announcement.name} 
                              className="w-full h-full object-contain rounded-md"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <Paragraph className="text-gray-600 mb-0 text-sm whitespace-pre-wrap leading-relaxed">
                          {announcement.content}
                        </Paragraph>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination for History */}
                  {olderAnnouncements.length > pageSize && (
                    <div className="flex justify-center pt-2">
                      <Pagination
                        current={historyPage}
                        pageSize={pageSize}
                        total={olderAnnouncements.length}
                        onChange={(page) => setHistoryPage(page)}
                        size="small"
                        showSizeChanger={false}
                      />
                    </div>
                  )}
                </div>
              )}
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