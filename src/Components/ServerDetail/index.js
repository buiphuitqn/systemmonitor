import React, { useEffect, useState, useRef } from "react";
import { Descriptions, Card, Tag, Table, ConfigProvider } from "antd";
import ItemStatus from "../ItemStatus";
import './style.css';
import { fetchStart } from '../../util/CallAPI';
import Context from "Data/Context";
import Highlighter from 'react-highlight-words';
import { Input, Button, Space } from 'antd';
import { SearchOutlined, DatabaseOutlined } from '@ant-design/icons';



const ServerDetail = () => {
    const { serverInfo } = React.useContext(Context);
    const [dataCard, setDataCard] = React.useState([]);
    const [infoServer, setInfoServer] = React.useState({});
    const [dataTable, setDataTable] = React.useState([]);
    const [searchTerm, setSearchTerm] = useState('');

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
    }, [serverInfo]);
    return (
        <div>
            <Descriptions
                bordered
                column={{
                    xs: 1,
                    sm: 1,
                    md: 2,
                    lg: 2,
                    xl: 3,
                    xxl: 4,
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
            <Card title="Status" style={{ marginTop: 16 }}>
                {
                    console.log(dataCard)
                }
                {
                    dataCard.map((item, idx) => (
                        <Card.Grid className={`card-server-detail card-server-detail-${item.status == "OK" ? item.status.toLowerCase() : "nok"}`} key={idx}>
                            <ItemStatus item={item.moduleName} valueMonitor={item.valueMonitor} status={item.status} timestamp={item.updatedDate} />
                        </Card.Grid>
                    ))
                }
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
        </div>
    );
}
export default ServerDetail;