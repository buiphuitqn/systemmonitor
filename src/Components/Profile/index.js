import React, { useEffect } from "react";
import { Dropdown, Avatar, message } from "antd";
import { createStyles } from 'antd-style';
import './style.css';
import { logOut } from '../../util/Commons'
import {
    LogoutOutlined,
    UserOutlined
} from "@ant-design/icons";
import { getLocalStorage } from "../../util/Commons";
const useStyles = createStyles(({ token }) => ({
    root: {
        backgroundColor: token.colorFillAlter,
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadius,
    },
}));
const onClick = ({ key }) => {
    if (key === '1') {
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
    const [userdata, setUserData] = React.useState({});
    const { styles } = useStyles();
    const sharedProps = {
        menu: { items, onClick },
        placement: 'bottomLeft',
        classNames: { root: styles.root },
    };

    useEffect(() => {
        setUserData(getLocalStorage('userInfo'))
    }, []);

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
                    <p className="user-name">{userdata.fullName?userdata.fullName:"N/a"}</p>
                    <p className="user-email">{userdata.email?userdata.email:"N/a"}</p>
                </div>
            </div>
        </Dropdown>
    )
}

export default Profile;