import React, { useEffect, useRef, useState } from "react";
import './style.css';
import { Table, Card, Modal, Tag, Button, Typography } from "antd";
import { HomeTwoTone, ApartmentOutlined, DownOutlined, RightOutlined, DatabaseOutlined, UpOutlined, DashboardOutlined } from "@ant-design/icons";
import ServerCard from '../../Components/ServerCard';
import ServerDetail from '../../Components/ServerDetail';
import Context from "Data/Context";
import { fetchStart as fetchStartApi } from '../../util/CallAPI';
import { fetchStart } from '../../appRedux/features/common/commonSlice';
import { useDispatch, useSelector } from "react-redux";
import { usePermission } from "../../Hooks/usePermission";

const { Title, Text } = Typography;
const columns = [
    {
        title: "TT",
        width: 60,
        align: "center",
        render: (text, record, index) => index + 1
    },
    {
        title: 'Tag',
        dataIndex: 'tag',
        width: 120,
        render: (tag) => {
            const colorMap = {
                OK: "success",
                Info: "blue",
                Informational: "blue",
                Warning: "gold",
                Warn: "gold",
                Error: "red",
                Critical: "volcano",
                Danger: "volcano",
            };

            return <Tag color={colorMap[tag] || "default"}>{tag}</Tag>;
        },
    },
    {
        title: 'Thời gian',
        dataIndex: 'time',
        key: 'time',
        width: 200,
    },
    {
        title: 'Tên máy chủ',
        dataIndex: 'tenMayChu',
        key: 'tenMayChu',
    },
    {
        title: 'Thông tin nhật ký',
        dataIndex: 'message',
        key: 'message',
    },
];

const styles = {
    mask: {
        backgroundImage: `linear-gradient(to top, #18181b 0, rgba(21, 21, 22, 0.2) 100%)`,
    }
};

const buildTreeData = (list) => {
    if (!list) return [];
    const map = {};
    const roots = [];
    list.forEach(item => {
        map[item.id] = { ...item, children: [] };
    });
    list.forEach(item => {
        if (item.parent_Id && map[item.parent_Id]) {
            map[item.parent_Id].children.push(map[item.id]);
        } else {
            roots.push(map[item.id]);
        }
    });
    return roots;
};

const levelColors = [
    { border: '#00529c', icon: '#00529c' },
    { border: 'green', icon: 'green' },
    { border: '#fa8c16', icon: '#fa8c16' },
    { border: '#722ed1', icon: '#722ed1' },
];

const RenderDonViTree = ({ nodes, level = 0 }) => {
    const [collapsed, setCollapsed] = React.useState({});

    if (!nodes || nodes.length === 0) return null;
    const colorSet = levelColors[level % levelColors.length];

    const toggleCollapse = (id) => {
        setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const countServers = (node) => {
        let count = node.lst_Servers ? node.lst_Servers.length : 0;
        if (node.children && node.children.length > 0) {
            node.children.forEach(child => {
                count += countServers(child);
            });
        }
        return count;
    };

    return nodes.map((item) => {
        const hasChildren = item.children && item.children.length > 0;
        const isCollapsed = collapsed[item.id];
        const serverCount = countServers(item);

        return (
            <div key={item.id} style={{ marginLeft: level * 24, marginBottom: 8 }}>
                <Card
                    size={level > 0 ? "small" : "default"}
                    style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                    title={
                        <div className="card-title-main">
                            {level === 0 ? <HomeTwoTone /> : <ApartmentOutlined style={{ color: colorSet.icon }} />}
                            <p style={{ color: colorSet.border }}>
                                <Tag color={colorSet.border} style={{ marginRight: 8 }}>Cấp {level}</Tag>
                                {item.tenDonVi}
                                <span style={{
                                    marginLeft: 8,
                                    fontSize: '13px',
                                    fontWeight: 'normal',
                                    background: '#f3f4f6',
                                    padding: '2px 8px',
                                    borderRadius: '12px'
                                }}>
                                    {serverCount} servers
                                </span>
                            </p>
                            {hasChildren && (
                                <Button
                                    type="text"
                                    size="small"
                                    icon={isCollapsed ? <RightOutlined /> : <DownOutlined />}
                                    onClick={() => toggleCollapse(item.id)}
                                    style={{ marginLeft: 'auto', color: colorSet.border }}
                                />
                            )}
                        </div>
                    }>
                    {
                        item.lst_Servers?.length > 0 && item.lst_Servers.map((server, idx) => (
                            <Card.Grid hoverable={false} className="car-gird" key={idx}>
                                <ServerCard Server_Id={server.id} MaServer={server.maServer} title={server.tenServer} status={server.lst_Status} />
                            </Card.Grid>
                        ))
                    }
                    {hasChildren && !isCollapsed && (
                        <div style={{ marginTop: 8 }}>
                            <RenderDonViTree nodes={item.children} level={level + 1} />
                        </div>
                    )}
                </Card>
            </div>
        );
    });
};

const ContentComponent = () => {
    const { openModal, setOpenModal, serverInfo } = React.useContext(Context);
    const dispatch = useDispatch();
    const [logData, setLogData] = useState([]);
    const [showLog, setShowLog] = useState(false);

    const { response: donViList, loading } = useSelector(
        (state) => state.common
    );

    const fetchLogs = () => {
        fetchStartApi({
            url: "/api/IdracLog/GetNotOk",
            method: "GET",
            params: { pageSize: 200 },
        }).then((response) => {
            if (response.status === 200) {
                const mapped = response.data.map(item => ({
                    id: item.id,
                    tag: item.serverity || 'Unknown',
                    time: item.timestamp ? new Date(item.timestamp.endsWith('Z') ? item.timestamp : item.timestamp + 'Z').toLocaleString('vi-VN') : '',
                    tenMayChu: item.tenServer,
                    message: item.logMessage,
                }));
                setLogData(mapped);
            }
        });
    };

    useEffect(() => {
        dispatch(
            fetchStart({
                url: "/api/DonVi",
                method: "GET",
                params: {
                    page: 1,
                    pageSize: 200,
                },
                key: 'donViList'
            })
        );
        fetchLogs();
    }, [dispatch]);

    const treeData = buildTreeData(donViList["donViList"]?.list);

    return (
        <div
            className="content-main">
            <div style={{ flex: 1, overflowY: "auto" }}>
                <RenderDonViTree nodes={treeData} />
            </div>
            <div className="log-panel">
                <div className="log-panel-header">
                    <DatabaseOutlined className="log-panel-icon" />
                    <span className="log-panel-title">System Logs</span>
                    <Tag color="blue" style={{ marginLeft: 'auto' }}>{logData.length} entries</Tag>
                    <Button className="log-panel-button" onClick={() => setShowLog(!showLog)} >
                        {showLog ? <UpOutlined /> : <DownOutlined />}
                    </Button>
                </div>
                {showLog && <Table
                    columns={columns}
                    dataSource={logData}
                    pagination={false}
                    rowKey="id"
                    scroll={{ y: 140 }}
                    size="small"
                    className="log-table"
                />}
            </div>
            <Modal
                footer={null}
                title={<div className="dashboard-header">
                    <Title level={3} className="dashboard-title">
                        <DashboardOutlined /> Tổng quan
                    </Title>
                    <Text type="secondary">Giám sát hệ thống máy chủ.</Text>
                </div>}
                style={{ top: 20 }}
                width={{
                    xs: '95%',
                    sm: '95%',
                    md: '95%',
                    lg: '95%',
                    xl: '95%',
                    xxl: '95%',
                }}
                open={openModal}
                onCancel={() => setOpenModal(false)}
                enforceFocus={false}
            >
                <ServerDetail />
            </Modal>
        </div>
    );
}
export default ContentComponent;
