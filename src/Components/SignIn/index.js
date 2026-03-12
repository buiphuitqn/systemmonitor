import { Form, Input, Select, Button } from "antd";
import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import { loginUser } from '../../appRedux/actions/Auth'
import { useDispatch, useSelector } from 'react-redux'
import { getCookieValue } from '../../util/Commons'
import './SignIn.css';

const { Option } = Select;

const SignIn = ({ history }) => {
  const { loader } = useSelector(state => state.auth);
  const [form] = Form.useForm();
  const [domain, setDomain] = useState("thaco.com.vn");
  const dispatch = useDispatch();
  
  useEffect(() => {
    console.log("SignIn component mounted");
    document.title = "Đăng nhập - THACO MONITOR";
  }, []);
  
  useEffect(() => {
    const token = getCookieValue('tokenInfo');
    if (token) {
      window.location.href = '/';
    }
  }, [history]);
  
  const onFinish = (value) => {
    dispatch(loginUser({ ...value, domain, history }));
  }
  
  return (
    <div className="signin-container">
      <div className="signin-content">
        <div className="signin-header">
          <h1 className="signin-logo">THACO SYSTEM MONITOR</h1>
        </div>

        <div className="signin-card">
          <Form
            name="login-form"
            form={form}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
          >
            {/* Tài khoản */}
            <div className="form-group">
              <label className="form-label">Tài khoản</label>
              <Form.Item
                initialValue=""
                rules={[{ required: true, message: "Vui lòng nhập tài khoản" }]}
                name="username"
                className="form-item-no-margin"
              >
                <div className="input-with-addon">
                  <Input
                    placeholder="Tài khoản"
                    type="text"
                    className="addon-input"
                    maxLength={50}
                    bordered={false}
                  />
                  <Select
                    value={domain}
                    onChange={(e) => setDomain(e)}
                    className="addon-select"
                    bordered={false}
                  >
                    <Option value="thaco.com.vn">@thaco.com.vn</Option>
                  </Select>
                </div>
              </Form.Item>
            </div>

            {/* Mật khẩu */}
            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <Form.Item
                initialValue=""
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
                name="password"
                className="form-item-no-margin"
              >
                <Input.Password
                  placeholder="Mật khẩu"
                  className="form-input-standard"
                  maxLength={100}
                  bordered={false}
                />
              </Form.Item>
            </div>

            {/* Button Group */}
            <div className="form-actions">
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  className="signin-button"
                  htmlType="submit"
                  loading={loader}
                  block
                >
                  Đăng nhập
                </Button>
              </Form.Item>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
