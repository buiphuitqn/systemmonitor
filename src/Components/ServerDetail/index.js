import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Descriptions, Tag, Table, Spin, Card, Input, Typography, Row, Col, Button } from "antd";
import ItemStatus from "../ItemStatus";

import { fetchStart } from '../../util/CallAPI';
import Context from "Data/Context";
import Highlighter from 'react-highlight-words';
import { DashboardOutlined, DatabaseOutlined, SafetyCertificateOutlined, FireOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FaTelegramPlane, FaTemperatureHigh } from "react-icons/fa";
import { useTranslation } from 'react-i18next';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const CustomTooltip = ({ active, payload, label, t }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="tooltip-time">{`${t('content.time')}: ${label}`}</p>
                {payload.map((entry, index) => (
                    <p key={`item-${index}`} className="tooltip-item" style={{ color: entry.color }}>
                        <span className="tooltip-name">{entry.name}:</span> {entry.value} °C
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const ServerDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { serverInfo, theme } = React.useContext(Context);
    const serverId = location.state?.serverId;
    const activeServerId = serverId || serverInfo;
    const { t } = useTranslation();
    const [dataCard, setDataCard] = React.useState([]);
    const [infoServer, setInfoServer] = React.useState({});
    const [dataTable, setDataTable] = React.useState([]);
    const [dataLogs, setDataLogs] = React.useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchLogs, setSearchLogs] = useState('');
    const [historyData, setHistoryData] = useState([]);
    const [currentTempData, setCurrentTempData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [logPagination, setLogPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    const columns = [
        {
            title: t('unit.stt', "STT"),
            width: 50,
            align: 'center',
            render: (text, record, index) => index + 1
        },
        {
            title: t('Logs.SEVERITY', "SEVERITY"),
            dataIndex: 'serverity',
            width: 100,
            filters: [
                { text: 'OK', value: 'OK' },
                { text: 'Warning', value: 'Warning' },
                { text: 'Error', value: 'Error' },
                { text: 'Danger', value: 'Danger' },
            ],
            onFilter: (value, record) => record.serverity.includes(value),
            render: (serverity) => {
                const colorMap = {
                    Debug: "default",
                    OK: "green",
                    Info: "blue",
                    Warn: "gold",
                    Error: "red",
                    Danger: "volcano",
                };

                return <Tag color={colorMap[serverity]}>{serverity}</Tag>;
            },
        },
        {
            title: t('Logs.TIME', "TIME"),
            dataIndex: 'timestamp',
            key: 'time',
            width: 200,
            render: (timestamp) => timestamp ? new Date(timestamp.endsWith('Z') ? timestamp : timestamp + 'Z').toLocaleString('vi-VN') : '',
        },
        {
            title: t('Logs.MESSAGE', "MESSAGE"),
            dataIndex: 'logMessage',
            key: 'message',
        },
    ];

    const columnsModule = [
        {
            title: t('Modules.STT', "STT"),
            width: 50,
            align: 'center',
            render: (text, record, index) => index + 1
        },
        {
            title: t('Modules.ModuleName', "ModuleName"),
            dataIndex: 'moduleName',
        },
        {
            title: t('Modules.Status', "Status"),
            dataIndex: 'status',
            filters: [
                { text: 'OK', value: 'OK' },
                { text: 'Warning', value: 'Warning' },
                { text: 'Error', value: 'Error' },
                { text: 'Danger', value: 'Danger' },
            ],
            onFilter: (value, record) => record.status?.includes(value)
        },
        {
            title: t('Modules.ValueMonitor', "ValueMonitor"),
            dataIndex: 'valueMonitor',
        },
        {
            title: t('Modules.RecordedAt', "RecordedAt"),
            dataIndex: 'recordedAt',
            key: 'time',
            width: 200,
            render: (timestamp) => timestamp ? new Date(timestamp.endsWith('Z') ? timestamp : timestamp + 'Z').toLocaleString('vi-VN') : '',
        }
    ];

    const fetchHistoryLogs = useCallback((page = logPagination.current, pageSize = logPagination.pageSize, keyword = searchLogs) => {
        if (!activeServerId) return;
        fetchStart({
            url: "/api/StatusModule/GetHistorybyServer",
            method: "GET",
            params: {
                serverId: activeServerId,
                page: page,
                pageSize: pageSize,
                keyword: keyword
            },
        })
            .then((response) => {
                if (response.status === 200) {
                    const resData = response.data;
                    const logs = resData.data || [];
                    const total = resData.totalRow || logs.length;

                    setDataLogs(logs);
                    setLogPagination(prev => ({
                        ...prev,
                        current: page,
                        pageSize: pageSize,
                        total: total
                    }));
                }
            });
    }, [activeServerId, searchLogs]);

    useEffect(() => {
        if (!activeServerId) {
            navigate('/system');
            return;
        }

        fetchHistoryLogs(1, logPagination.pageSize, searchLogs);

        fetchStart({
            url: "/api/StatusModule/GetbyServerId",
            method: "GET",
            params: { serverId: activeServerId },
        })
            .then((response) => {
                if (response.status === 200) {
                    setDataCard(response.data);
                }
            });

        fetchStart({
            url: "/api/InfoServer/GetInfoByServerId",
            method: "GET",
            params: { serverId: activeServerId },
        })
            .then((response) => {
                if (response.status === 200) {
                    setInfoServer(response.data[0]);
                }
            });
        fetchStart({
            url: "/api/IdracLog/GetbyServerId",
            method: "GET",
            params: { serverId: activeServerId },
        })
            .then((response) => {
                if (response.status === 200) {
                    setDataTable(response.data);
                }
            });
        const loadDashboardData = async () => {
            setLoading(true);
            try {
                // Fetch Current Temps
                fetchStart({
                    url: '/api/StatusModule/GetCurrentTemperatures',
                    method: 'GET',
                    params: { serverId: activeServerId },
                })
                    .then((response) => {
                        if (response.status === 200) {
                            setCurrentTempData(response.data);
                        }
                    });

                // Fetch History Temps
                fetchStart({
                    url: '/api/StatusModule/GetTemperatureHistory',
                    method: 'GET',
                    params: { serverId: activeServerId },
                })
                    .then((response) => {
                        if (response.status === 200) {
                            setHistoryData(response.data);
                        }
                    });
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [activeServerId]);


    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/system')}
                >
                    {t('common.back', 'Back')}
                </Button>
                <Title level={3} style={{ margin: 0 }}>
                    <DashboardOutlined /> {t('content.overview')} - {infoServer.hostName || 'Server Detail'}
                </Title>
            </div>
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <Descriptions
                        bordered
                        column={{
                            xs: 1,
                            sm: 1,
                            md: 2,
                            lg: 2,
                            xl: 2,
                            xxl: 2,
                        }}
                        labelStyle={{ width: 120 }}
                        size="small">
                        <Descriptions.Item label="Manufacturer">{infoServer.manufacturer || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="System Mode">{infoServer.systemMode || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Host Name">{infoServer.hostName || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="CPU Model">{infoServer.cpuModel || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Memory Size">{infoServer.memorySize || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Service Tag">{infoServer.serviceTag || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="BIOS Version">{infoServer.biosVersion || 'N/A'}</Descriptions.Item>
                    </Descriptions>
                </Col>
                {(currentTempData.length > 0 ? currentTempData[0].temps : []).map((temp, index) => {
                    let color = '#52c41a'; // Default Green (0-50)
                    if (temp.value > 50 && temp.value <= 70) {
                        color = '#fadb14'; // Yellow
                    } else if (temp.value > 70 && temp.value <= 85) {
                        color = '#fa8c16'; // Orange
                    } else if (temp.value > 85) {
                        color = '#f5222d'; // Red
                    }

                    const data = [
                        { label: temp.label, value: temp.value },
                        { label: 'Trống', value: Math.max(0, 100 - temp.value) }
                    ];

                    return (
                        <Col span={4} key={index}>
                            <Card style={{ padding: '15px 10px 10px 10px' }}>
                                <div style={{ position: 'relative' }}>
                                    <ResponsiveContainer width="100%" aspect={2}>
                                        <PieChart>
                                            <Pie
                                                data={data}
                                                dataKey="value"
                                                nameKey="label"
                                                startAngle={180}
                                                endAngle={0}
                                                cx="50%"
                                                cy="100%"
                                                outerRadius="100%"
                                                innerRadius="60%"
                                                stroke="none"
                                            >
                                                <Cell key="cell-0" fill={color} />
                                                <Cell key="cell-1" fill={theme === 'dark' ? '#303030' : '#e5e7eb'} />
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '0',
                                        width: '100%',
                                        textAlign: 'center',
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        color: color
                                    }}>
                                        {temp.value}°C
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px' }}>
                                    {temp.label}
                                </div>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
            <Card style={{ marginTop: 20 }}>
                <div style={{ fontSize: '14px' }}>
                    <MenuFoldOutlined />{t('server_detail.module_status')}
                </div>
                <Card style={{ marginTop: 16 }}>
                    {
                        dataCard.map((item, idx) => (
                            <Card.Grid className={`card-server-detail card-server-detail-${item.status == "OK" ? item.status.toLowerCase() : "nok"}`} key={idx}>
                                <ItemStatus item={item.moduleName} valueMonitor={item.valueMonitor} status={item.status} timestamp={item.updatedDate} />
                            </Card.Grid>
                        ))
                    }
                </Card>
            </Card>
            <Card style={{ marginTop: 20, padding: 10 }}>
                {loading ? (
                    <div className="chart-loading"><Spin size="large" /></div>
                ) : (
                    <div className="chart-wrapper">
                        <div style={{ marginBottom: '10px', fontSize: '14px' }}>
                            <FaTelegramPlane />{t('server_detail.temp_history')}
                        </div>
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={historyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#303030' : '#e5e7eb'} />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.65)' : '#6b7280', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.65)' : '#6b7280', fontSize: 12 }} dx={-10} unit="°C" />
                                <RechartsTooltip content={<CustomTooltip t={t} />} />
                                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />

                                {historyData.length > 0 && Object.keys(historyData[0]).filter(k => k !== 'time').map((serverName, idx) => {
                                    const colors = ['#00529C', '#ffb74d', '#ef5350', '#66bb6a', '#ab47bc', '#26c6da', '#5c6bc0'];
                                    const color = colors[idx % colors.length];
                                    return (
                                        <Line key={idx} type="monotone" dataKey={serverName} stroke={color} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                                    );
                                })}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </Card>
            <div className="log-panel" style={{ marginTop: 16 }}>
                <div className="log-panel-header">
                    <DatabaseOutlined className="log-panel-icon" />
                    <span className="log-panel-title">{t('content.system_logs')}</span>
                    <Input.Search
                        placeholder={t('server_detail.search_logs')}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: 250, marginLeft: 'auto' }}
                    />
                    <Tag color="blue" style={{ marginLeft: 16 }}>{dataTable.filter(item => (item.logMessage || '').toLowerCase().includes(searchTerm.toLowerCase())).length} {t('content.entries')}</Tag>
                </div>
                <Table
                    columns={columns}
                    dataSource={dataTable.filter(item => (item.logMessage || '').toLowerCase().includes(searchTerm.toLowerCase()))}
                    pagination={false}
                    className="table-server-detail log-table"
                    rowKey={(record, idx) => record.id || idx}
                    tableLayout="fixed"
                    size="small"
                    scroll={{ y: 240 }}
                />
            </div>
            <div className="log-panel" style={{ marginTop: 16 }}>
                <div className="log-panel-header">
                    <DatabaseOutlined className="log-panel-icon" />
                    <span className="log-panel-title">{t('content.idrac_logs')}</span>
                    <Input.Search
                        placeholder={t('server_detail.search_idrac_logs', "Search Module Name...")}
                        onSearch={(value) => {
                            setSearchLogs(value);
                            fetchHistoryLogs(1, logPagination.pageSize, value);
                        }}
                        style={{ width: 250, marginLeft: 'auto' }}
                    />
                    <Tag color="blue" style={{ marginLeft: 16 }}>{logPagination.total} {t('content.entries')}</Tag>
                </div>
                <Table
                    columns={columnsModule}
                    dataSource={dataLogs}
                    pagination={{
                        current: logPagination.current,
                        pageSize: logPagination.pageSize,
                        total: logPagination.total,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        onChange: (page, pageSize) => {
                            fetchHistoryLogs(page, pageSize, searchLogs);
                        }
                    }}
                    className="table-server-detail log-table"
                    rowKey={(record, idx) => record.id || idx}
                    tableLayout="fixed"
                    size="small"
                    scroll={{ y: 240 }}
                />
            </div>
        </div >
    );
}
export default ServerDetail;
