import {
  Layout,
  Card,
  Tag,
  Typography,
  Row,
  Col,
  Space,
  Avatar
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  BookOutlined
} from '@ant-design/icons';

const { Content } = Layout;
const { Title, Text } = Typography;

// Extended interface for dashboard display
interface DashboardSession extends ClassSession {
	title: string;
	status: 'Active' | 'Upcoming' | 'Absent' | 'Attended' | 'Rescheduled';
	period: string;
	date: string;
	week: number;
	time: string;
	description?: string;
}

const mockSessions: DashboardSession[] = [
  {
    id: 1,
    session_id: 1,
    class_id: 1,
    schedule: new Date('2024-07-08T18:00:00'),
    recording_url: '',
    session_documentation_url: '',
    title: 'Introduction to React',
    status: 'Absent',
    period: '2024-2025',
    date: 'Tuesday, July 8',
    week: 1,
    time: '18:00',
    description: 'Session 1'
  },
  {
    id: 2,
    session_id: 2,
    class_id: 1,
    schedule: new Date('2024-07-08T18:00:00'),
    recording_url: '',
    session_documentation_url: '',
    title: 'Project Initialization',
    status: 'Attended',
    period: '2024-2025',
    date: 'Tuesday, July 8',
    week: 2,
    time: '18:00',
    description: 'Session 2'
  },
  {
    id: 3,
    session_id: 3,
    class_id: 1,
    schedule: new Date('2024-07-15T18:00:00'),
    recording_url: '',
    session_documentation_url: '',
    title: 'useEffect and useState with React',
    status: 'Active',
    period: '2024-2025',
    date: 'Tuesday, July 15',
    week: 3,
    time: '18:00',
    description: 'Session 3'
  },
  {
    id: 4,
    session_id: 4,
    class_id: 1,
    schedule: new Date('2024-07-22T18:00:00'),
    recording_url: '',
    session_documentation_url: '',
    title: 'Introduction to React',
    status: 'Upcoming',
    period: '2024-2025',
    date: 'Tuesday, July 22',
    week: 4,
    time: '18:00',
    description: 'Session 4'
  },
  {
    id: 5,
    session_id: 5,
    class_id: 1,
    schedule: new Date('2024-07-29T18:00:00'),
    recording_url: '',
    session_documentation_url: '',
    title: 'Introduction to React',
    status: 'Upcoming',
    period: '2024-2025',
    date: 'Tuesday, July 29',
    week: 5,
    time: '18:00',
    description: 'Session 5'
  },
  {
    id: 6,
    session_id: 6,
    class_id: 1,
    schedule: new Date('2024-08-05T18:00:00'),
    recording_url: '',
    session_documentation_url: '',
    title: 'Introduction to React',
    status: 'Rescheduled',
    period: '2024-2025',
    date: 'Tuesday, August 5',
    week: 6,
    time: '18:00',
    description: 'Session 6'
  }
];

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

export default function Dashboard() {
  const currentSession = mockSessions.find(session => session.status === 'Active');
  
  const stats = {
    upcoming: mockSessions.filter(s => s.status === 'Upcoming').length,
    absences: mockSessions.filter(s => s.status === 'Absent').length
  };

  return (
    <Layout className="min-h-screen">
      <div className="pt-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <Title level={3} className="!mb-0 !text-gray-800">
              Welcome back, Member!
            </Title>
            <Avatar size="large" icon={<UserOutlined />} className="bg-blue-500" />
          </div>
        </div>
      </div>
      
      <Content className="p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="mb-6 border-0 shadow-sm">
            <Text className="text-gray-600 text-sm">
              You are currently enrolled in Front-End Development Class
            </Text>
          </Card>

          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12}>
              <Card className="text-center border-0 shadow-sm">
                <Title level={2} className="!mb-1 !text-blue-600">
                  12
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
               {mockSessions.map((session) => (
                 <Card 
                   key={session.id}
                   className={`cursor-pointer transition-all hover:shadow-md ${
                     session.status === 'Active' 
                       ? 'border-green-500 bg-green-50' 
                       : 'border-gray-200 hover:border-blue-300'
                   }`}
                   bodyStyle={{ padding: '16px' }}
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