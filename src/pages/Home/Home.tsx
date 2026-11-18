import {
  CheckCircleFilled,
  CloseCircleFilled,
  GithubOutlined,
  ReadOutlined,
} from '@ant-design/icons';
import { Button, Space, Tag, Typography } from 'antd';
import { Trans, useTranslation } from 'react-i18next';

import type { BootstrapFeatures } from '../../api/bootstrap';
import Seo from '../../components/Seo/Seo';
import { useBootstrapStore } from '../../store/bootstrapStore';
import { API_DOCS_URL, GITHUB_BACKEND_URL, GITHUB_FRONTEND_URL } from '../../utils/constants';
import './Home.css';

const { Title, Paragraph, Text } = Typography;

const FEATURES: (keyof BootstrapFeatures)[] = [
  'authentication',
  'admin',
  'files',
  'notifications',
  'background_tasks',
];

const PROFILE_TITLES = {
  minimal: 'Minimal',
  standard: 'Standard',
  scalable: 'Scalable',
} as const;

const Logo = () => (
  <svg
    className="osnova-logo"
    width="80"
    height="80"
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Osnova"
  >
    <rect width="64" height="64" rx="14" fill="#1e1b4b" />
    <circle cx="32" cy="26" r="11.5" fill="none" stroke="#fb923c" strokeWidth="7" />
    <path
      d="M14.5 43.5V50.5H49.5V43.5"
      fill="none"
      stroke="#a78bfa"
      strokeWidth="5.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HomePage = () => {
  const { t } = useTranslation('home');
  const config = useBootstrapStore((state) => state.config);
  const features = config?.features;
  const profile = config?.profile ?? 'minimal';

  const enabledCount = features ? Object.values(features).filter(Boolean).length : 0;

  return (
    <>
      <Seo page="home" />
      <div className="welcome">
        <div className="welcome-hero">
          <Logo />

          <div className="welcome-badges">
            <Tag color="purple" className="welcome-profile-tag">
              {t('profile', { name: PROFILE_TITLES[profile] })}
            </Tag>
            {config && <Tag className="welcome-version-tag">v{config.application.version}</Tag>}
          </div>

          <Title level={1} className="welcome-title">
            Osnova
          </Title>

          <Paragraph className="welcome-tagline">{t('tagline')}</Paragraph>

          <Paragraph className="welcome-description">
            {t(`profiles.${profile}`)} {t('capabilitiesNote')}
          </Paragraph>

          <Space size="middle" wrap className="welcome-actions">
            {config?.api_docs && (
              <Button
                type="primary"
                size="large"
                icon={<ReadOutlined />}
                href={API_DOCS_URL}
                target="_blank"
                rel="noreferrer"
              >
                {t('apiDocs')}
              </Button>
            )}
            <Button
              size="large"
              icon={<GithubOutlined />}
              href={GITHUB_BACKEND_URL}
              target="_blank"
              rel="noreferrer"
            >
              Backend
            </Button>
            <Button
              size="large"
              icon={<GithubOutlined />}
              href={GITHUB_FRONTEND_URL}
              target="_blank"
              rel="noreferrer"
            >
              Frontend
            </Button>
          </Space>
        </div>

        <div className="welcome-panel">
          <div className="welcome-panel-head">
            <Text strong>{t('featuresTitle')}</Text>
            <Text type="secondary">
              {t('featuresCount', {
                count: enabledCount,
                total: FEATURES.length,
              })}
            </Text>
          </div>

          <ul className="welcome-features">
            {FEATURES.map((key) => {
              const enabled = Boolean(features?.[key]);
              return (
                <li key={key} className={`welcome-feature ${enabled ? 'is-on' : 'is-off'}`}>
                  {enabled ? (
                    <CheckCircleFilled className="welcome-feature-icon" />
                  ) : (
                    <CloseCircleFilled className="welcome-feature-icon" />
                  )}
                  <span>{t(`features.${key}`)}</span>
                </li>
              );
            })}
          </ul>

          {enabledCount === 0 && (
            <div className="welcome-hint">
              <Text type="secondary">
                <Trans t={t} i18nKey="allDisabled" components={{ code: <code /> }} />
              </Text>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HomePage;
