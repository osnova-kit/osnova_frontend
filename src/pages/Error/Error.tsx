import { Button } from 'antd';
import { useTranslation } from 'react-i18next';

import PageState from '../../components/PageState/PageState';

const ErrorPage = () => {
  const { t } = useTranslation();

  return (
    <PageState
      kind="error"
      action={
        <Button type="primary" onClick={() => window.location.reload()}>
          {t('state.tryAgain')}
        </Button>
      }
    />
  );
};

export default ErrorPage;
