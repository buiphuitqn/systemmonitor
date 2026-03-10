import React, { useEffect, useState } from "react";
import { Layout } from "antd";
import HeaderBar from "../HeaderBar";
import ContentComponent from "../../Router/Content";
import SiderBar from "../SiderBar";
import './style.css';
import Context from "Data/Context";
import { fetchStart } from '../../appRedux/features/common/commonSlice';
import { useDispatch, useSelector } from "react-redux";
import FooterBar from "../FooterBar";
import { Outlet } from "react-router-dom";

const { Content, Footer, Sider } = Layout;

const MainApp = () => {

    const dispatch = useDispatch();
    const { collapsed } = React.useContext(Context);
    const { response: menuList, loading } = useSelector(
        (state) => state.common
    );

    useEffect(() => {
        dispatch(
            fetchStart({
                url: "/api/Menu",
                method: "GET",
                params: {
                    page: 1,
                    pageSize: 20,
                },
                key: 'menuList'
            })
        );
    }, [dispatch]);

    return (
        <Layout className="gx-app-layout">
            <Sider collapsed={collapsed} width={260} style={
                {
                    padding: 0,
                    position: 'sticky',
                }
            }>
                <SiderBar />
            </Sider>
            <Layout>
                <Content style={{ padding: 10 }}>
                    <Outlet />
                </Content>
                <FooterBar />
            </Layout>
        </Layout>
    );
}
export default MainApp;