import React, { useEffect, useState } from "react";
import { Dropdown, Avatar, Modal, Upload, message, Descriptions } from "antd";
import { createStyles } from 'antd-style';
import './style.css';
import { logOut } from '../../util/Commons'
import {
    LogoutOutlined,
    UserOutlined,
    CameraOutlined,
    LoadingOutlined,
} from "@ant-design/icons";
import { getLocalStorage } from "../../util/Commons";
import { fetchStart } from '../../util/CallAPI';
import { BASE_URL_API } from '../../util/Config';

const useStyles = createStyles(({ token }) => ({
    root: {
        backgroundColor: token.colorFillAlter,
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadius,
    },
}));

const objectStyles = info => {
    const { props } = info;
    const isClick = props.trigger?.includes('click');
    if (isClick) {
        return {
            root: {
                borderRadius: '8px',
                color: '#00529C'
            },
        };
    }
    return {};
};

const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
};

const Profile = ({ collapsed }) => {
    const [userdata, setUserData] = useState({});
    const [openModal, setOpenModal] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const { styles } = useStyles();

    const items = [
        {
            key: '1',
            label: 'Thông tin tài khoản',
            icon: <UserOutlined />,
        },
        {
            key: '2',
            label: 'Logout',
            icon: <LogoutOutlined />,
        },
    ];

    const onClick = ({ key }) => {
        if (key === '1') {
            setOpenModal(true);
        }
        if (key === '2') {
            logOut();
        }
    };

    const sharedProps = {
        menu: { items, onClick },
        placement: 'bottomLeft',
        classNames: { root: styles.root },
    };

    useEffect(() => {
        const info = getLocalStorage('userInfo');
        setUserData(info || {});
        if (info?.avatarUrl) {
            setAvatarUrl(`${BASE_URL_API}/${info.avatarUrl}`);
        }
    }, []);

    const handleAvatarUpload = (file) => {
        setAvatarFile(file);
        getBase64(file, (url) => {
            setAvatarUrl(url);
        });
        return false; // Chặn upload tự động
    };

    const handleSaveAvatar = async () => {
        if (!avatarFile) {
            setOpenModal(false);
            return;
        }
        setUploading(true);
        const formData = new FormData();
        formData.append("file", avatarFile);

        try {
            const response = await fetchStart({
                url: "/api/Account/ChangeAvatar",
                method: "POST",
                data: formData,
            });
            if (response.status === 200 || response.status === 201) {
                message.success("Cập nhật avatar thành công!");
                setAvatarFile(null);
                setOpenModal(false);
            } else {
                message.error("Cập nhật avatar thất bại!");
            }
        } catch (err) {
            message.error("Có lỗi xảy ra!");
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <Dropdown
                {...sharedProps}
                styles={objectStyles} trigger={['click']}>
                <div className="profile-main">
                    <Avatar
                        size={36}
                        src={avatarUrl}
                        icon={!avatarUrl ? <UserOutlined /> : null}
                    />
                    {!collapsed && (
                        <div className="profile-content">
                            <p className="user-name">{userdata.fullName ? userdata.fullName : "N/a"}</p>
                            <p className="user-email">{userdata.email ? userdata.email : "N/a"}</p>
                        </div>
                    )}
                </div>
            </Dropdown>

            <Modal
                title="Thông tin tài khoản"
                open={openModal}
                onCancel={() => { setOpenModal(false); setAvatarFile(null); }}
                onOk={handleSaveAvatar}
                okText={uploading ? "Đang lưu..." : "Lưu thay đổi"}
                cancelText="Đóng"
                confirmLoading={uploading}
                width={500}
            >
                <div className="profile-modal-content">
                    <div className="profile-modal-avatar">
                        <Upload
                            showUploadList={false}
                            beforeUpload={handleAvatarUpload}
                            accept="image/*"
                        >
                            <div className="avatar-upload-wrapper">
                                <Avatar
                                    size={100}
                                    src={avatarUrl}
                                    icon={!avatarUrl ? <UserOutlined /> : null}
                                    style={{ backgroundColor: '#00529C' }}
                                />
                                <div className="avatar-overlay">
                                    <CameraOutlined style={{ fontSize: 24, color: '#fff' }} />
                                </div>
                            </div>
                        </Upload>
                        <p className="avatar-hint">Nhấn vào ảnh để thay đổi avatar</p>
                    </div>

                    <Descriptions column={1} bordered size="small" style={{ marginTop: 20 }}>
                        <Descriptions.Item label="Họ và tên">
                            {userdata.fullName || "N/a"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                            {userdata.email || "N/a"}
                        </Descriptions.Item>
                    </Descriptions>
                </div>
            </Modal>
        </>
    )
}

export default Profile;