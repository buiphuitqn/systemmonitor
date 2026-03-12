import React, { useEffect, useState } from "react";

import { Button, Input, Table, Modal, Form, Select, Switch, Popconfirm, Tag, Checkbox, message, Transfer } from "antd";
import { EditOutlined, DeleteOutlined, ApartmentOutlined } from '@ant-design/icons';
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

const Nguoidung = () => {
    const { permission } = usePermission();
    const { t } = useTranslation();
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [roleOptions, setRoleOptions] = useState([]);
    const [form] = Form.useForm();

    // DonVi permission modal
    const [dvModalOpen, setDvModalOpen] = useState(false);
    const [dvUser, setDvUser] = useState(null);
    const [allDonVi, setAllDonVi] = useState([]);
    const [selectedDonViKeys, setSelectedDonViKeys] = useState([]);
    const [savingDv, setSavingDv] = useState(false);

    const columns = [
        {
            title: 'STT',
            width: 60,
            align: 'center',
            render: (text, record, index) => index + 1
        },
        {
            title: t('user.account'),
            dataIndex: 'userName',
        },
        {
            title: t('user.fullname'),
            dataIndex: 'fullName',
        },
        {
            title: t('user.email'),
            dataIndex: 'email',
        },
        {
            title: t('user.role'),
            dataIndex: 'roles',
            render: (roles) => roles?.map((role, i) => (
                <Tag color="blue" key={i}>{role}</Tag>
            ))
        },
        {
            title: t('user.note'),
            dataIndex: 'ghiChu',
        },
        {
            title: t('user.status'),
            dataIndex: 'isActive',
            width: 100,
            align: 'center',
            render: (isActive) => (
                <span style={{ color: isActive ? '#52c41a' : '#ff4d4f', fontWeight: 600 }}>
                    {isActive ? t('user.active') : t('user.locked')}
                </span>
            )
        }
    ];

    if (permission.edit || permission.del) {
        columns.push({
            title: t('user.action'),
            align: 'center',
            width: 140,
            render: (text, record) => (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    {permission.edit && (
                        <Button type="text" shape="circle"
                            icon={<ApartmentOutlined />}
                            title={t('user.unit_permission')}
                            style={{ color: '#1890ff' }}
                            onClick={() => handleOpenDvPerm(record)} />
                    )}
                    {permission.edit && (
                        <Button type="text" shape="circle" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    )}
                    {permission.del && (
                        <Popconfirm
                            title={t('server.confirm_delete')}
                            description={t('user.confirm_delete_desc')}
                            onConfirm={() => handleDelete(record)}
                            okText={t('server.delete')}
                            cancelText={t('server.cancel')}
                        >
                            <Button type="text" danger shape="circle" icon={<DeleteOutlined />} />
                        </Popconfirm>
                    )}
                </div>
            )
        });
    }

    const fetchUsers = () => {
        setLoading(true);
        fetchStart({
            url: "/api/Account",
            method: "GET",
        }).then((response) => {
            if (response.status === 200) {
                setData(response.data);
                applySearch(response.data, searchText);
            }
        }).finally(() => setLoading(false));
    };

    const fetchRoles = () => {
        fetchStart({
            url: "/api/Account/GetRoles",
            method: "GET",
        }).then((response) => {
            if (response.status === 200) {
                setRoleOptions(response.data.map(r => ({
                    label: r.name,
                    value: r.name,
                })));
            }
        });
    };

    const applySearch = (list, keyword) => {
        if (!keyword || keyword.trim() === '') {
            setFilteredData(list);
        } else {
            const kw = keyword.toLowerCase();
            setFilteredData(list.filter(item =>
                (item.userName && item.userName.toLowerCase().includes(kw)) ||
                (item.fullName && item.fullName.toLowerCase().includes(kw)) ||
                (item.email && item.email.toLowerCase().includes(kw))
            ));
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchText(value);
        applySearch(data, value);
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        form.setFieldsValue({
            UserName: record.userName,
            FullName: record.fullName,
            Email: record.email,
            IsActive: record.isActive,
            GhiChu: record.ghiChu,
            RoleNames: record.roles || [],
        });
        setOpenModal(true);
    };

    const handleDelete = (record) => {
        fetchStart({
            url: "/api/Account",
            method: "DELETE",
            params: { id: record.id },
        }).then((response) => {
            if (response.status === 200 || response.status === 204) {
                fetchUsers();
            }
        });
    };

    const onFinish = async (values) => {
        const isEditing = editingRecord !== null;
        const url = "/api/Account";
        const method = isEditing ? "PUT" : "POST";

        const payload = {
            UserName: values.UserName,
            FullName: values.FullName,
            Email: values.Email,
            IsActive: values.IsActive ?? true,
            GhiChu: values.GhiChu || '',
            RoleNames: values.RoleNames || [],
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
                fetchUsers();
            } else if (response.status === 409) {
                alert("Tài khoản hoặc Email đã tồn tại!");
            }
        });
    };

    // DonVi permission handlers
    const handleOpenDvPerm = (user) => {
        setDvUser(user);
        setDvModalOpen(true);
        // Fetch all DonVi
        fetchStart({ url: "/api/DonVi/GetAll", method: "GET" }).then((res) => {
            if (res.status === 200) {
                setAllDonVi(res.data.map(dv => ({
                    key: dv.id,
                    title: dv.tenDonVi,
                })));
                // Fetch user's existing DonVi permissions
                fetchStart({
                    url: "/api/Account/GetDonViPermissions",
                    method: "GET",
                    params: { userId: user.id },
                }).then((permRes) => {
                    if (permRes.status === 200) {
                        setSelectedDonViKeys(permRes.data.map(p => p.donVi_Id));
                    }
                });
            }
        });
    };

    const handleSaveDvPerm = () => {
        setSavingDv(true);
        fetchStart({
            url: "/api/Account/SaveDonViPermissions",
            method: "POST",
            data: {
                userId: dvUser.id,
                donViIds: selectedDonViKeys,
            }
        }).then((res) => {
            if (res.status === 200) {
                message.success("Lưu phân quyền đơn vị thành công!");
                setDvModalOpen(false);
            }
        }).finally(() => setSavingDv(false));
    };

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    return (
        <div className="nguoidung-main">
            <div className="nguoidung-header">
                <p>{t('user.list')}</p>
                {permission.add && (
                    <Button type="primary" onClick={() => {
                        setEditingRecord(null);
                        form.resetFields();
                        form.setFieldsValue({ IsActive: true });
                        setOpenModal(true);
                    }}>{t('server.add')}</Button>
                )}
            </div>
            <div className="nguoidung-search">
                <div>
                    <p>{t('server.keyword')}</p>
                    <Search
                        placeholder={t('user.search_placeholder')}
                        value={searchText}
                        onChange={handleSearch}
                    />
                </div>
            </div>
            <div className="nguoidung-content">
                <Table columns={columns} bordered dataSource={filteredData} loading={loading} rowKey="id" />
            </div>

            {/* Add/Edit User Modal */}
            <Modal
                title={editingRecord ? t('user.edit_title') : t('user.add_title')}
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
                <Form {...layout} form={form} name="user-form" onFinish={onFinish}>
                    <Form.Item name="UserName" label={t('user.account')}
                        rules={[{ required: true, message: 'Vui lòng nhập tài khoản' }]}>
                        <Input disabled={editingRecord !== null} />
                    </Form.Item>
                    <Form.Item name="FullName" label={t('user.fullname')}
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="Email" label={t('user.email')}
                        rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="RoleNames" label={t('user.role')}>
                        <Select mode="multiple" placeholder={t('user.select_role')} options={roleOptions} />
                    </Form.Item>
                    <Form.Item name="GhiChu" label={t('user.note')}>
                        <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="IsActive" label={t('user.status')} valuePropName="checked">
                        <Switch checkedChildren={t('user.active')} unCheckedChildren={t('user.locked')} />
                    </Form.Item>
                    <Form.Item {...tailLayout}>
                        <Button type="primary" htmlType="submit">
                            {editingRecord ? t('server.update') : t('server.add')}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* DonVi Permission Modal */}
            <Modal
                title={`${t('user.unit_permission')} — ${dvUser?.fullName || dvUser?.userName || ''}`}
                open={dvModalOpen}
                width={600}
                onCancel={() => setDvModalOpen(false)}
                footer={[
                    <Button key="cancel" onClick={() => setDvModalOpen(false)}>{t('server.cancel')}</Button>,
                    <Button key="save" type="primary" loading={savingDv} onClick={handleSaveDvPerm}>
                        {t('user.save_permission')}
                    </Button>
                ]}
            >
                <Transfer
                    dataSource={allDonVi}
                    titles={[t('user.unassigned'), t('user.allowed_to_view')]}
                    targetKeys={selectedDonViKeys}
                    onChange={setSelectedDonViKeys}
                    render={item => item.title}
                    showSearch
                    filterOption={(input, item) =>
                        item.title.toLowerCase().includes(input.toLowerCase())
                    }
                    listStyle={{ width: '100%', height: 350 }}
                />
            </Modal>
        </div>
    );
};
export default Nguoidung;
