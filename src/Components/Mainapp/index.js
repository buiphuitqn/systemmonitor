import React, { useEffect } from "react";
import { Layout } from "antd";
import SideBar from "../SideBar";
import ContentComponent from "../Content";

const { Content, Footer } = Layout;

const MainApp = () => {
    return (
        <Layout className="gx-app-layout">
            <SideBar />
            <ContentComponent/>
        </Layout>
    );
}
export default MainApp;