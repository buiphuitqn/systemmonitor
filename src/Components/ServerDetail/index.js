import React, { useEffect, useState, useRef } from "react";
import { Descriptions, Tag, Table, Spin, Card, Input, Typography, Row, Col } from "antd";
import ItemStatus from "../ItemStatus";
import './style.css';
import { fetchStart } from '../../util/CallAPI';
import Context from "Data/Context";
import Highlighter from 'react-highlight-words';
import { DashboardOutlined, DatabaseOutlined, SafetyCertificateOutlined, FireOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FaTelegramPlane, FaTemperatureHigh } from "react-icons/fa";


const { Title, Text } = Typography;
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="tooltip-time">{`Thời gian: ${label}`}</p>
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
    const { serverInfo } = React.useContext(Context);
    const [dataCard, setDataCard] = React.useState([]);
    const [infoServer, setInfoServer] = React.useState({});
    const [dataTable, setDataTable] = React.useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [historyData, setHistoryData] = useState([]);
    const [currentTempData, setCurrentTempData] = useState([]);
    const [loading, setLoading] = useState(true);

    const columns = [
        {
            title: "",
            dataIndex: "index",
            width: 30,
        },
        {
            title: 'Serverity',
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
            title: 'TIME',
            dataIndex: 'timestamp',
            key: 'time',
            width: 200,
            render: (timestamp) => timestamp ? new Date(timestamp.endsWith('Z') ? timestamp : timestamp + 'Z').toLocaleString('vi-VN') : '',
        },
        {
            title: 'MESSAGE',
            dataIndex: 'logMessage',
            key: 'message',
        },
    ];

    useEffect(() => {
        fetchStart({
            url: "/api/StatusModule/GetbyServerId",
            method: "GET",
            params: { serverId: serverInfo },
        })
            .then((response) => {
                if (response.status === 200) {
                    setDataCard(response.data);
                }
            });
        fetchStart({
            url: "/api/InfoServer/GetInfoByServerId",
            method: "GET",
            params: { serverId: serverInfo },
        })
            .then((response) => {
                if (response.status === 200) {
                    console.log(response.data);
                    setInfoServer(response.data[0]);
                }
            });
        fetchStart({
            url: "/api/IdracLog/GetbyServerId",
            method: "GET",
            params: { serverId: serverInfo },
        })
            .then((response) => {
                if (response.status === 200) {
                    console.log(response.data);
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
                    params: { serverId: serverInfo },
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
                    params: { serverId: serverInfo },
                })
                    .then((response) => {
                        if (response.status === 200) {
                            setHistoryData(response.data);
                            console.log(response.data);
                        }
                    });
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [serverInfo]);


    return (
        <div>
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
                                                <Cell key="cell-1" fill="#e5e7eb" />
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
                    <MenuFoldOutlined />Trạng thái các module
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
                            <FaTelegramPlane />Lịch sử Nhiệt độ Server (24h qua)
                        </div>
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={historyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dx={-10} unit="°C" />
                                <RechartsTooltip content={<CustomTooltip />} />
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
                    <span className="log-panel-title">System Logs</span>
                    <Input.Search
                        placeholder="Search logs..."
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: 250, marginLeft: 'auto' }}
                    />
                    <Tag color="blue" style={{ marginLeft: 16 }}>{dataTable.filter(item => (item.logMessage || '').toLowerCase().includes(searchTerm.toLowerCase())).length} entries</Tag>
                </div>
                <Table
                    columns={columns}
                    dataSource={dataTable.filter(item => (item.logMessage || '').toLowerCase().includes(searchTerm.toLowerCase()))}
                    pagination={false}
                    className="table-server-detail log-table"
                    rowKey="index"
                    tableLayout="fixed"
                    size="small"
                    scroll={{ y: 240 }}
                    virtual />
            </div>
        </div >
    );
}
export default ServerDetail;