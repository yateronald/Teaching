import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Card,
    message,
    Space,
    Typography,
    Tag,
    Tabs,
    Row,
    Col,
    Statistic,
    Input,
    Select,
    Empty,
    List,
    Avatar,

} from 'antd';
import {
    DownloadOutlined,
    FileOutlined,
    SearchOutlined,
    FolderOutlined,
    EyeOutlined,

    BookOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;
const { Option } = Select;

interface Resource {
    id: number;
    title: string;
    description: string;
    file_name: string;
    file_path: string;
    file_size: number;
    file_type: string;
    batch_id: number;
    batch_name?: string;
    teacher_name: string;
    is_public: boolean;
    download_count: number;
    created_at: string;
    uploaded_by: number;
}

interface ResourceStats {
    total_resources: number;
    public_resources: number;
    batch_resources: number;
    total_downloads: number;
    recent_downloads: number;
}

const StudentResources: React.FC = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
    const [stats, setStats] = useState<ResourceStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterBatch, setFilterBatch] = useState<string>('all');
    const { apiCall } = useAuth();

    useEffect(() => {
        fetchResources();
        fetchStats();
    }, []);

    useEffect(() => {
        filterResources();
    }, [resources, searchTerm, filterType, filterBatch]);

    const fetchResources = async () => {
        setLoading(true);
        try {
            const response = await apiCall('/resources/available');
            if (response.ok) {
                const data = await response.json();
                setResources(data.resources || []);
            } else {
                message.error('Failed to fetch resources');
            }
        } catch (error) {
            message.error('Error fetching resources');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiCall('/resources/my-stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const filterResources = () => {
        let filtered = resources;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(resource =>
                resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                resource.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                resource.teacher_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Type filter
        if (filterType !== 'all') {
            filtered = filtered.filter(resource => {
                const fileType = resource.file_type.toLowerCase();
                switch (filterType) {
                    case 'document':
                        return fileType.includes('pdf') || fileType.includes('doc') || fileType.includes('text');
                    case 'presentation':
                        return fileType.includes('ppt') || fileType.includes('presentation');
                    case 'spreadsheet':
                        return fileType.includes('xls') || fileType.includes('sheet');
                    case 'image':
                        return fileType.includes('image') || fileType.includes('jpg') || fileType.includes('png');
                    case 'video':
                        return fileType.includes('video') || fileType.includes('mp4');
                    case 'audio':
                        return fileType.includes('audio') || fileType.includes('mp3');
                    case 'archive':
                        return fileType.includes('zip') || fileType.includes('rar');
                    default:
                        return true;
                }
            });
        }

        // Batch filter
        if (filterBatch !== 'all') {
            if (filterBatch === 'public') {
                filtered = filtered.filter(resource => resource.is_public);
            } else {
                filtered = filtered.filter(resource => resource.batch_name === filterBatch);
            }
        }

        setFilteredResources(filtered);
    };

    const handleDownload = async (resource: Resource) => {
        try {
            const response = await apiCall(`/resources/${resource.id}/download`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = resource.file_name;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                message.success('Resource downloaded successfully');
                // Refresh resources to update download count
                fetchResources();
                fetchStats();
            } else {
                message.error('Failed to download resource');
            }
        } catch (error) {
            message.error('Error downloading resource');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileType: string) => {
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('doc')) return '📝';
        if (fileType.includes('ppt')) return '📊';
        if (fileType.includes('xls')) return '📈';
        if (fileType.includes('image')) return '🖼️';
        if (fileType.includes('video')) return '🎥';
        if (fileType.includes('audio')) return '🎵';
        if (fileType.includes('zip') || fileType.includes('rar')) return '📦';
        return '📁';
    };

    const getFileTypeCategory = (fileType: string) => {
        const type = fileType.toLowerCase();
        if (type.includes('pdf') || type.includes('doc') || type.includes('text')) return 'Document';
        if (type.includes('ppt') || type.includes('presentation')) return 'Presentation';
        if (type.includes('xls') || type.includes('sheet')) return 'Spreadsheet';
        if (type.includes('image') || type.includes('jpg') || type.includes('png')) return 'Image';
        if (type.includes('video') || type.includes('mp4')) return 'Video';
        if (type.includes('audio') || type.includes('mp3')) return 'Audio';
        if (type.includes('zip') || type.includes('rar')) return 'Archive';
        return 'Other';
    };

    const columns: ColumnsType<Resource> = [
        {
            title: 'Resource',
            key: 'resource',
            render: (_, record) => (
                <Space>
                    <span style={{ fontSize: '20px' }}>{getFileIcon(record.file_type)}</span>
                    <div>
                        <Text strong>{record.title}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {record.description}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                            {record.file_name} ({formatFileSize(record.file_size)})
                        </Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Type',
            key: 'type',
            render: (_, record) => (
                <Tag color="blue">{getFileTypeCategory(record.file_type)}</Tag>
            ),
        },
        {
            title: 'Source',
            key: 'source',
            render: (_, record) => (
                <div>
                    <div>
                        <TeamOutlined /> {record.teacher_name}
                    </div>
                    <div style={{ marginTop: 4 }}>
                        {record.is_public ? (
                            <Tag color="green">Public</Tag>
                        ) : (
                            <Tag color="orange">{record.batch_name}</Tag>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: 'Downloads',
            dataIndex: 'download_count',
            key: 'download_count',
            render: (count: number) => count || 0,
        },
        {
            title: 'Uploaded',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Button
                    type="primary"
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(record)}
                >
                    Download
                </Button>
            ),
        },
    ];

    const publicResources = filteredResources.filter(resource => resource.is_public);
    const batchResources = filteredResources.filter(resource => !resource.is_public);
    const recentResources = filteredResources
        .sort((a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf())
        .slice(0, 10);

    const uniqueBatches = Array.from(new Set(resources.map(r => r.batch_name).filter(Boolean)));

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Title level={2}>
                    <FolderOutlined /> Learning Resources
                </Title>
            </div>

            {stats && (
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Total Resources"
                                value={stats.total_resources}
                                prefix={<BookOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Public Resources"
                                value={stats.public_resources}
                                prefix={<TeamOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="My Downloads"
                                value={stats.total_downloads}
                                prefix={<DownloadOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Recent Downloads"
                                value={stats.recent_downloads}
                                prefix={<EyeOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            <Card style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Search
                            placeholder="Search resources..."
                            allowClear
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            prefix={<SearchOutlined />}
                        />
                    </Col>
                    <Col span={8}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Filter by type"
                            value={filterType}
                            onChange={setFilterType}
                        >
                            <Option value="all">All Types</Option>
                            <Option value="document">Documents</Option>
                            <Option value="presentation">Presentations</Option>
                            <Option value="spreadsheet">Spreadsheets</Option>
                            <Option value="image">Images</Option>
                            <Option value="video">Videos</Option>
                            <Option value="audio">Audio</Option>
                            <Option value="archive">Archives</Option>
                        </Select>
                    </Col>
                    <Col span={8}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Filter by source"
                            value={filterBatch}
                            onChange={setFilterBatch}
                        >
                            <Option value="all">All Sources</Option>
                            <Option value="public">Public Resources</Option>
                            {uniqueBatches.map(batch => (
                                <Option key={batch} value={batch}>{batch}</Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
            </Card>

            <Card>
                <Tabs defaultActiveKey="all">
                    <TabPane tab={`All Resources (${filteredResources.length})`} key="all">
                        {filteredResources.length > 0 ? (
                            <Table
                                columns={columns}
                                dataSource={filteredResources}
                                rowKey="id"
                                loading={loading}
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                }}
                            />
                        ) : (
                            <Empty description="No resources found" />
                        )}
                    </TabPane>
                    
                    <TabPane tab={`Public (${publicResources.length})`} key="public">
                        {publicResources.length > 0 ? (
                            <Table
                                columns={columns}
                                dataSource={publicResources}
                                rowKey="id"
                                loading={loading}
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                }}
                            />
                        ) : (
                            <Empty description="No public resources available" />
                        )}
                    </TabPane>
                    
                    <TabPane tab={`Batch Resources (${batchResources.length})`} key="batch">
                        {batchResources.length > 0 ? (
                            <Table
                                columns={columns}
                                dataSource={batchResources}
                                rowKey="id"
                                loading={loading}
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                }}
                            />
                        ) : (
                            <Empty description="No batch-specific resources available" />
                        )}
                    </TabPane>
                    
                    <TabPane tab={`Recent (${recentResources.length})`} key="recent">
                        {recentResources.length > 0 ? (
                            <List
                                itemLayout="horizontal"
                                dataSource={recentResources}
                                renderItem={(resource) => (
                                    <List.Item
                                        actions={[
                                            <Button
                                                key="download"
                                                type="primary"
                                                size="small"
                                                icon={<DownloadOutlined />}
                                                onClick={() => handleDownload(resource)}
                                            >
                                                Download
                                            </Button>
                                        ]}
                                    >
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar 
                                                    style={{ backgroundColor: '#1890ff' }}
                                                    icon={<FileOutlined />}
                                                />
                                            }
                                            title={
                                                <Space>
                                                    <span>{getFileIcon(resource.file_type)}</span>
                                                    <Text strong>{resource.title}</Text>
                                                    <Tag color={getFileTypeCategory(resource.file_type) === 'Document' ? 'blue' : 'green'}>
                                                        {getFileTypeCategory(resource.file_type)}
                                                    </Tag>
                                                </Space>
                                            }
                                            description={
                                                <div>
                                                    <Paragraph ellipsis={{ rows: 1 }}>{resource.description}</Paragraph>
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                        By {resource.teacher_name} • {dayjs(resource.created_at).fromNow()} • {formatFileSize(resource.file_size)}
                                                    </Text>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty description="No recent resources" />
                        )}
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default StudentResources;