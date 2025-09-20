import React from 'react';
import { Modal, Result, Button, Typography } from 'antd';
import { ExclamationCircleOutlined, MailOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

interface AccountDisabledModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'disabled' | 'locked';
  message?: string;
  lockedUntil?: string;
  failedAttempts?: number;
}

const AccountDisabledModal: React.FC<AccountDisabledModalProps> = ({
  visible,
  onClose,
  type,
  message,
  lockedUntil,
  failedAttempts
}) => {
  const isDisabled = type === 'disabled';
  const isLocked = type === 'locked';

  const getTitle = () => {
    if (isDisabled) return 'Account Disabled';
    if (isLocked) return 'Account Temporarily Locked';
    return 'Access Denied';
  };

  const getSubTitle = () => {
    if (isDisabled) {
      return 'Your account has been disabled by an administrator';
    }
    if (isLocked) {
      return `Account locked due to ${failedAttempts || 5} failed login attempts`;
    }
    return 'Unable to access your account';
  };

  const getDescription = () => {
    if (message) return message;
    
    if (isDisabled) {
      return 'Your account access has been restricted. This may be due to security concerns or policy violations.';
    }
    
    if (isLocked && lockedUntil) {
      const lockDate = new Date(lockedUntil);
      return `Your account will be automatically unlocked on ${lockDate.toLocaleString()}. You can try logging in again after this time.`;
    }
    
    return 'Please contact support for assistance.';
  };

  const getIcon = () => {
    if (isDisabled) {
      return <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '64px' }} />;
    }
    if (isLocked) {
      return <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '64px' }} />;
    }
    return <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '64px' }} />;
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      closable={false}
      maskClosable={false}
      centered
      width={500}
      styles={{
        body: { padding: '40px 24px' }
      }}
    >
      <Result
        icon={getIcon()}
        title={
          <Text strong style={{ fontSize: '24px', color: '#262626' }}>
            {getTitle()}
          </Text>
        }
        subTitle={
          <Text style={{ fontSize: '16px', color: '#8c8c8c' }}>
            {getSubTitle()}
          </Text>
        }
        extra={[
          <div key="description" style={{ marginBottom: '24px' }}>
            <Paragraph style={{ textAlign: 'center', color: '#595959', fontSize: '14px' }}>
              {getDescription()}
            </Paragraph>
            
            {isLocked && lockedUntil && (
              <div style={{ 
                background: '#fff7e6', 
                border: '1px solid #ffd591', 
                borderRadius: '6px', 
                padding: '12px', 
                marginTop: '16px' 
              }}>
                <Text strong style={{ color: '#d46b08' }}>
                  Locked Until: {new Date(lockedUntil).toLocaleString()}
                </Text>
              </div>
            )}
            
            {isDisabled && (
              <div style={{ 
                background: '#fff2f0', 
                border: '1px solid #ffccc7', 
                borderRadius: '6px', 
                padding: '12px', 
                marginTop: '16px',
                textAlign: 'center'
              }}>
                <MailOutlined style={{ color: '#cf1322', marginRight: '8px' }} />
                <Text style={{ color: '#cf1322' }}>
                  Contact Administrator: admin@frenchlearning.com
                </Text>
              </div>
            )}
          </div>,
          
          <Button 
            key="close" 
            type="primary" 
            size="large"
            onClick={onClose}
            style={{ minWidth: '120px' }}
          >
            {isLocked ? 'Try Again Later' : 'Contact Support'}
          </Button>
        ]}
      />
    </Modal>
  );
};

export default AccountDisabledModal;