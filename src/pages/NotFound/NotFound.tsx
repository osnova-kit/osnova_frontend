import { useTranslation } from 'react-i18next';

import PageState from '../../components/PageState/PageState';
import Seo from '../../components/Seo/Seo';

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <>
      <Seo title={t('state.notFoundTitle')} noindex />
      <PageState kind="not-found" />
    </>
  );
};

export default NotFound;
