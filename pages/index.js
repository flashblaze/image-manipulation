import React, { useState } from 'react';
import { Button, Card, Form, message, InputNumber, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import fetch from 'isomorphic-unfetch';

import './styles.css';

const Index = () => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [xPixels, setXPixels] = useState(0);
  const [yPixels, setYPixels] = useState(0);
  const [uploadLink, setUploadLink] = useState();

  const [form] = Form.useForm();

  const submitProps = {
    onRemove: file => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      return setFileList(newFileList);
    },
    accept: '.jpg,.jpeg,.png',
    multiple: false,
    beforeUpload: file => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };

  const submitForm = values => {
    let formData = new FormData();

    fileList.forEach(file => {
      formData.append('file', file);
    });
    formData.append('xPixels', values.xPixels);
    formData.append('yPixels', values.yPixels);

    setUploading(true);

    const options = {
      method: 'POST',
      body: formData,
    };

    fetch('/api/upload', options)
      .then(res => {
        if (res.status === 500) {
          setUploading(false);
          message.error('Error while uploading');
        } else if (res.status === 404) {
          setUploading(false);
          message.error('Server error');
        } else if (res.status === 403) {
          setUploading(false);
          message.error('Incorrect format');
        } else {
          setFileList([]);
          setUploading(false);
          message.success('Success');
          return res.json();
        }
      })
      .then(data => {
        setUploadLink(data.uploadInfo.link);
      })
      .catch(err => console.error(err));
    form.resetFields();
  };

  return (
    <div>
      <Card title="Image manipulator">
        <Form onFinish={submitForm} form={form}>
          <Form.Item name="uploadFile">
            <Upload {...submitProps}>
              <Button>
                <UploadOutlined />
                Upload a file
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item name="xPixels" label="X Pixels">
            <InputNumber value={xPixels} onChange={e => setXPixels(e)} />
          </Form.Item>
          <Form.Item name="yPixels" label="Y Pixels">
            <InputNumber value={yPixels} onChange={e => setYPixels(e)} />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              disabled={fileList.length === 0}
              loading={uploading}>
              {uploading ? 'Uploading' : 'Submit'}
            </Button>
          </Form.Item>
          {uploadLink ? (
            <Form.Item>
              <Button type="dashed" href={uploadLink} target="_blank">
                Download Image
              </Button>
            </Form.Item>
          ) : null}
        </Form>
      </Card>
    </div>
  );
};

export default Index;
