import React from "react";
import './style.css';
import { Button, Select, Input, Table, Modal, Form, Popconfirm, Switch } from "antd";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchStart } from "../../util/CallAPI";
import { usePermission } from "../../Hooks/usePermission";

const { Search } = Input;

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};
const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
};

const styles = {
    mask: {
        backgroundImage: `linear-gradient(to top, #18181b 0, rgba(21, 21, 22, 0.2) 100%)`,
    }
};

const Maychu = () => {
    const { permission } = usePermission();
    const [options, setOptions] = React.useState([]);
    const [tableData, setTableData] = React.useState([]);
    const [filteredData, setFilteredData] = React.useState([]);
    const [searchText, setSearchText] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [openModal, setOpenModal] = React.useState(false);
    const [editingRecord, setEditingRecord] = React.useState(null);
    const [selectedDonVi, setSelectedDonVi] = React.useState(() => {
        return localStorage.getItem('maychu_selectedDonVi') || null;
    });
    const [form] = Form.useForm();

    const columns = [
        {
            title: 'STT',
            width: 60,
            align: 'center',
            render: (text, record, index) => index + 1
        },
        {
            title: 'Mã máy chủ',
            dataIndex: 'maServer',
        },
        {
            title: 'Tên máy chủ',
            dataIndex: 'tenServer',
        },
        {
            title: 'Địa chỉ IP',
            dataIndex: 'diaChiIP',
        },
        {
            title: 'Username',
            dataIndex: 'username',
        },
        {
            title: 'Phiên bản IDRAC',
            dataIndex: 'idracVersion',
            width: 150,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            width: 100,
            align: 'center',
            render: (isActive) => (
                <span style={{ color: isActive ? '#52c41a' : '#ff4d4f', fontWeight: 600 }}>
                    {isActive ? 'Hoạt động' : 'Ngừng'}
                </span>
            )
        },
        (permission.edit || permission.del) && {
            title: 'Hành động',
            align: 'center',
            width: 100,
            render: (text, record) => (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    {permission.edit && <Button type="text" shape="circle" icon={<EditOutlined />} onClick={() => handleEdit(record)} />}
                    {permission.del && <Popconfirm
                        title="Xác nhận xóa"
                        description="Bạn có chắc chắn muốn xóa máy chủ này?"
                        onConfirm={() => handleDelete(record)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button type="text" danger shape="circle" icon={<DeleteOutlined />} />
                    </Popconfirm>}
                </div>
            )
        }
    ].filter(Boolean);

    const handleEdit = (record) => {
        setEditingRecord(record);
        setOpenModal(true);
        form.setFieldsValue({
            MaServer: record.maServer,
            TenServer: record.tenServer,
            DiaChiIP: record.diaChiIP,
            Username: record.username,
            Password: '',
            IDRACVersion: record.idracVersion || record.idRACVersion,
            IsActive: record.isActive,
            DonVi_Id: record.donVi_Id,
        });
    };

    const handleDelete = (record) => {
        fetchStart({
            url: "/api/Server",
            method: "DELETE",
            params: { id: record.id },
        }).then((response) => {
            if (response.status === 200 || response.status === 204) {
                if (selectedDonVi) fetchServers(selectedDonVi);
            }
        });
    };

    const fetchDonVi = () => {
        fetchStart({
            url: "/api/DonVi/GetAll",
            method: "GET",
        }).then((response) => {
            if (response.status === 200) {
                const mappedOptions = response.data.map(item => ({
                    key: item.id,
                    label: item.tenDonVi,
                    value: item.id,
                }));
                setOptions(mappedOptions);
                // Auto-load servers if saved DonVi exists
                const saved = localStorage.getItem('maychu_selectedDonVi');
                if (saved) {
                    fetchServers(saved);
                }
            }
        });
    };

    const fetchServers = (donViId) => {
        setLoading(true);
        fetchStart({
            url: `/api/Server/GetByDonviId`,
            method: "GET",
            params: { DonViId: donViId },
        }).then((response) => {
            if (response.status === 200 && response.data) {
                setTableData(response.data);
                setFilteredData(response.data);
            } else {
                setTableData([]);
                setFilteredData([]);
            }
        }).finally(() => {
            setLoading(false);
        });
    };

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchText(value);
        if (value.trim() === '') {
            setFilteredData(tableData);
        } else {
            const filtered = tableData.filter(item =>
                (item.tenServer && item.tenServer.toLowerCase().includes(value)) ||
                (item.diaChiIP && item.diaChiIP.toLowerCase().includes(value)) ||
                (item.maServer && item.maServer.toLowerCase().includes(value))
            );
            setFilteredData(filtered);
        }
    };

    const handleSelectDonVi = (value) => {
        setSearchText('');
        setSelectedDonVi(value);
        localStorage.setItem('maychu_selectedDonVi', value);
        fetchServers(value);
    };

    const onFinish = async (values) => {
        const isEditing = editingRecord !== null;
        const url = "/api/Server";
        const method = isEditing ? "PUT" : "POST";

        const payload = {
            MaServer: values.MaServer,
            TenServer: values.TenServer,
            DiaChiIP: values.DiaChiIP,
            Username: values.Username,
            Password: values.Password,
            IDRACVersion: values.IDRACVersion,
            IsActive: values.IsActive ?? true,
            DonVi_Id: values.DonVi_Id,
        };

        if (isEditing) {
            payload.Id = editingRecord.id;
        }

        fetchStart({
            url,
            method,
            data: payload,
        }).then((response) => {
            if (response.status === 200 || response.status === 201) {
                setOpenModal(false);
                form.resetFields();
                setEditingRecord(null);
                if (selectedDonVi) fetchServers(selectedDonVi);
            } else if (response.status === 409) {
                alert("Mã server đã tồn tại!");
            } else {
                console.log(response);
            }
        });
    };

    React.useEffect(() => {
        fetchDonVi();
    }, []);

    return (
        <div className="maychu-main">
            <div className="maychu-header">
                <p>Danh sách máy chủ</p>
                {permission.add && <Button type="primary" onClick={() => {
                    setEditingRecord(null);
                    form.resetFields();
                    if (selectedDonVi) {
                        form.setFieldsValue({ DonVi_Id: selectedDonVi, IsActive: true });
                    } else {
                        form.setFieldsValue({ IsActive: true });
                    }
                    setOpenModal(true);
                }}>Thêm mới</Button>}
            </div>
            <div className="maychu-search">
                <div className="maychu-search-left">
                    <p>Đơn vị</p>
                    <Select
                        placeholder="Chọn đơn vị"
                        options={options}
                        value={selectedDonVi}
                        onChange={handleSelectDonVi}
                        className="maychu-search-select"
                        showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                    />
                </div>
                <div className="maychu-search-right">
                    <p>Từ khóa</p>
                    <Search
                        placeholder="Nhập tên, IP hoặc mã server"
                        value={searchText}
                        onChange={handleSearch}
                    />
                </div>
            </div>
            <div className="maychu-content">
                <Table columns={columns} bordered dataSource={filteredData} loading={loading} rowKey="id" />
            </div>
            <Modal
                title={editingRecord ? "Chỉnh sửa máy chủ" : "Thêm mới máy chủ"}
                open={openModal}
                footer={null}
                styles={styles}
                style={{ top: 20 }}
                onCancel={() => {
                    setOpenModal(false);
                    setEditingRecord(null);
                    form.resetFields();
                }}
            >
                <Form
                    {...layout}
                    form={form}
                    name="server-form"
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="DonVi_Id"
                        label="Đơn vị"
                        rules={[{ required: true, message: 'Vui lòng chọn đơn vị' }]}
                    >
                        <Select
                            placeholder="Chọn đơn vị"
                            options={options}
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>
                    <Form.Item
                        name="MaServer"
                        label="Mã máy chủ"
                        rules={[{ required: true, message: 'Vui lòng nhập mã máy chủ' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="TenServer"
                        label="Tên máy chủ"
                        rules={[{ required: true, message: 'Vui lòng nhập tên máy chủ' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="DiaChiIP"
                        label="Địa chỉ IP"
                    >
                        <Input placeholder="VD: 192.168.1.100" />
                    </Form.Item>
                    <Form.Item
                        name="Username"
                        label="Username (iDRAC)"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="Password"
                        label="Password (iDRAC)"
                    >
                        <Input.Password placeholder={editingRecord ? "Để trống nếu không đổi" : ""} />
                    </Form.Item>
                    <Form.Item
                        name="IDRACVersion"
                        label="Phiên bản iDRAC"
                    >
                        <Input placeholder="VD: iDRAC 9" />
                    </Form.Item>
                    <Form.Item
                        name="IsActive"
                        label="Trạng thái"
                        valuePropName="checked"
                    >
                        <Switch checkedChildren="Hoạt động" unCheckedChildren="Ngừng" />
                    </Form.Item>
                    <Form.Item {...tailLayout}>
                        <Button type="primary" htmlType="submit">
                            {editingRecord ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
export default Maychu;