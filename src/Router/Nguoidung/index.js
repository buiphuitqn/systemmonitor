import React from "react";
import './style.css';
import { Button, Input,Table } from "antd";

const { Search } = Input;
const columns = [
    {
        title: 'STT',
        dataIndex: 'stt',
        key: 'stt',
    },
    {
        title: 'Tên đơn vị',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Địa chỉ',
        dataIndex: 'address',
        key: 'address',
    },
    {
        title: 'Điện thoại',
        dataIndex: 'phone',
        key: 'phone',
    },
]
const Nguoidung = () => {
    return (
        <div className="nguoidung-main">
            <div className="nguoidung-header">
                <p>Danh sách người dùng</p>
                <Button type="primary">Thêm mới</Button>
            </div>
            <div className="nguoidung-search">
                <div>
                    <p>Từ khóa</p>
                    <Search placeholder="Nhập từ khóa"/>
                </div>
            </div>
            <div className="nguoidung-content">
                <Table columns={columns} dataSource={[]} />
            </div>
        </div>
    )
}
export default Nguoidung;