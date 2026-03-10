import React, { useEffect, useState } from "react";
import './style.css';
import { Button, Input, Table, Modal, Form, Popconfirm, Tag, Checkbox, message } from "antd";
import { EditOutlined, DeleteOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
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

const permLabels = [
    { key: 'view', label: 'Xem' },
    { key: 'add', label: 'Thêm' },
    { key: 'edit', label: 'Sửa' },
    { key: 'del', label: 'Xóa' },
    { key: 'cof', label: 'Duyệt' },
    { key: 'print', label: 'In' },
];

const buildMenuTree = (list) => {
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

const Vaitro = () => {
    const { permission } = usePermission();
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();

    // Permission modal
    const [permModalOpen, setPermModalOpen] = useState(false);
    const [permRole, setPermRole] = useState(null);
    const [menuList, setMenuList] = useState([]);
    const [menuTree, setMenuTree] = useState([]);
    const [permData, setPermData] = useState({});
    const [savingPerm, setSavingPerm] = useState(false);

    const columns = [
        {
            title: 'STT',
            width: 60,
            align: 'center',
            render: (text, record, index) => index + 1
        },
        {
            title: 'Tên vai trò',
            dataIndex: 'name',
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
        }
    ];

    if (permission.edit || permission.del) {
        columns.push({
            title: 'Thao tác',
            align: 'center',
            width: 160,
            render: (text, record) => (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    {permission.edit && (
                        <Button type="text" shape="circle" icon={<SafetyCertificateOutlined />}
                            title="Phân quyền menu"
                            style={{ color: '#1890ff' }}
                            onClick={() => handleOpenPerm(record)} />
                    )}
                    {permission.edit && (
                        <Button type="text" shape="circle" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    )}
                    {permission.del && (
                        <Popconfirm
                            title="Xác nhận xóa"
                            description="Bạn có chắc chắn muốn xóa vai trò này?"
                            onConfirm={() => handleDelete(record)}
                            okText="Xóa"
                            cancelText="Hủy"
                        >
                            <Button type="text" danger shape="circle" icon={<DeleteOutlined />} />
                        </Popconfirm>
                    )}
                </div>
            )
        });
    }

    // Permission table columns
    const permColumns = [
        {
            title: 'Menu',
            dataIndex: 'tenMenu',
            render: (text, record) => {
                const level = record.parent_Id ? 1 : 0;
                return (
                    <span style={{ fontWeight: level === 0 ? 600 : 400 }}>
                        {text}
                    </span>
                );
            }
        },
        ...permLabels.map(p => ({
            title: p.label,
            align: 'center',
            width: 70,
            render: (text, record) => (
                <Checkbox
                    checked={permData[record.id]?.[p.key] || false}
                    onChange={(e) => handlePermChange(record.id, p.key, e.target.checked)}
                />
            )
        })),
        {
            title: 'Tất cả',
            align: 'center',
            width: 70,
            render: (text, record) => {
                const allChecked = permLabels.every(p => permData[record.id]?.[p.key]);
                return (
                    <Checkbox
                        checked={allChecked}
                        onChange={(e) => handleToggleAll(record.id, e.target.checked)}
                    />
                );
            }
        }
    ];

    const fetchRoles = () => {
        setLoading(true);
        fetchStart({
            url: "/api/Account/GetRoles",
            method: "GET",
        }).then((response) => {
            if (response.status === 200) {
                setData(response.data);
                applySearch(response.data, searchText);
            }
        }).finally(() => setLoading(false));
    };

    const applySearch = (list, keyword) => {
        if (!keyword || keyword.trim() === '') {
            setFilteredData(list);
        } else {
            const kw = keyword.toLowerCase();
            setFilteredData(list.filter(item =>
                (item.name && item.name.toLowerCase().includes(kw)) ||
                (item.description && item.description.toLowerCase().includes(kw))
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
            Name: record.name,
            Description: record.description,
        });
        setOpenModal(true);
    };

    const handleDelete = (record) => {
        fetchStart({
            url: "/api/Account/DeleteRole",
            method: "DELETE",
            params: { id: record.id },
        }).then((response) => {
            if (response.status === 200 || response.status === 204) {
                fetchRoles();
            }
        });
    };

    const onFinish = async (values) => {
        const isEditing = editingRecord !== null;
        const url = isEditing ? "/api/Account/UpdateRole" : "/api/Account/CreateRole";
        const method = isEditing ? "PUT" : "POST";

        const payload = {
            Name: values.Name,
            Description: values.Description || '',
        };
        if (isEditing) payload.Id = editingRecord.id;

        fetchStart({ url, method, data: payload }).then((response) => {
            if (response.status === 200 || response.status === 201) {
                setOpenModal(false);
                form.resetFields();
                setEditingRecord(null);
                fetchRoles();
            } else if (response.status === 409) {
                alert("Vai trò đã tồn tại!");
            }
        });
    };

    // Permission handlers
    const handleOpenPerm = (role) => {
        setPermRole(role);
        setPermModalOpen(true);
        // Fetch menus
        fetchStart({ url: "/api/Menu/GetAll", method: "GET" }).then((res) => {
            if (res.status === 200) {
                setMenuList(res.data);
                setMenuTree(buildMenuTree(res.data));
                // Fetch existing permissions
                fetchStart({
                    url: "/api/Account/GetMenuPermissions",
                    method: "GET",
                    params: { roleId: role.id }
                }).then((permRes) => {
                    if (permRes.status === 200) {
                        const map = {};
                        // Initialize all menus with false
                        res.data.forEach(m => {
                            map[m.id] = { view: false, add: false, edit: false, del: false, cof: false, print: false };
                        });
                        // Set existing permissions
                        permRes.data.forEach(p => {
                            map[p.menu_Id] = {
                                view: p.view,
                                add: p.add,
                                edit: p.edit,
                                del: p.del,
                                cof: p.cof,
                                print: p.print,
                            };
                        });
                        setPermData(map);
                    }
                });
            }
        });
    };

    const handlePermChange = (menuId, permKey, checked) => {
        setPermData(prev => ({
            ...prev,
            [menuId]: {
                ...prev[menuId],
                [permKey]: checked,
            }
        }));
    };

    const handleToggleAll = (menuId, checked) => {
        const allPerms = {};
        permLabels.forEach(p => { allPerms[p.key] = checked; });
        setPermData(prev => ({
            ...prev,
            [menuId]: allPerms,
        }));
    };

    const handleSavePerm = () => {
        setSavingPerm(true);
        const permissions = Object.entries(permData)
            .filter(([, perms]) => Object.values(perms).some(v => v))
            .map(([menuId, perms]) => ({
                menuId,
                view: perms.view || false,
                add: perms.add || false,
                edit: perms.edit || false,
                del: perms.del || false,
                cof: perms.cof || false,
                print: perms.print || false,
            }));

        fetchStart({
            url: "/api/Account/SaveMenuPermissions",
            method: "POST",
            data: {
                roleId: permRole.id,
                permissions,
            }
        }).then((res) => {
            if (res.status === 200) {
                message.success("Lưu phân quyền thành công!");
                setPermModalOpen(false);
            }
        }).finally(() => setSavingPerm(false));
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    return (
        <div className="vaitro-main">
            <div className="vaitro-header">
                <p>Quản lý vai trò</p>
                {permission.add && (
                    <Button type="primary" onClick={() => {
                        setEditingRecord(null);
                        form.resetFields();
                        setOpenModal(true);
                    }}>Thêm mới</Button>
                )}
            </div>
            <div className="vaitro-search">
                <div>
                    <p>Từ khóa</p>
                    <Search
                        placeholder="Nhập tên vai trò hoặc mô tả"
                        value={searchText}
                        onChange={handleSearch}
                    />
                </div>
            </div>
            <div className="vaitro-content">
                <Table columns={columns} bordered dataSource={filteredData} loading={loading} rowKey="id" />
            </div>

            {/* Add/Edit Role Modal */}
            <Modal
                title={editingRecord ? "Chỉnh sửa vai trò" : "Thêm mới vai trò"}
                open={openModal}
                footer={null}
                onCancel={() => {
                    setOpenModal(false);
                    setEditingRecord(null);
                    form.resetFields();
                }}
            >
                <Form {...layout} form={form} name="role-form" onFinish={onFinish}>
                    <Form.Item name="Name" label="Tên vai trò"
                        rules={[{ required: true, message: 'Vui lòng nhập tên vai trò' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="Description" label="Mô tả">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item {...tailLayout}>
                        <Button type="primary" htmlType="submit">
                            {editingRecord ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Permission Modal */}
            <Modal
                title={`Phân quyền menu — ${permRole?.name || ''}`}
                open={permModalOpen}
                width={800}
                onCancel={() => setPermModalOpen(false)}
                footer={[
                    <Button key="cancel" onClick={() => setPermModalOpen(false)}>Hủy</Button>,
                    <Button key="save" type="primary" loading={savingPerm} onClick={handleSavePerm}>
                        Lưu phân quyền
                    </Button>
                ]}
            >
                <Table
                    columns={permColumns}
                    dataSource={menuTree}
                    rowKey="id"
                    pagination={false}
                    defaultExpandAllRows
                    bordered
                    size="small"
                />
            </Modal>
        </div>
    );
};
export default Vaitro;
