import React, { useEffect, useState } from "react";
import ContextProvider from "Data/Context";
import { useTranslation } from "react-i18next";
import { Dropdown, Avatar, Modal, Upload, message, Descriptions } from "antd";
import { createStyles } from 'antd-style';
import { logOut } from '../../util/Commons'
import {
    LogoutOutlined,
    UserOutlined,
    CameraOutlined,
    LoadingOutlined,
    MoonOutlined,
    SunOutlined,
    TranslationOutlined,
    CheckOutlined
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
    const { theme, setTheme } = React.useContext(ContextProvider);
    const { t, i18n } = useTranslation();
    const [userdata, setUserData] = useState({});
    const [openModal, setOpenModal] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const { styles } = useStyles();

    const items = [
        {
            key: '1',
            label: t('profile.account_info', 'Thông tin tài khoản'),
            icon: <UserOutlined />,
        },
        {
            key: 'theme_menu',
            label: t('profile.theme', 'Giao diện'),
            icon: theme === 'dark' ? <MoonOutlined /> : <SunOutlined />,
            children: [
                {
                    key: 'theme_light',
                    label: (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 100 }}>
                            <span>{t('profile.light', 'Sáng')}</span>
                            {theme === 'light' && <CheckOutlined style={{ color: '#1890ff' }} />}
                        </div>
                    ),
                    icon: <SunOutlined />,
                },
                {
                    key: 'theme_dark',
                    label: (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 100 }}>
                            <span>{t('profile.dark', 'Tối')}</span>
                            {theme === 'dark' && <CheckOutlined style={{ color: '#1890ff' }} />}
                        </div>
                    ),
                    icon: <MoonOutlined />,
                }
            ]
        },
        {
            key: 'lang_menu',
            label: t('profile.language', 'Ngôn ngữ'),
            icon: <TranslationOutlined />,
            children: [
                {
                    key: 'lang_vi',
                    label: (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 100 }}>
                            <span>{t('profile.vi', 'Tiếng Việt')}</span>
                            {i18n.language.startsWith('vi') && <CheckOutlined style={{ color: '#1890ff' }} />}
                        </div>
                    ),
                },
                {
                    key: 'lang_en',
                    label: (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 100 }}>
                            <span>{t('profile.en', 'Tiếng Anh')}</span>
                            {i18n.language.startsWith('en') && <CheckOutlined style={{ color: '#1890ff' }} />}
                        </div>
                    ),
                }
            ]
        },
        {
            type: 'divider',
        },
        {
            key: '2',
            label: t('profile.logout', 'Logout'),
            icon: <LogoutOutlined />,
            danger: true
        },
    ];

    const onClick = ({ key }) => {
        if (key === '1') {
            setOpenModal(true);
        } else if (key === 'theme_light') {
            setTheme('light');
            window.localStorage.setItem('theme', 'light');
        } else if (key === 'theme_dark') {
            setTheme('dark');
            window.localStorage.setItem('theme', 'dark');
        } else if (key === 'lang_vi') {
            i18n.changeLanguage('vi');
        } else if (key === 'lang_en') {
            i18n.changeLanguage('en');
        } else if (key === '2') {
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
