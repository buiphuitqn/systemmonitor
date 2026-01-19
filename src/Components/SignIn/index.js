import { Col, Form, Input, Select, Popconfirm, notification, Button, message } from "antd";
import { EditOutlined, SaveOutlined, SettingOutlined } from "@ant-design/icons";
import banner from "../../assets/images/logo.png";
import React, { useEffect, useState } from "react";
import Context from "../../Data/Context";
import "./SignIn.css";
import { useNavigate } from "react-router-dom";
import {
  UserOutlined,
  InfoCircleOutlined,
  KeyOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
} from "@ant-design/icons";

const { Option } = Select;


const SignIn = () => {
  const [form] = Form.useForm();
  const [domain, setDomain] = useState("thaco.com.vn");
  useEffect(() => {
    console.log("SignIn component mounted");
    document.title = "Đăng nhập - Phần mềm quản lý xe";
  }, []);
  const onFinish = (value) => {
    console.log("Form values:", value,domain);
  }
  return (
    <div className="login-page">
      <button className="btnsetting"><SettingOutlined style={{ fontSize: 20 }} /></button>
      <div className="login-box">
        <Form
          name="login-form"
          form={form}
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <div className="Imgtitle card-title">
            <img src={banner} />
          </div>
          <div className="loginimage">
            <p className="form-title">PHẦN MỀM QUẢN LÝ XE</p>
            <p style={{ color: '#fff' }}>Đăng nhập ứng dụng</p>
          </div>

          <div className="form-group">
            <label className="form-label">Tài khoản</label>
            <Form.Item
              initialValue=""
              rules={[{ required: true, message: "Vui lòng nhập tài khoản" }]}
              name="username"
            >
              <div className="input-with-addon">
                <Input
                  placeholder="Nhập tên đăng nhập"
                  type="text"
                  className="addon-input"
                  maxLength={50}
                />
                <Select
                  value={domain}
                  onChange={(e) => setDomain(e)}
                  className="addon-select"
                  bordered={false}
                >
                  <Option value="">Tài khoản</Option>
                  <Option value="thaco.com.vn">@thaco.com.vn</Option>
                </Select>
              </div>
            </Form.Item>
          </div>

          {/* Password Input */}
          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <Form.Item
              initialValue=""
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
              name="password"
            >
              <Input.Password
                placeholder="Nhập mật khẩu"
                className="form-input-standard"
                maxLength={100}
              />
            </Form.Item>
          </div>

          <Form.Item>
            <Button
              type="primary"
              className="login-form-button"
              htmlType="submit"
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default SignIn;