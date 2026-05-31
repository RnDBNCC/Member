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
const { Title, Text } = Typography;

import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { getSessionDetail } from '../lib/learningApi';
import dayjs from 'dayjs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SessionData {
    id: number;
    sessionId: number;
    schedule: string;
    recordingUrl: string;
    sessionDocumentationUrl: string;
    class: {
        name: string;
        praetorianId: number;
    };
    absences: { status: string }[];
    rescheduleHistory: { schedule: string, status: string }[];
    praetorianName?: string;
    sessionDescription?: string;
}

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
  const { id } = useParams();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
        setLoading(true);
        getSessionDetail(id)
            .then(setSession)
            .catch(err => console.error("Failed to fetch session detail:", err))
            .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SyncOutlined spin style={{ fontSize: 24 }} /></Layout>;
  if (!session) return <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Text>Session not found</Text></Layout>;

  const scheduleDate = dayjs(session?.schedule);
  const userAbsence = session?.absences?.[0];
  const latestReschedule = session?.rescheduleHistory?.[session?.rescheduleHistory?.length - 1];

  let status = 'Upcoming';
  if (userAbsence) {
      status = userAbsence.status === 'present' ? 'Attended' : 'Absent';
  } else if (latestReschedule?.status === 'approved') {
      status = 'Rescheduled';
  } else if (scheduleDate.isBefore(dayjs())) {
      status = 'Upcoming';
  }

  const sessionDisplay = {
    sessionNumber: session.sessionId,
    totalSessions: 12, 
    title: session.class.name,
    status: status,
    description: session.sessionDescription || `This is session ${session.sessionId} of the ${session.class.name} course.`,
    praetorian: {
      name: session.praetorianName || `Praetorian ID: ${session.class.praetorianId}`, 
      avatarUrl: '#'
    },
    className: session.class.name,
    recordingUrl: session.recordingUrl,
    date: scheduleDate.format('dddd, MMMM D YYYY'),
    startTime: scheduleDate.format('HH:mm'),
    endTime: scheduleDate.add(2, 'hour').format('HH:mm'),
    rescheduleInfo: latestReschedule ? {
        newDate: dayjs(latestReschedule.schedule).format('dddd, MMMM D YYYY'),
        newStartTime: dayjs(latestReschedule.schedule).format('HH:mm'),
        newEndTime: dayjs(latestReschedule.schedule).add(2, 'hour').format('HH:mm'),
    } : null
  };

  const {
    sessionNumber,
    totalSessions,
    title,
    date,
    startTime,
    endTime,
    description,
    praetorian,
    className,
    recordingUrl,
    rescheduleInfo 
  } = sessionDisplay;

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
              { href: '/dashboard', title: <HomeOutlined /> },
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
                    {status === 'Rescheduled' && rescheduleInfo ? rescheduleInfo.newDate : date}
                  </Text>
                  <Text type="secondary">
                    <ClockCircleOutlined style={{ marginRight: '8px' }} />
                    {status === 'Rescheduled' && rescheduleInfo ? `${rescheduleInfo.newStartTime} - ${rescheduleInfo.newEndTime}` : `${startTime} - ${endTime}`}
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
                    <div 
                      className="markdown-body" 
                      style={{ 
                        wordBreak: 'break-word', 
                        overflowWrap: 'break-word',
                        lineHeight: 1.6 
                      }}
                    >
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({node, ...props}) => <h1 style={{fontSize: '1.5em', fontWeight: 'bold', marginBottom: '0.5em', marginTop: '1em'}} {...props} />,
                          h2: ({node, ...props}) => <h2 style={{fontSize: '1.25em', fontWeight: 'bold', marginBottom: '0.5em', marginTop: '1em'}} {...props} />,
                          ul: ({node, ...props}) => <ul style={{listStyleType: 'disc', paddingLeft: '1.5em', marginBottom: '1em'}} {...props} />,
                          li: ({node, ...props}) => <li style={{marginBottom: '0.25em'}} {...props} />,
                          p: ({node, ...props}) => <p style={{marginBottom: '1em'}} {...props} />,
                          strong: ({node, ...props}) => <strong style={{fontWeight: 600}} {...props} />,
                        }}
                      >
                        {description?.replace(/^[ \t]+/gm, '')}
                      </ReactMarkdown>
                    </div>
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