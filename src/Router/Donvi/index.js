import React, { useEffect } from "react";
import './style.css';
import { Button, Input, Modal, Table, Form, Upload } from "antd";
import { fetchStart } from '../../util/CallAPI';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';


const { Search } = Input;
const columns = [
    {
        title: 'STT',
        dataIndex: 'stt',
        width: 10,
        render: (text, record, index) => index + 1
    },
    {
        title: 'Tên đơn vị',
        dataIndex: 'tenDonVi',
    },
    {
        title: 'Địa chỉ',
        dataIndex: 'diaChi',
    },
    {
        title: 'Tên đầy dủ',
        dataIndex: 'tenDayDu',
    },
    {
        title: 'Hình ảnh',
        dataIndex: 'logoUrl',
    }
]

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
    const [data, setData] = React.useState([]);
    const [openModelDonvi, setOpenModelDonvi] = React.useState(false);
    const [imageUrl, setImageUrl] = React.useState();
    const [imageFile, setImageFile] = React.useState();
    const [loading, setLoading] = React.useState(false);
    const [form] = Form.useForm();
    const uploadButton = (
        <button style={{ border: 0, background: 'none' }} type="button">
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Upload</div>
        </button>
    );

    const onFinish = async (values) => {

        const formData = new FormData();

        formData.append("MaDonVi", values.MaDonVi);
        formData.append("TenDonVi", values.TenDonVi);
        formData.append("DiaChi", values.DiaChi);
        formData.append("TenDayDu", values.TenDayDu);

        fetchStart({
            url: "/api/DonVi",
            method: "POST",
            body: formData
        })
            .then((response) =>{
                if (response.status === 200) {
                    setOpenModelDonvi(false);
                }
                else 
                    console.log(response)
            })
    }

    useEffect(() => {
        fetchStart({
            url: "/api/DonVi",
            method: "GET",
            params: {
                page: 1,
                pageSize: 20,
            },
        })
            .then((response) => {
                if (response.status === 200) {
                    setData(response.data.list);
                }
            });
    }, [])
    return (
        <div className="donvi-main">
            <div className="donvi-header">
                <p>Danh sách đơn vị</p>
                <Button type="primary" onClick={() => setOpenModelDonvi(true)}>Thêm mới</Button>
            </div>
            <div className="donvi-search">
                <div>
                    <p>Từ khóa</p>
                    <Search placeholder="Nhập từ khóa" />
                </div>
            </div>
            <div className="donvi-content">
                <Table columns={columns} dataSource={data} />
            </div>
            <Modal
                title="Thêm mới đơn vị"
                open={openModelDonvi}
                footer={null}
                styles={styles}
                style={{ top: 20 }}
                onCancel={() => setOpenModelDonvi(false)}
            >
                <Form
                    {...layout}
                    form={form}
                    name="nest-messages"
                    onFinish={(values) => {
                        onFinish(values);
                        setOpenModelDonvi(false);
                    }}
                >
                    <Form.Item
                        name={['MaDonVi']}
                        label="Mã đơn vị"
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
                        label="Tên đơn vị"
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
                        label="Địa chỉ"
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
                        label="Tên đầy đủ"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Hình ảnh"
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