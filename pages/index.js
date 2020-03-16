import React, { useState } from 'react';
import { Button, Card, Form, message, InputNumber, Radio, Upload } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import fetch from 'isomorphic-unfetch';
import 'antd/dist/antd.css';

import HeadContent from '../components/Head';
import Footer from '../components/Footer/Footer';
import './styles.css';

const Index = () => {
  const [singleImage, setSingleImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadLink, setUploadLink] = useState('');
  const [imgagePreview, setImgagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  const beforeUpload = file => {
    const formData = new FormData();
    formData.append('file', file);
    setSingleImage(file);
    fetch('/api/preview', { method: 'POST', body: formData })
      .then(res => res.json())
      .then(data => {
        form.setFieldsValue({
          width: data.originalWidth,
          height: data.originalHeight,
        });

        if (data.originalFormat === 'jpg' || data.originalFormat === 'jpeg') {
          setImgagePreview('data:image/jpeg;base64,' + data.base64File);
          form.setFieldsValue({ imageFormat: 'jpg' });
        } else {
          form.setFieldsValue({ imageFormat: 'png' });
          setImgagePreview('data:image/png;base64,' + data.base64File);
        }
      });

    const isLessThan2M = file.size / 1024 / 1024 < 2;
    if (!isLessThan2M) {
      message.error('Image must smaller than 2MB!');
      setLoading(false);
      setSingleImage('');
    }
    return isLessThan2M;
  };

  const submitForm = values => {
    setUploadLink('');
    let formData = new FormData();

    formData.append('file', singleImage);
    formData.append('width', values.width);
    formData.append('height', values.height);
    formData.append('imageFormat', values.imageFormat);

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
          setSingleImage('');
          setUploading(false);
          message.success('Success');
          form.resetFields();
          setImgagePreview('');
          setLoading(false);
          return res.json();
        }
      })
      .then(data => {
        setUploadLink(data.uploadInfo.link);
      })
      .catch(err => console.error(err));
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div className="ant-upload-text">Upload</div>
    </div>
  );

  return (
    <div className="container">
      <HeadContent />
      <Card title="Image manipulator">
        <Form
          onFinish={submitForm}
          form={form}
          initialValues={{ imageFormat: 'png' }}>
          <Form.Item name="uploadFile">
            <Upload
              accept=".png,.jpeg,.jpg"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={beforeUpload}>
              {imgagePreview ? (
                <img src={imgagePreview} alt="file" style={{ width: '100%' }} />
              ) : (
                uploadButton
              )}
            </Upload>
          </Form.Item>

          <Form.Item name="width" label="Width" validateFirst={true}>
            <InputNumber />
          </Form.Item>
          <Form.Item name="height" label="Height">
            <InputNumber />
          </Form.Item>

          <Form.Item name="imageFormat" label="Output format">
            <Radio.Group>
              <Radio value="jpg">jpg</Radio>
              <Radio value="png">png</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Button
              className="submitButton"
              type="primary"
              htmlType="submit"
              disabled={singleImage === ''}
              loading={uploading}>
              {uploading ? 'Uploading' : 'Submit'}
            </Button>
          </Form.Item>
          {uploadLink ? (
            <Form.Item>
              <Button type="dashed" href={uploadLink} target="_blank">
                View Image
              </Button>
            </Form.Item>
          ) : null}
        </Form>
      </Card>
      <Footer />
    </div>
  );
};

export default Index;
