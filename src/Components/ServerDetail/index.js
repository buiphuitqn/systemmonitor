import React from "react";
import { Descriptions, Card, Tag,Table } from "antd";
import ItemStatus from "../ItemStatus";
import './style.css';

const columns = [
    {
        title: "",
        dataIndex: "index",
        width: 30,
    },
    {
        title: 'Tag',
        dataIndex: 'tag',
        render: (tag) => {
            const colorMap = {
                Debug: "default",
                Info: "blue",
                Warn: "gold",
                Error: "red",
                Danger: "volcano",
            };

            return <Tag color={colorMap[tag]}>{tag}</Tag>;
        },
    },
    {
        title: 'TIME',
        dataIndex: 'time',
        key: 'time',
    },
    {
        title: 'MESSAGE',
        dataIndex: 'message',
        key: 'message',
    },
];
const data = [
    {
        index: 1,
        tag: 'Error',
        time: '2024-06-01 12:00:00',
        message: 'CPU usage exceeded threshold',
    },
    {
        index: 2,
        tag: 'Warn',
        time: '2024-06-01 12:05:00',
        message: 'Memory usage high',
    }
]
const ServerDetail = () => {
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
                <Descriptions.Item label="Hostname">SRV-APP-01</Descriptions.Item>
                <Descriptions.Item label="IP">10.40.4.10</Descriptions.Item>
                <Descriptions.Item label="OS">Windows Server 2022</Descriptions.Item>
                <Descriptions.Item label="CPU">Intel Xeon Gold</Descriptions.Item>
                <Descriptions.Item label="RAM">32 GB</Descriptions.Item>
                <Descriptions.Item label="Disk">500 GB</Descriptions.Item>
            </Descriptions>
            <Card title="Status" style={{ marginTop: 16 }}>
                <Card.Grid className="card-server-detail">
                    <ItemStatus item="CPU" status="OK" />
                </Card.Grid>
                <Card.Grid className="card-server-detail">
                    <ItemStatus item="ram" status="Warning" />
                </Card.Grid>
                <Card.Grid className="card-server-detail">
                    <ItemStatus item="Storage" status="Critical" />
                </Card.Grid>
            </Card>
            <Table
                    columns={columns}
                    dataSource={data}
                    pagination={false}
                    className="table-server-detail"
                    rowKey="index"
                    scroll={{ y: 400 }}
                    size="small" />
        </div>
    );
}
export default ServerDetail;