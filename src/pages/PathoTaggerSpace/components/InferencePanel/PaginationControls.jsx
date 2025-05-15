import React from "react";
import { Pagination } from "antd";

const PaginationControls = ({ currentPage, pageSize, total, onChange, onPageSizeChange }) => (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={onChange}
            showSizeChanger
            onShowSizeChange={(current, size) => onPageSizeChange(size)}
            pageSizeOptions={[ '9', '12', '21']}
        />
    </div>
);

export default PaginationControls;
