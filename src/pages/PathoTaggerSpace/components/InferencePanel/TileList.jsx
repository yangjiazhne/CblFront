import React from "react";
import { Row, Col } from "antd";
import Tile from "./Tile";

const TileList = ({ tiles, onTileClick, onStatusChange }) => {
    return (
        <Row justify="center" gutter={[16, 16]}>
            {tiles.map((tile) => (
                <Col span={8} key={tile.tileId} style={{ paddingLeft: "15px" }}>
                    <Tile
                        tile={tile}
                        onTileClick={onTileClick}
                        onStatusChange={onStatusChange}
                    />
                </Col>
            ))}
        </Row>
    );
};

export default TileList;
