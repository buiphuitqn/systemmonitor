import React, { useEffect, useRef, useState } from "react";
import './style.css';
import { Table, Card, Modal, Tag } from "antd";
import { HomeTwoTone, ClearOutlined } from "@ant-design/icons";
import ServerCard from '../../Components/ServerCard';
import ServerDetail from '../../Components/ServerDetail';
import Context from "Data/Context";
import { fetchStart } from '../../appRedux/features/common/commonSlice';
import { useDispatch, useSelector } from "react-redux";
import { usePermission } from "../../Hooks/usePermission";

const columns = [
    {
        title: "",
        dataIndex: "index",
        width: 60,
    },
    {
        title: 'Tag',
        dataIndex: 'tag',
        width: 120,
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
        width: 200,
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

const styles = {
    mask: {
        backgroundImage: `linear-gradient(to top, #18181b 0, rgba(21, 21, 22, 0.2) 100%)`,
    }
};
const ContentComponent = () => {
    const { openModal, setOpenModal, serverInfo } = React.useContext(Context);
    const dispatch = useDispatch();

    const { response: donViList, loading } = useSelector(
        (state) => state.common
    );

    useEffect(() => {
        console.log(donViList)
        dispatch(
            fetchStart({
                url: "/api/DonVi",
                method: "GET",
                params: {
                    page: 1,
                    pageSize: 20,
                },
                key: 'donViList'
            })
        );
    }, [dispatch]);

    return (
        <div
            className="content-main">
            <div style={{ flex: 1, overflowY: "auto" }}>
                {
                    donViList["donViList"]?.list?.map((item, index) => (
                        <Card
                            key={index}
                            title={
                                <div className="card-title-main"><HomeTwoTone /><p>{item.tenDonVi}</p></div>
                            }>
                            {
                                item.lst_Servers?.map((server, idx) => (
                                    <Card.Grid hoverable={false} className="car-gird" key={idx}>
                                        <ServerCard Server_Id={server.id} MaServer={server.maServer} title={server.tenServer} status={server.lst_Status} />
                                    </Card.Grid>
                                ))
                            }
                        </Card>
                    ))
                }
            </div>
            <div style={{ height: 200, borderTop: "1px solid #ddd", background: "#fff" }}>
                LOG TABLE
                <Table
                    columns={columns}
                    dataSource={data}
                    pagination={false}
                    rowKey="index"
                    scroll={{ y: 400 }}
                    size="small" />
            </div>
            <Modal
                footer={null}
                title={`Server Details`}
                styles={styles}
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
            >
                <ServerDetail />
            </Modal>
        </div>
    );
}
export default ContentComponent;