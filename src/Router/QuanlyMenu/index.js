import React, { useEffect, useState } from "react";

import { Button, Input, Table, Modal, Form, Select, Popconfirm, InputNumber, Tag } from "antd";
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

const iconOptions = [
    { label: '🏠 Home', value: 'home' },
    { label: '👤 User', value: 'user' },
    { label: '⚙️ Setting', value: 'setting' },
    { label: '🔗 Share', value: 'share' },
    { label: '🔒 Lock', value: 'lock' },
    { label: '🚪 Logout', value: 'logout' },
    { label: '📋 Menu', value: 'menu' },
];

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
    const clean = (nodes) => {
        nodes.forEach(n => {
            if (n.children.length === 0) delete n.children;
            else clean(n.children);
        });
    };
    clean(roots);
    return roots;
};

const QuanlyMenu = () => {
    const { permission } = usePermission();
    const { t } = useTranslation();
    const [data, setData] = useState([]);
    const [flatData, setFlatData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();

    const columns = [
        {
            title: t('unit.stt'),
            width: 60,
            align: 'center',
            render: (text, record, index) => index + 1
        },
        {
            title: t('menu_mgr.name'),
            dataIndex: 'tenMenu',
            render: (text, record) => {
                const level = getLevel(record, flatData);
                const colors = ['blue', 'green', 'orange', 'purple', 'cyan'];
                return (
                    <span style={{ fontWeight: level === 0 ? 600 : 400 }}>
                        <Tag color={colors[level % colors.length]} style={{ marginRight: 8 }}>{t('content.level')} {level}</Tag>
                        {text}
                    </span>
                );
            }
        },
        {
            title: t('menu_mgr.url'),
            dataIndex: 'url',
        },
        {
            title: t('menu_mgr.icon'),
            dataIndex: 'icon',
            width: 80,
            align: 'center',
        },
        {
            title: t('menu_mgr.order'),
            dataIndex: 'thuTu',
            width: 80,
            align: 'center',
        }
    ];

    if (permission.edit || permission.del) {
        columns.push({
            title: t('user.action'),
            align: 'center',
            width: 100,
            render: (text, record) => (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    {permission.edit && (
                        <Button type="text" shape="circle" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    )}
                    {permission.del && (
                        <Popconfirm
                            title={t('server.confirm_delete')}
                            description={t('menu_mgr.confirm_delete_desc')}
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

    const getLevel = (record, list) => {
        let level = 0;
        let current = record;
        while (current && current.parent_Id) {
            level++;
            current = list.find(item => item.id === current.parent_Id);
        }
        return level;
    };

    const fetchMenus = () => {
        setLoading(true);
        fetchStart({
            url: "/api/Menu/GetAll",
            method: "GET",
        }).then((response) => {
            if (response.status === 200) {
                setFlatData(response.data);
                const tree = buildTreeData(response.data);
                setData(tree);
            }
        }).finally(() => setLoading(false));
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        form.setFieldsValue({
            TenMenu: record.tenMenu,
            Url: record.url,
            Icon: record.icon,
            Parent_Id: record.parent_Id || null,
            ThuTu: record.thuTu,
        });
        setOpenModal(true);
    };

    const handleDelete = (record) => {
        fetchStart({
            url: "/api/Menu",
            method: "DELETE",
            params: { id: record.id },
        }).then((response) => {
            if (response.status === 200 || response.status === 204) {
                fetchMenus();
            }
        });
    };

    const onFinish = async (values) => {
        const isEditing = editingRecord !== null;
        const url = "/api/Menu";
        const method = isEditing ? "PUT" : "POST";

        const payload = {
            TenMenu: values.TenMenu,
            Url: values.Url,
            Icon: values.Icon,
            Parent_Id: values.Parent_Id || null,
            ThuTu: values.ThuTu || 0,
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
                fetchMenus();
            }
        });
    };

    useEffect(() => {
        fetchMenus();
    }, []);

    const parentOptions = flatData
        .filter(item => !item.parent_Id)
        .map(item => ({
            label: item.tenMenu,
            value: item.id,
        }));

    return (
        <div className="quanlymenu-main">
            <div className="quanlymenu-header">
                <p>{t('menu_mgr.list')}</p>
                {permission.add && (
                    <Button type="primary" onClick={() => {
                        setEditingRecord(null);
                        form.resetFields();
                        form.setFieldsValue({ ThuTu: 0 });
                        setOpenModal(true);
                    }}>{t('server.add')}</Button>
                )}
            </div>
            <div className="quanlymenu-content">
                <Table
                    columns={columns}
                    bordered
                    dataSource={data}
                    loading={loading}
                    rowKey="id"
                    defaultExpandAllRows
                    pagination={false}
                />
            </div>
            <Modal
                title={editingRecord ? t('menu_mgr.edit_title') : t('menu_mgr.add_title')}
                open={openModal}
                footer={null}
                onCancel={() => {
                    setOpenModal(false);
                    setEditingRecord(null);
                    form.resetFields();
                }}
            >
                <Form
                    {...layout}
                    form={form}
                    name="menu-form"
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="Parent_Id"
                        label={t('menu_mgr.parent')}
                    >
                        <Select
                            placeholder={t('menu_mgr.no_parent')}
                            options={parentOptions}
                            allowClear
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>
                    <Form.Item
                        name="TenMenu"
                        label={t('menu_mgr.name')}
                        rules={[{ required: true, message: 'Vui lòng nhập tên menu' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="Url"
                        label={t('menu_mgr.url')}
                        rules={[{ required: true, message: 'Vui lòng nhập URL' }]}
                    >
                        <Input placeholder="VD: he-thong/vai-tro" />
                    </Form.Item>
                    <Form.Item
                        name="Icon"
                        label={t('menu_mgr.icon')}
                        rules={[{ required: true, message: 'Vui lòng chọn icon' }]}
                    >
                        <Select
                            placeholder="Chọn icon"
                            options={iconOptions}
                        />
                    </Form.Item>
                    <Form.Item
                        name="ThuTu"
                        label={t('menu_mgr.order')}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
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
export default QuanlyMenu;
