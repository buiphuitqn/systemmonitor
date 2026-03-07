import React from "react";
import './style.css';
import { Button, Select, Input, Table } from "antd";
import Column from "antd/es/table/Column";

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

const styles = {
    mask: {
        backgroundImage: `linear-gradient(to top, #18181b 0, rgba(21, 21, 22, 0.2) 100%)`,
    }
};
const Maychu = () => {
    const options = [{
        key: '1',
        label: 'Option 1',
        value: '1',
    }, {
        key: '2',
        label: 'Option 2',
        value: '2',
    }, {
        key: '3',
        label: 'Option 3',
        value: '3',
    }]
    return (
        <div className="maychu-main">
            <div className="maychu-header">
                <p>Danh sách máy chủ</p>
                <Button type="primary">Thêm mới</Button>
            </div>
            <div className="maychu-search">
                <div className="maychu-search-left">
                    <p>Đơn vị</p>
                    <Select options={options} className="maychu-search-select" />
                </div>
                <div className="maychu-search-right">
                    <p>Từ khóa</p>
                    <Search placeholder="Nhập từ khóa" />
                </div>
            </div>
            <div className="maychu-content">
                <Table columns={columns} dataSource={[]} />
            </div>
        </div>
    )
}
export default Maychu;