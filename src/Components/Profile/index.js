import React from "react";
import { Dropdown, Avatar, message } from "antd";
import { createStyles } from 'antd-style';
import './style.css';
import { logOut } from '../../util/Commons'
import {
    LogoutOutlined,
    UserOutlined
} from "@ant-design/icons";
const useStyles = createStyles(({ token }) => ({
    root: {
        backgroundColor: token.colorFillAlter,
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadius,
    },
}));
const onClick = ({ key }) => {
    if(key === '1') {
        logOut();
    }
};
const items = [
    {
        key: '1',
        label: 'Logout',
        icon: <LogoutOutlined />,
    },
];
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
const Profile = () => {
    const { styles } = useStyles();
    const sharedProps = {
        menu: { items,onClick },
        placement: 'bottomLeft',
        classNames: { root: styles.root },
    };
    return (
        <Dropdown
            {...sharedProps}
            styles={objectStyles} trigger={['click']}>
            <div className="profile-main">
                <Avatar
                    size={36}
                    icon={<UserOutlined />}
                />
                <div className="profile-content">
                    <p className="user-name">Bùi Ngọc Phú</p>
                    <p className="user-email">buingocphu@thaco.com.vn</p>
                </div>
            </div>
        </Dropdown>
    )
}

export default Profile;