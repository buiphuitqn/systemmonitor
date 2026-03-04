import React from "react";
import { notification } from "antd";

export default class Helper {
    static openNotificationWithIcon = (type, message, description) => {
        notification[type]({
            message: message,
            description: description,
            duration: 3,
        });
    }
}