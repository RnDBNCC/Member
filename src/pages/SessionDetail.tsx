import {
  Layout,
  Card,
  Tag,
  Typography,
  Row,
  Col,
  Space,
  Avatar,
  Breadcrumb,
  Button,
  Divider,
  Descriptions,
  Alert 
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  PlayCircleOutlined,
  SyncOutlined 
} from '@ant-design/icons';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const mockSession = {
  id: 3,
  sessionNumber: 3,
  totalSessions: 12,
  title: 'useEffect and useState with React',
  status: 'Rescheduled', 
  description:
    'This session provides a deep dive into two of the most fundamental React Hooks: `useState` for managing state within functional components and `useEffect` for handling side effects like data fetching, subscriptions, or manually changing the DOM. We will cover the core concepts, common patterns, and potential pitfalls to avoid when working with these hooks.',
  praetorian: {
    name: 'Reynard Amadeus',
    avatarUrl: '#'
  },
  className: 'Front-End Development',
  recordingUrl: '#', 
  date: 'Tuesday, July 19 2025',
  startTime: '18:00',
  endTime: '20:00',
  rescheduleInfo: {
    newDate: 'Wednesday, July 20 2025',
    newStartTime: '19:00',
    newEndTime: '21:00',
  }
};

const getStatusTag = (status: string) => {
  switch (status) {
    case 'Active':
      return <Tag color="processing" style={{ fontSize: '14px', padding: '5px 10px' }}>Active</Tag>;
    case 'Attended':
      return <Tag color="success" style={{ fontSize: '14px', padding: '5px 10px' }}>Attended</Tag>;
    case 'Upcoming':
      return <Tag color="blue" style={{ fontSize: '14px', padding: '5px 10px' }}>Upcoming</Tag>;
    case 'Absent':
      return <Tag color="error" style={{ fontSize: '14px', padding: '5px 10px' }}>Absent</Tag>;
    case 'Rescheduled':
      return <Tag icon={<SyncOutlined />} color="warning" style={{ fontSize: '14px', padding: '5px 10px' }}>Rescheduled</Tag>;
    default:
      return <Tag style={{ fontSize: '14px', padding: '5px 10px' }}>{status}</Tag>;
  }
};

export default function SessionDetail() {
  const {
    sessionNumber,
    totalSessions,
    title,
    date,
    startTime,
    endTime,
    status,
    description,
    praetorian,
    className,
    recordingUrl,
    rescheduleInfo 
  } = mockSession;

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content>
        <Space 
          direction="vertical" 
          size="middle" 
          style={{ 
            display: 'flex', 
            maxWidth: '1280px', 
            margin: '0 auto',
            padding: '48px' 
          }}
        >
          <Breadcrumb
            items={[
              { href: '/', title: <HomeOutlined /> },
              { title: `Session ${sessionNumber}` },
            ]}
          />

          <Card style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <Row justify="space-between" align="top" style={{ marginBottom: '16px' }}>
              <Col>
                <Title level={3} style={{ marginBottom: '4px' }}>
                  {`Session ${sessionNumber}: ${title}`}
                </Title>
                <Space split={<Divider type="vertical" />} size="small">
                  <Text type="secondary">
                    <CalendarOutlined style={{ marginRight: '8px' }} />
                    {status === 'Rescheduled' ? rescheduleInfo.newDate : date}
                  </Text>
                  <Text type="secondary">
                    <ClockCircleOutlined style={{ marginRight: '8px' }} />
                    {status === 'Rescheduled' ? `${rescheduleInfo.newStartTime} - ${rescheduleInfo.newEndTime}` : `${startTime} - ${endTime}`}
                  </Text>
                </Space>
              </Col>
              <Col>{getStatusTag(status)}</Col>
            </Row>

            {status === 'Rescheduled' && rescheduleInfo && (
              <Alert
                message="This session has been rescheduled."
                description={
                  <Space direction="vertical">
                    <Text>Original Schedule: <Text delete>{date}, {startTime} - {endTime}</Text></Text>
                    <Text>New Schedule: <Text strong>{rescheduleInfo.newDate}, {rescheduleInfo.newStartTime} - {rescheduleInfo.newEndTime}</Text></Text>
                  </Space>
                }
                type="warning"
                showIcon
                style={{ marginBottom: '16px' }}
              />
            )}

            <Divider />

            <Row gutter={[32, 24]}>
              <Col xs={24} lg={16}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Card type="inner" title="Session Description">
                    <Paragraph>{description}</Paragraph>
                  </Card>
                  
                  <Card type="inner" title="Resources">
                    <Button 
                      type="primary" 
                      icon={<PlayCircleOutlined />} 
                      href={recordingUrl} 
                      disabled={status === 'Upcoming'}
                    >
                      View Recording
                    </Button>
                  </Card>
                </Space>
              </Col>
              
              <Col xs={24} lg={8}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Card type="inner" title="Praetorian">
                    <Space align="center">
                      <Avatar size="large" icon={<UserOutlined />} className="bg-blue-500" />
                      <Text strong>{praetorian.name}</Text>
                    </Space>
                  </Card>
                  <Card type="inner" title="Session Information">
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Class">
                        {className}
                      </Descriptions.Item>
                      <Descriptions.Item label="Week">
                        {`${sessionNumber} of ${totalSessions}`}
                      </Descriptions.Item>
                      <Descriptions.Item label="Status">
                        {status === 'Attended' ? 'Completed' : 'Pending'}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Space>
              </Col>
            </Row>
          </Card>
        </Space>
      </Content>
    </Layout>
  );
}