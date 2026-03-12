import React from "react";

import { Button, Select, Input, Table, Modal, Form, Popconfirm, Switch } from "antd";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchStart } from "../../util/CallAPI";
import { usePermission } from "../../Hooks/usePermission";
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
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
            title: t('server.code'),
            dataIndex: 'maServer',
        },
        {
            title: t('server.name'),
            dataIndex: 'tenServer',
        },
        {
            title: t('server.ip'),
            dataIndex: 'diaChiIP',
        },
        {
            title: t('server.username'),
            dataIndex: 'username',
        },
        {
            title: t('server.idrac_version'),
            dataIndex: 'idracVersion',
            width: 150,
        },
        {
            title: t('server.status'),
            dataIndex: 'isActive',
            width: 100,
            align: 'center',
            render: (isActive) => (
                <span style={{ color: isActive ? '#52c41a' : '#ff4d4f', fontWeight: 600 }}>
                    {isActive ? t('server.active') : t('server.inactive')}
                </span>
            )
        },
        (permission.edit || permission.del) && {
            title: t('server.action'),
            align: 'center',
            width: 100,
            render: (text, record) => (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    {permission.edit && <Button type="text" shape="circle" icon={<EditOutlined />} onClick={() => handleEdit(record)} />}
                    {permission.del && <Popconfirm
                        title={t('server.confirm_delete')}
                        description={t('server.confirm_delete_desc')}
                        onConfirm={() => handleDelete(record)}
                        okText={t('server.delete')}
                        cancelText={t('server.cancel')}
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
                <p>{t('server.list')}</p>
                {permission.add && <Button type="primary" onClick={() => {
                    setEditingRecord(null);
                    form.resetFields();
                    if (selectedDonVi) {
                        form.setFieldsValue({ DonVi_Id: selectedDonVi, IsActive: true });
                    } else {
                        form.setFieldsValue({ IsActive: true });
                    }
                    setOpenModal(true);
                }}>{t('server.add')}</Button>}
            </div>
            <div className="maychu-search">
                <div className="maychu-search-left">
                    <p>{t('server.unit')}</p>
                    <Select
                        placeholder={t('server.select_unit')}
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
                    <p>{t('server.keyword')}</p>
                    <Search
                        placeholder={t('server.search_placeholder')}
                        value={searchText}
                        onChange={handleSearch}
                    />
                </div>
            </div>
            <div className="maychu-content">
                <Table columns={columns} bordered dataSource={filteredData} loading={loading} rowKey="id" />
            </div>
            <Modal
                title={editingRecord ? t('server.edit_title') : t('server.add_title')}
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
                        label={t('server.unit')}
                        rules={[{ required: true, message: 'Vui lòng chọn đơn vị' }]}
                    >
                        <Select
                            placeholder={t('server.select_unit')}
                            options={options}
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>
                    <Form.Item
                        name="MaServer"
                        label={t('server.code')}
                        rules={[{ required: true, message: 'Vui lòng nhập mã máy chủ' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="TenServer"
                        label={t('server.name')}
                        rules={[{ required: true, message: 'Vui lòng nhập tên máy chủ' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="DiaChiIP"
                        label={t('server.ip')}
                    >
                        <Input placeholder="VD: 192.168.1.100" />
                    </Form.Item>
                    <Form.Item
                        name="Username"
                        label={t('server.username')}
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
                        label={t('server.idrac_version')}
                    >
                        <Input placeholder="VD: iDRAC 9" />
                    </Form.Item>
                    <Form.Item
                        name="IsActive"
                        label={t('server.status')}
                        valuePropName="checked"
                    >
                        <Switch checkedChildren={t('server.active')} unCheckedChildren={t('server.inactive')} />
                    </Form.Item>
                    <Form.Item {...tailLayout}>
                        <Button type="primary" htmlType="submit">
                            {editingRecord ? t('server.update') : t('server.add')}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
export default Maychu;
