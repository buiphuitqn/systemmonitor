import React, { useEffect } from "react";

import { Button, Input, Modal, Table, Form, Upload, Image, Popconfirm, Select, Tag } from "antd";
import { fetchStart } from '../../util/CallAPI';
import { usePermission } from '../../Hooks/usePermission';
import { PlusOutlined, LoadingOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { BASE_URL_API } from '../../util/Config';
import { useTranslation } from 'react-i18next';


const { Search } = Input;

const styles = {
    mask: {
        backgroundImage: `linear-gradient(to top, #18181b 0, rgba(21, 21, 22, 0.2) 100%)`,
    }
};

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};
const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
};

const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
};
const Donvi = () => {
    const { permission } = usePermission();
    const { t } = useTranslation();
    const [data, setData] = React.useState([]);
    const [filteredData, setFilteredData] = React.useState([]);
    const [searchText, setSearchText] = React.useState('');
    const [openModelDonvi, setOpenModelDonvi] = React.useState(false);
    const [imageUrl, setImageUrl] = React.useState();
    const [imageFile, setImageFile] = React.useState();
    const [loading, setLoading] = React.useState(false);
    const [editingRecord, setEditingRecord] = React.useState(null);
    const [parentList, setParentList] = React.useState([]);
    const [form] = Form.useForm();
    const uploadButton = (
        <button style={{ border: 0, background: 'none' }} type="button">
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Upload</div>
        </button>
    );

    const fetchParentList = () => {
        fetchStart({
            url: "/api/DonVi/GetAll",
            method: "GET",
        }).then((response) => {
            if (response.status === 200) {
                setParentList(response.data);
            }
        });
    };

    const handleEdit = (record) => {
        console.log(record);
        setEditingRecord(record);
        fetchParentList();
        setOpenModelDonvi(true);
        form.setFieldsValue({
            MaDonVi: record.maDonVi,
            TenDonVi: record.tenDonVi,
            DiaChi: record.diaChi,
            TenDayDu: record.tenDayDu,
            Parent_Id: record.parent_Id || undefined,
        });
        setImageUrl(record.logoUrl ? `${BASE_URL_API}${record.logoUrl}` : null);
    }

    const handleDelete = (record) => {
        fetchStart({
            url: "/api/DonVi",
            method: "DELETE",
            params: {
                id: record.id,
            },
        })
            .then((response) => {
                if (response.status === 200 || response.status === 204) {
                    fetchDonVi();
                }
            });
    }

    const columns = [
        {
            title: t('unit.stt'),
            dataIndex: 'stt',
            width: 10,
            align: 'center',
            render: (text, record, index) => index + 1
        },
        {
            title: t('unit.name'),
            dataIndex: 'tenDonVi',
            render: (text, record) => {
                const level = record.level || 0;
                const colors = ['blue', 'green', 'orange', 'purple', 'cyan'];
                const tagColor = colors[level % colors.length];
                return (
                    <span style={{ fontWeight: level === 0 ? 600 : 400 }}>
                        <Tag color={tagColor} style={{ marginRight: 8 }}>{t('content.level')} {level}</Tag>
                        {text}
                    </span>
                );
            }
        },
        {
            title: t('unit.address'),
            dataIndex: 'diaChi',
        },
        {
            title: t('unit.full_name'),
            dataIndex: 'tenDayDu',
        },
        {
            title: t('unit.image'),
            dataIndex: 'logoUrl',
            align: 'center',
            width: 120,
            render: (logoUrl) => logoUrl ? (
                <Image
                    src={`${BASE_URL_API}${logoUrl}`}
                    alt="logo"
                    width={60}
                    style={{ objectFit: 'contain' }}
                />
            ) : null
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
                        description={t('unit.confirm_delete_desc')}
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

    const buildTreeData = (list) => {
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
        // Xóa children rỗng để Table không hiện expand icon
        const cleanEmpty = (nodes) => {
            nodes.forEach(node => {
                if (node.children.length === 0) {
                    delete node.children;
                } else {
                    cleanEmpty(node.children);
                }
            });
        };
        cleanEmpty(roots);
        return roots;
    };

    const fetchDonVi = () => {
        fetchStart({
            url: "/api/DonVi",
            method: "GET",
            params: {
                page: 1,
                pageSize: 200,
            },
        })
            .then((response) => {
                if (response.status === 200) {
                    setData(response.data.list);
                    setFilteredData(buildTreeData(response.data.list));
                }
            });
    };

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchText(value);
        if (value.trim() === '') {
            setFilteredData(buildTreeData(data));
        } else {
            const filtered = data.filter(item =>
                (item.tenDonVi && item.tenDonVi.toLowerCase().includes(value)) ||
                (item.diaChi && item.diaChi.toLowerCase().includes(value)) ||
                (item.tenDayDu && item.tenDayDu.toLowerCase().includes(value))
            );
            setFilteredData(buildTreeData(filtered));
        }
    };

    const onFinish = async (values) => {

        const formData = new FormData();

        formData.append("MaDonVi", values.MaDonVi);
        formData.append("TenDonVi", values.TenDonVi);
        formData.append("DiaChi", values.DiaChi);
        formData.append("TenDayDu", values.TenDayDu);

        if (values.Parent_Id) {
            formData.append("Parent_Id", values.Parent_Id);
        }

        // Gửi file ảnh nếu có (backend nhận bằng IFormFile file)
        if (imageFile) {
            formData.append("file", imageFile);
        }

        // Phân biệt chế độ Sửa vs Thêm mới
        const isEditing = editingRecord !== null;
        const url = isEditing ? "/api/DonVi/SuaDonVi" : "/api/DonVi/ThemDonVi";
        const method = isEditing ? "PUT" : "POST";

        if (isEditing) {
            formData.append("Id", editingRecord.id);
        }

        fetchStart({
            url,
            method,
            data: formData
        })
            .then((response) => {
                if (response.status === 200 || response.status === 201) {
                    setOpenModelDonvi(false);
                    form.resetFields();
                    setImageUrl(null);
                    setImageFile(null);
                    setEditingRecord(null);
                    fetchDonVi();
                } else if (response.status === 409) {
                    alert("Mã đơn vị đã tồn tại!");
                } else {
                    console.log(response);
                }
            })
    }

    useEffect(() => {
        fetchDonVi();
    }, [])
    return (
        <div className="donvi-main">
            <div className="donvi-header">
                <p>{t('unit.list')}</p>
                {permission.add && <Button type="primary" onClick={() => {
                    setEditingRecord(null);
                    form.resetFields();
                    setImageUrl(null);
                    setImageFile(null);
                    fetchParentList();
                    setOpenModelDonvi(true);
                }}>{t('server.add')}</Button>}
            </div>
            <div className="donvi-search">
                <div>
                    <p>{t('server.keyword')}</p>
                    <Search
                        placeholder={t('unit.search_placeholder')}
                        value={searchText}
                        onChange={handleSearch}
                    />
                </div>
            </div>
            <div className="donvi-content">
                <Table
                    columns={columns}
                    bordered
                    dataSource={filteredData}
                    rowKey="id"
                    defaultExpandAllRows
                    pagination={false}
                    rowClassName={(record) => `donvi-level-${record.level || 0}`}
                />
            </div>
            <Modal
                title={editingRecord ? t('unit.edit_title') : t('unit.add_title')}
                open={openModelDonvi}
                footer={null}
                styles={styles}
                style={{ top: 20 }}
                onCancel={() => {
                    setOpenModelDonvi(false);
                    setEditingRecord(null);
                    form.resetFields();
                    setImageUrl(null);
                    setImageFile(null);
                }}
            >
                <Form
                    {...layout}
                    form={form}
                    name="nest-messages"
                    onFinish={onFinish}
                >
                    <Form.Item
                        name={['MaDonVi']}
                        label={t('unit.code')}
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name={['TenDonVi']}
                        label={t('unit.name')}
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name={['DiaChi']}
                        label={t('unit.address')}
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name={['TenDayDu']}
                        label={t('unit.full_name')}
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name={['Parent_Id']}
                        label={t('unit.parent')}
                    >
                        <Select
                            allowClear
                            placeholder={t('unit.select_parent')}
                            options={parentList
                                .filter(item => !editingRecord || item.id !== editingRecord.id)
                                .map(item => ({
                                    value: item.id,
                                    label: item.tenDonVi,
                                }))}
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>
                    <Form.Item
                        label={t('unit.image')}
                    >
                        <Upload
                            listType="picture-card"
                            showUploadList={false}
                            beforeUpload={(file) => {
                                setImageFile(file);
                                getBase64(file, (url) => {
                                    setImageUrl(url);
                                });
                                return false; // chặn upload tự động
                            }}
                        >
                            {imageUrl ? (
                                <img draggable={false} src={imageUrl} alt="avatar" style={{ width: '100%' }} />
                            ) : (
                                uploadButton
                            )}
                        </Upload>
                    </Form.Item>
                    <Form.Item {...tailLayout}>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}
export default Donvi;
