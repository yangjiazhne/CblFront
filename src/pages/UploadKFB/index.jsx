import { DeleteOutlined, FileZipOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, message, Progress, Tabs, Upload, Spin, Form, Select, Modal } from 'antd'
import React, { useState, useEffect } from 'react'
import {uploadImage, uploadImageFolder} from "@/request/actions/image";

const { Dragger } = Upload

const UploadKFB = () => {
  const [form] = Form.useForm()
  const [txtFile, setTxtFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProcess, setUploadProcess] = useState(0)

  const beforeUpload = file => {
    setTxtFile(file)
    return false
  }

  const readFile = async file => {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve(reader.result)
      }

      reader.onerror = () => {
        reject(reader.error)
      }

      reader.readAsText(file)
    })
  }

  const handleSubmit = async values => {
    // 上传txt文件
    if (!txtFile) {
        message.error('Please choose a txt file')
        return
    }
    setUploading(true)
    const content = await readFile(txtFile)
    const lines = content
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line !== '')
    const total = lines.length
    if (total < 1) {
        Modal.error({
            content: '输入的txt文件中无有效地址',
        })
        setUploading(false)
        return 0
    }


    // 初始化图像和文件夹列表
    const imageList = []
    const folderList = []

    lines.forEach(path => {
        const isFile = path.split('/').pop().includes('.'); // 检查路径的最后一部分是否包含 `.`
        if (isFile) {
            imageList.push(path); // 文件路径
        } else {
            folderList.push(path); // 文件夹路径
        }
    });


      if (folderList.length > 0){
        try {
            const responses = await Promise.all(
                folderList.map(line => 
                    // console.log(line)
                    uploadImageFolder({
                        imageFolderUrl: line,
                        imageGroupId:1,
                        imageTypeId:3
                    })
                )
            );
        } catch (error) {
            message.error("上传失败")
        }
    }

    if (imageList.length > 0){
        const res = await uploadImage({
            imageUrls: imageList,
            imageGroupId:"1",
            imageTypeId:"3"
        })
        // console.log(imageList)
        if(res.err){
            message.error("上传失败")
        }
    }

    setUploading(false)

    message.success("数据上传成功")
  }


  return (
    <div style={{ margin: '200px auto', width: '500px', textAlign: 'center' }}>
        <Form
            form={form}
            layout="vertical"
            style={{ textAlign: 'center' }}
            initialValues={{ imageType: 'normal' }}
            onFinish={handleSubmit}
        >
            <div style={{ marginBottom: '15px' }}>
                <div style={{ opacity: '0.7', fontSize: '17px' }}>
                    {"请上传一个文本文件, 根据行数生成数据个数, 文本文件的每行为图片的绝对路径或图片所在文件夹的绝对路径"}
                </div>
                <Dragger
                    beforeUpload={beforeUpload}
                    showUploadList={true}
                    maxCount={1} 
                    accept=".txt"
                >
                    <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                    </p>
                    <p className="ant-upload-text">点击或拖拽文件到此区域</p>
                </Dragger>
            </div>
        </Form>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {(uploading || uploadProcess > 0) && (
            <Progress
                percent={Number(uploadProcess.toFixed(2))}
                style={{ width: '400px', margin: 'auto' }}
            />
            )}
            {
                uploading && (
                    <Spin tip={"文件正在解析到数据库"} style={{margin: '20px auto'}}></Spin>
                )
            }
            <Button
                style={{ width: '200px', margin: '20px auto' }}
                type="primary"
                disabled={uploading}
                onClick={() => form.submit()}
                >
                上传
            </Button>
        </div>
    </div>
  )
}

export default UploadKFB
