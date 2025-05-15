import React, { useState, useEffect } from "react";
import { Button } from "antd";
import { resizeImage } from "@/utils";
import { STATIC_URL } from "@/constants";

const Tile = ({ tile, onTileClick, onStatusChange }) => {
    const [processedImage, setProcessedImage] = useState(null);
    const { tileId, tileUrl, tileName } = tile;
    const [currentStatus, setCurrentStatus] = useState(tile.status);

    const extractTileUrl = (tileUrl) => {
        const match = tileUrl.match(/projects\/(.+)/);
        return match ? match[1] : null;
    };

    useEffect(() => {
        if (tileUrl) {
            let url = extractTileUrl(tileUrl);
            url = STATIC_URL + `/${url}`;
            resizeImage(url, 0.25, (resizedImage) => {
                setProcessedImage(resizedImage);
            });
        }
    }, [tileUrl]);

    const handleStatusChange = (newStatus) => {
        setCurrentStatus(newStatus);
        onStatusChange(tileId, newStatus);
    };

    return (
        <div className="tile">
            <div className="tile-content" onClick={() => onTileClick(tile.coordinate)}>
                {processedImage ? (
                    <img src={processedImage} alt={tileName} className="tile-image" />
                ) : (
                    <div>Loading...</div>
                )}
                <div className="tile-buttons">
                    {currentStatus === 0 && (
                        <>
                            <Button
                                shape="circle"
                                icon="✔"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(1);
                                }}
                                style={{ marginRight: "18px" }}
                            />
                            <Button
                                shape="circle"
                                icon="✖"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(2);
                                }}
                                style={{ marginLeft: "32px" }}
                            />
                        </>
                    )}
                    {currentStatus === 1 && (
                        <>
                            <Button
                                shape="circle"
                                icon="✖"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(2);
                                }}
                                style={{ marginRight: "18px" }}
                            />
                            <Button
                                shape="circle"
                                icon="↩"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(0);
                                }}
                                style={{ marginLeft: "32px" }}
                            />
                        </>
                    )}
                    {currentStatus === 2 && (
                        <>
                            <Button
                                shape="circle"
                                icon="✔"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(1);
                                }}
                                style={{ marginRight: "18px" }}
                            />
                            <Button
                                shape="circle"
                                icon="↩"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(0);
                                }}
                                style={{ marginLeft: "32px" }}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Tile;
