import React from "react";
import { Button } from "antd";
import { RightOutlined } from "@ant-design/icons";

const PanelHeader = ({ toggleVisibility }) => (
    <div
        style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 20px",
            borderBottom: "1px solid #ccc",
            backgroundColor: "#f5f5f5",
        }}
    >
        <h4 style={{ margin: 0 }}>相关信息</h4>
        <Button
            type="text"
            shape="circle"
            icon={<RightOutlined />}
            onClick={toggleVisibility}
            style={{
                fontSize: "16px",
                color: "#000",
                backgroundColor: "transparent",
                border: "none",
            }}
        />
    </div>
);

export default PanelHeader;
