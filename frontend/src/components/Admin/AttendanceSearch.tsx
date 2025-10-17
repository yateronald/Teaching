import React, { useState } from 'react';
import {
    Card,
    Input,
    Select,
    Button,
    Table,
    Space,
    Typography,
    Tag,
    Row,
    Col,
    Spin,
    Empty,
    message,
    Badge,
    Progress
} from 'antd';
import {
    SearchOutlined,
    UserOutlined,
    TeamOutlined,
    CalendarOutlined,
    BookOutlined,
    ClearOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

interface SearchResult {
    type: 'student' | 'session' | 'batch' | 'teacher';
    id: number;
    name: string;
    email?: string;
    batch_name?: string;
    teacher_name?: string;
    session_date?: string;
    attendance_rate?: number;
    total_sessions?: number;
    present_sessions?: number;
    relevance_score: number;
}

const AttendanceSearch: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<string>('all');
    const [minAttendance, setMinAttendance] = useState<number | null>(null);
    const [maxAttendance, setMaxAttendance] = useState<number | null>(null);
    const [batchFilter, setBatchFilter] = useState<number | null>(null);
    const [batches, setBatches] = useState<any[]>([]);

    const { apiCall } = useAuth();

    React.useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const response = await apiCall('/batches');
            if (response.ok) {
                const data = await response.json();
                setBatches(data);
            }
        } catch (error) {
            console.error('Error fetching batches:', error);
        }
    };

    const normalizeResults = (items: any[]): SearchResult[] => {
        return (Array.isArray(items) ? items : []).map((item: any) => {
            const type = item.type || item.result_type || 'student';
            const name =
                type === 'student' || type === 'teacher'
                    ? `${item.first_name ?? ''} ${item.last_name ?? ''}`.trim()
                    : item.name ?? item.subject ?? item.topic ?? '';
            return {
                type: type as SearchResult['type'],
                id: item.id,
                name,
                email: item.email,
                batch_name: item.batch_name,
                teacher_name: item.teacher_name,
                session_date: item.session_date ?? item.start_time,
                attendance_rate: item.attendance_rate,
                total_sessions: item.total_sessions,
                present_sessions: item.present_count ?? item.present_sessions,
                relevance_score: typeof item.relevance_score === 'number' ? item.relevance_score : 0,
            };
        });
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            message.warning('Please enter a search query');
            return;
        }

        setLoading(true);
        try {
            const params = new URLSearchParams();
            // Backend expects 'query' not 'q'
            params.append('query', searchQuery);
            // Map singular UI type to backend categories
            if (searchType !== 'all') {
                const backendType = searchType; // values set via Select: 'all' | 'students' | 'teachers' | 'batches' | 'sessions'
                params.append('type', backendType);
            }
            if (minAttendance !== null) params.append('min_attendance_rate', minAttendance.toString());
            if (maxAttendance !== null) params.append('max_attendance_rate', maxAttendance.toString());
            if (batchFilter) params.append('batch_id', batchFilter.toString());

            const response = await apiCall(`/attendance/search?${params}`);
            if (response.ok) {
                const data = await response.json();
                // Choose category array based on current type selection
                const categoryKey = searchType === 'all' ? 'all' : searchType; // matches backend keys
                const raw = data.results?.[categoryKey] || [];
                const normalized = normalizeResults(raw);
                setSearchResults(normalized);
                message.success(`Found ${Array.isArray(raw) ? raw.length : 0} results`);
            } else {
                setSearchResults([]);
                message.error('Search failed');
            }
        } catch (error) {
            console.error('Error searching:', error);
            message.error('Search failed');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setSearchQuery('');
        setSearchType('all');
        setMinAttendance(null);
        setMaxAttendance(null);
        setBatchFilter(null);
        setSearchResults([]);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'student': return <UserOutlined />;
            case 'teacher': return <UserOutlined />;
            case 'batch': return <TeamOutlined />;
            case 'session': return <CalendarOutlined />;
            default: return <BookOutlined />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'student': return 'blue';
            case 'teacher': return 'green';
            case 'batch': return 'orange';
            case 'session': return 'purple';
            default: return 'default';
        }
    };

    const columns = [
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: 100,
            render: (type: string) => (
                <Tag color={getTypeColor(type)} icon={getTypeIcon(type)}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                </Tag>
            ),
            filters: [
                { text: 'Student', value: 'student' },
                { text: 'Teacher', value: 'teacher' },
                { text: 'Batch', value: 'batch' },
                { text: 'Session', value: 'session' },
            ],
            onFilter: (value: any, record: SearchResult) => record.type === value,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (name: string, record: SearchResult) => (
                <div>
                    <Text strong>{name}</Text>
                    {record.email && (
                        <div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                {record.email}
                            </Text>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Batch',
            dataIndex: 'batch_name',
            key: 'batch_name',
            render: (batchName: string) => batchName || '-',
        },
        {
            title: 'Teacher',
            dataIndex: 'teacher_name',
            key: 'teacher_name',
            render: (teacherName: string) => teacherName || '-',
        },
        {
            title: 'Date',
            dataIndex: 'session_date',
            key: 'session_date',
            render: (date: string) => date ? dayjs(date).format('MMM DD, YYYY') : '-',
        },
        {
            title: 'Attendance Rate',
            dataIndex: 'attendance_rate',
            key: 'attendance_rate',
            render: (rate: number) => rate !== undefined ? (
                <Progress 
                    percent={Math.round(rate)} 
                    size="small"
                    status={rate >= 80 ? 'success' : rate >= 60 ? 'normal' : 'exception'}
                />
            ) : '-',
            sorter: (a: SearchResult, b: SearchResult) => (a.attendance_rate || 0) - (b.attendance_rate || 0),
        },
        {
            title: 'Sessions',
            key: 'sessions',
            render: (_: any, record: SearchResult) => {
                if (record.total_sessions !== undefined) {
                    return (
                        <div>
                            <Text>{record.present_sessions || 0}/{record.total_sessions}</Text>
                        </div>
                    );
                }
                return '-';
            },
        },
        {
            title: 'Relevance',
            dataIndex: 'relevance_score',
            key: 'relevance_score',
            width: 100,
            render: (score: number) => (
                <Badge 
                    count={Math.round(score * 100)} 
                    style={{ backgroundColor: score > 0.8 ? '#52c41a' : score > 0.5 ? '#1890ff' : '#faad14' }}
                />
            ),
            sorter: (a: SearchResult, b: SearchResult) => a.relevance_score - b.relevance_score,
            defaultSortOrder: 'descend' as const,
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>
                    <SearchOutlined /> Attendance Search
                </Title>
                <Text type="secondary">
                    Search across students, teachers, batches, and sessions with advanced filtering
                </Text>
            </div>

            {/* Search Filters */}
            <Card style={{ marginBottom: 24 }}>
                <Row gutter={16} align="middle">
                    <Col span={8}>
                        <Input
                            placeholder="Search by name, email, or batch..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onPressEnter={handleSearch}
                            prefix={<SearchOutlined />}
                        />
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Type"
                            value={searchType}
                            onChange={setSearchType}
                            style={{ width: '100%' }}
                        >
                            <Option value="all">All Types</Option>
                            <Option value="students">Students</Option>
                            <Option value="teachers">Teachers</Option>
                            <Option value="batches">Batches</Option>
                            <Option value="sessions">Sessions</Option>
                        </Select>
                    </Col>
                    <Col span={3}>
                        <Select
                            placeholder="Batch"
                            value={batchFilter}
                            onChange={setBatchFilter}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            {batches.map(batch => (
                                <Option key={batch.id} value={batch.id}>
                                    {batch.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={3}>
                        <Input
                            placeholder="Min %"
                            type="number"
                            min={0}
                            max={100}
                            value={minAttendance?.toString() || ''}
                            onChange={(e) => setMinAttendance(e.target.value ? Number(e.target.value) : null)}
                        />
                    </Col>
                    <Col span={3}>
                        <Input
                            placeholder="Max %"
                            type="number"
                            min={0}
                            max={100}
                            value={maxAttendance?.toString() || ''}
                            onChange={(e) => setMaxAttendance(e.target.value ? Number(e.target.value) : null)}
                        />
                    </Col>
                    <Col span={3}>
                        <Space>
                            <Button 
                                type="primary" 
                                icon={<SearchOutlined />}
                                onClick={handleSearch}
                                loading={loading}
                            >
                                Search
                            </Button>
                            <Button 
                                icon={<ClearOutlined />}
                                onClick={handleClear}
                            >
                                Clear
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Search Results */}
            <Card title={`Search Results (${searchResults.length})`}>
                <Spin spinning={loading}>
                    {searchResults.length > 0 ? (
                        <Table
                            columns={columns}
                            dataSource={Array.isArray(searchResults) ? searchResults : []}
                            rowKey={(record) => `${record.type}-${record.id}`}
                            pagination={{
                                pageSize: 20,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) => 
                                    `${range[0]}-${range[1]} of ${total} results`,
                            }}
                        />
                    ) : (
                        <Empty 
                            description={searchQuery ? "No results found" : "Enter a search query to begin"}
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    )}
                </Spin>
            </Card>
        </div>
    );
};

export default AttendanceSearch;